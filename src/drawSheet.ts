import { applyCanvasPhotoQuality } from './canvasPhotoQuality';
import type { LayoutResult } from './layout';

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
}
