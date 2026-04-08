import './style.css';
import { initTheme } from './theme';
import {
  EXPORT_DPI,
  PNG_MAX_DIMENSION_PX,
} from './constants';
import { CropEditor, pxPerMmFromDpi } from './cropEditor';
import { drawSheet } from './drawSheet';
import { buildSheetPdf, downloadBytes } from './exportPdf';
import { computeLayout } from './layout';
import {
  CUSTOM_PAPER_ID,
  DEFAULT_PAPER_ID,
  MAX_PAPER_MM,
  getPaperPresetById,
  paperGroupsOrdered,
  type PaperPreset,
} from './paperPresets';
import {
  CUSTOM_SLOT_ID,
  DEFAULT_SLOT_PRESET_ID,
  getSlotPresetById,
  MAX_SLOT_MM,
  SLOT_PRESETS,
} from './slotPresets';

const PREVIEW_TARGET_LONG_PX = 520;

const paperSelect = document.querySelector<HTMLSelectElement>('#paper-preset')!;
const paperCustomRow = document.querySelector('#paper-custom-row')!;
const paperWidthInput = document.querySelector<HTMLInputElement>('#paper-width-mm')!;
const paperHeightInput = document.querySelector<HTMLInputElement>('#paper-height-mm')!;
const slotPresetSelect = document.querySelector<HTMLSelectElement>('#slot-preset')!;
const slotWidthInput = document.querySelector<HTMLInputElement>('#slot-width-mm')!;
const slotHeightInput = document.querySelector<HTMLInputElement>('#slot-height-mm')!;
const swapSlotBtn = document.querySelector<HTMLButtonElement>('#swap-slot-dims')!;
const fileInput = document.querySelector<HTMLInputElement>('#file-input')!;
const cropCard = document.querySelector('#crop-card')!;
const sheetCard = document.querySelector('#sheet-card')!;
const cropCanvas = document.querySelector<HTMLCanvasElement>('#crop-canvas')!;
const sheetCanvas = document.querySelector<HTMLCanvasElement>('#sheet-canvas')!;
const zoomRange = document.querySelector<HTMLInputElement>('#zoom-range')!;
const zoomValue = document.querySelector('#zoom-value')!;
const confirmCropBtn = document.querySelector<HTMLButtonElement>('#confirm-crop')!;
const marginInput = document.querySelector<HTMLInputElement>('#margin-mm')!;
const gapInput = document.querySelector<HTMLInputElement>('#gap-mm')!;
const layoutSummary = document.querySelector('#layout-summary')!;
const settingsHint = document.querySelector('#settings-hint')!;
const downloadPngBtn = document.querySelector<HTMLButtonElement>('#download-png')!;
const downloadPdfBtn = document.querySelector<HTMLButtonElement>('#download-pdf')!;
const pngHint = document.querySelector('#png-hint')!;

const cropEditor = new CropEditor(cropCanvas);

let sourceImage: HTMLImageElement | null = null;
let croppedTile: HTMLCanvasElement | null = null;

function populatePaperSelect(): void {
  for (const { group, presets } of paperGroupsOrdered()) {
    const og = document.createElement('optgroup');
    og.label = group;
    for (const p of presets) {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.label;
      og.appendChild(o);
    }
    paperSelect.appendChild(og);
  }
  const customPaperOpt = document.createElement('option');
  customPaperOpt.value = CUSTOM_PAPER_ID;
  customPaperOpt.textContent = 'カスタム（幅・高さをmm指定）';
  paperSelect.appendChild(customPaperOpt);
  paperSelect.value = DEFAULT_PAPER_ID;
}

function populateSlotPresetSelect(): void {
  for (const s of SLOT_PRESETS) {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = s.label;
    slotPresetSelect.appendChild(o);
  }
  const custom = document.createElement('option');
  custom.value = CUSTOM_SLOT_ID;
  custom.textContent = 'カスタム（下の数値）';
  slotPresetSelect.appendChild(custom);
  slotPresetSelect.value = DEFAULT_SLOT_PRESET_ID;
}

function clampPaperMm(n: number): number {
  if (!Number.isFinite(n)) return 10;
  return Math.min(MAX_PAPER_MM, Math.max(10, Math.round(n)));
}

function readCustomPaperMm(): { w: number; h: number } {
  return {
    w: clampPaperMm(Number(paperWidthInput.value)),
    h: clampPaperMm(Number(paperHeightInput.value)),
  };
}

function isCustomPaper(): boolean {
  return paperSelect.value === CUSTOM_PAPER_ID;
}

