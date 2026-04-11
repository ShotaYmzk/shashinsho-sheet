import { applyCanvasPhotoQuality } from './canvasPhotoQuality';
import { SHEET_CORNER_MARK_MM, SHEET_CORNER_STROKE_MM } from './constants';
import type { LayoutResult } from './layout';

/** 白背景でも境目が分かるよう、各セル四隅に外向きの L 字ガイド（黒）を描く */
function drawCellCornerMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  pxPerMm: number,
): void {
  const arm = Math.max(3, Math.round(SHEET_CORNER_MARK_MM * pxPerMm));
  const rawLw = SHEET_CORNER_STROKE_MM * pxPerMm;
  const lw = Math.max(0.5, Math.min(1.35, rawLw));

  ctx.save();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = lw;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';

  ctx.beginPath();
  // 左上（外向き＝左と上）
  ctx.moveTo(x - arm, y);
  ctx.lineTo(x, y);
  ctx.moveTo(x, y - arm);
  ctx.lineTo(x, y);
  // 右上
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + arm, y);
  ctx.moveTo(x + w, y - arm);
  ctx.lineTo(x + w, y);
  // 右下
  ctx.moveTo(x + w + arm, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.moveTo(x + w, y + h + arm);
  ctx.lineTo(x + w, y + h);
  // 左下
  ctx.moveTo(x, y + h);
  ctx.lineTo(x - arm, y + h);
  ctx.moveTo(x, y + h + arm);
  ctx.lineTo(x, y + h);
  ctx.stroke();
  ctx.restore();
}

/** 白紙＋各セルに切り抜き画像を等倍スケールで描画（mm → px は pxPerMm） */
export function drawSheet(
  ctx: CanvasRenderingContext2D,
  layout: LayoutResult,
  source: CanvasImageSource,
  paperW_mm: number,
  paperH_mm: number,
  pxPerMm: number,
): void {
  applyCanvasPhotoQuality(ctx);
  const W = Math.round(paperW_mm * pxPerMm);
  const H = Math.round(paperH_mm * pxPerMm);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const { cellPositions, slotW, slotH } = layout;
  const cellW = Math.round(slotW * pxPerMm);
  const cellH = Math.round(slotH * pxPerMm);
  for (const pos of cellPositions) {
    const x = Math.round(pos.x * pxPerMm);
    const y = Math.round(pos.y * pxPerMm);
    ctx.drawImage(source, x, y, cellW, cellH);
  }
  for (const pos of cellPositions) {
    const x = Math.round(pos.x * pxPerMm);
    const y = Math.round(pos.y * pxPerMm);
    drawCellCornerMarks(ctx, x, y, cellW, cellH, pxPerMm);
  }
}