function updatePaperCustomUi(): void {
  paperCustomRow.classList.toggle('hidden', !isCustomPaper());
}

function getSelectedPaper(): PaperPreset {
  if (isCustomPaper()) {
    const { w, h } = readCustomPaperMm();
    return {
      id: 'custom',
      label: `カスタム（${w}×${h}mm）`,
      widthMm: w,
      heightMm: h,
      group: 'custom',
    };
  }
  const p = getPaperPresetById(paperSelect.value);
  if (p) return p;
  return getPaperPresetById(DEFAULT_PAPER_ID)!;
}

function isCustomSlot(): boolean {
  return slotPresetSelect.value === CUSTOM_SLOT_ID;
}

function clampSlotMm(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_SLOT_MM, Math.max(0.5, n));
}

function readSlotMm(): { w: number; h: number } {
  const w = clampSlotMm(Number(slotWidthInput.value));
  const h = clampSlotMm(Number(slotHeightInput.value));
  return { w, h };
}

function setSlotInputsReadonly(readonly: boolean): void {
  slotWidthInput.readOnly = readonly;
  slotHeightInput.readOnly = readonly;
  slotWidthInput.classList.toggle('input-readonly', readonly);
  slotHeightInput.classList.toggle('input-readonly', readonly);
}

function applySlotPresetToInputs(): void {
  const id = slotPresetSelect.value;
  if (id === CUSTOM_SLOT_ID) {
    setSlotInputsReadonly(false);
    return;
  }
  const preset = getSlotPresetById(id);
  if (preset) {
    slotWidthInput.value = String(preset.widthMm);
    slotHeightInput.value = String(preset.heightMm);
    setSlotInputsReadonly(true);
  }
}

function previewPxPerMm(paperW: number, paperH: number): number {
  const longMm = Math.max(paperW, paperH, 1);
  const raw = PREVIEW_TARGET_LONG_PX / longMm;
  return Math.min(10, Math.max(0.2, raw));
}

function canExportPng(paper: PaperPreset): boolean {
  const px = pxPerMmFromDpi(EXPORT_DPI);
  const pw = Math.ceil(paper.widthMm * px);
  const ph = Math.ceil(paper.heightMm * px);
  return pw <= PNG_MAX_DIMENSION_PX && ph <= PNG_MAX_DIMENSION_PX;
}

function updatePngUi(): void {
  const paper = getSelectedPaper();
  const ok = canExportPng(paper);
  const hasTile = croppedTile !== null;
  downloadPngBtn.disabled = !ok || !hasTile;
  if (!hasTile) {
    pngHint.classList.add('hidden');
    pngHint.textContent = '';
    return;
  }
  if (!ok) {
    pngHint.textContent =
      'この用紙サイズでは 300dpi の PNG は辺が 8192px を超えるため出力できません。PDF をご利用ください。';
    pngHint.classList.remove('hidden');
  } else {
    pngHint.classList.add('hidden');
    pngHint.textContent = '';
  }
}

function show(el: Element, visible: boolean): void {
  el.classList.toggle('hidden', !visible);
}

function invalidateCrop(showSettingsHint: boolean): void {
  croppedTile = null;
  show(sheetCard, false);
  if (showSettingsHint && sourceImage) {
    show(settingsHint, true);
    show(cropCard, true);
  } else if (!showSettingsHint) {
    show(settingsHint, false);
  }
  updatePngUi();
}

function currentLayout() {
  const margin = Number(marginInput.value) || 0;
  const gap = Number(gapInput.value) || 0;
  const paper = getSelectedPaper();
  const { w, h } = readSlotMm();
  return computeLayout(margin, gap, w, h, paper.widthMm, paper.heightMm);
}

function redrawSheetPreview(): void {
  if (!croppedTile) return;
  const layout = currentLayout();
  const paper = getSelectedPaper();
  const px = previewPxPerMm(paper.widthMm, paper.heightMm);
  const cw = paper.widthMm * px;
  const ch = paper.heightMm * px;
  sheetCanvas.width = Math.round(cw);
  sheetCanvas.height = Math.round(ch);
  const ctx = sheetCanvas.getContext('2d');
  if (!ctx) return;
  drawSheet(
    ctx,
    layout,
    croppedTile,
    paper.widthMm,
    paper.heightMm,
    px,
  );
  layoutSummary.textContent = `用紙 ${paper.widthMm}×${paper.heightMm}mm / 切り抜き ${layout.slotW}×${layout.slotH}mm → ${layout.cols} 列 × ${layout.rows} 行 ＝ 計 ${layout.count} 枚`;
  updatePngUi();
}

function syncCropEditorSlot(): void {
  const { w, h } = readSlotMm();
  cropEditor.setSlotMm(w, h);
}

function onFile(file: File): void {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    sourceImage = img;
    invalidateCrop(false);
    syncCropEditorSlot();
    cropEditor.setImage(img);
    show(cropCard, true);
    show(settingsHint, false);
    updatePngUi();
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    alert('画像の読み込みに失敗しました');
  };
  img.src = url;
}

populatePaperSelect();
updatePaperCustomUi();
populateSlotPresetSelect();
applySlotPresetToInputs();
syncCropEditorSlot();
updatePngUi();

paperSelect.addEventListener('change', () => {
  updatePaperCustomUi();
  syncCropEditorSlot();
  if (croppedTile) invalidateCrop(true);
  updatePngUi();
});

function onPaperCustomMmInput(): void {
  if (!isCustomPaper()) return;
  if (croppedTile) invalidateCrop(true);
  updatePngUi();
}

paperWidthInput.addEventListener('input', onPaperCustomMmInput);
paperHeightInput.addEventListener('input', onPaperCustomMmInput);
paperWidthInput.addEventListener('change', onPaperCustomMmInput);
paperHeightInput.addEventListener('change', onPaperCustomMmInput);

slotPresetSelect.addEventListener('change', () => {
  applySlotPresetToInputs();
  syncCropEditorSlot();
  if (croppedTile) invalidateCrop(true);
  updatePngUi();
});

function onCustomSlotInput(): void {
  if (!isCustomSlot()) return;
  syncCropEditorSlot();
  if (croppedTile) invalidateCrop(true);
  updatePngUi();
}

slotWidthInput.addEventListener('input', onCustomSlotInput);
slotHeightInput.addEventListener('input', onCustomSlotInput);

swapSlotBtn.addEventListener('click', () => {
  const a = slotWidthInput.value;
  slotWidthInput.value = slotHeightInput.value;
  slotHeightInput.value = a;
  slotPresetSelect.value = CUSTOM_SLOT_ID;
  applySlotPresetToInputs();
  syncCropEditorSlot();
  if (croppedTile) invalidateCrop(true);
  updatePngUi();
});

fileInput.addEventListener('change', () => {
  const f = fileInput.files?.[0];
  if (f) onFile(f);
});

zoomRange.addEventListener('input', () => {
  const p = Number(zoomRange.value);
  zoomValue.textContent = `${p}%`;
  cropEditor.setZoomFromSlider(p);
});

confirmCropBtn.addEventListener('click', () => {
  if (!sourceImage) return;
  try {
    croppedTile = cropEditor.getCroppedCanvas();
    show(settingsHint, false);
    show(sheetCard, true);
    redrawSheetPreview();
  } catch (e) {
    alert(e instanceof Error ? e.message : '切り抜きに失敗しました');
  }
});

function onMarginGapChange(): void {
  if (croppedTile) redrawSheetPreview();
}

marginInput.addEventListener('change', onMarginGapChange);
marginInput.addEventListener('input', onMarginGapChange);
gapInput.addEventListener('change', onMarginGapChange);
gapInput.addEventListener('input', onMarginGapChange);

downloadPngBtn.addEventListener('click', () => {
  if (!croppedTile) return;
  const paper = getSelectedPaper();
  if (!canExportPng(paper)) return;
  const layout = currentLayout();
  const px = pxPerMmFromDpi(EXPORT_DPI);
  const w = Math.round(paper.widthMm * px);
  const h = Math.round(paper.heightMm * px);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return;
  drawSheet(ctx, layout, croppedTile, paper.widthMm, paper.heightMm, px);
  c.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sheet-${paper.id}-${layout.count}枚.png`;
      a.click();
      URL.revokeObjectURL(url);
    },
    'image/png',
    1,
  );
});

downloadPdfBtn.addEventListener('click', async () => {
  if (!croppedTile) return;
  const layout = currentLayout();
  const paper = getSelectedPaper();
  try {
    const bytes = await buildSheetPdf(
      layout,
      croppedTile,
      paper.widthMm,
      paper.heightMm,
    );
    downloadBytes(bytes, `sheet-${paper.id}-${layout.count}枚.pdf`, 'application/pdf');
  } catch (e) {
    alert(e instanceof Error ? e.message : 'PDF の生成に失敗しました');
  }
});

zoomValue.textContent = `${zoomRange.value}%`;

initTheme();
