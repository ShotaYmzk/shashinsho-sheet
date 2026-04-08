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
  const W = paperW_mm * pxPerMm;
  const H = paperH_mm * pxPerMm;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const { cellPositions, slotW, slotH } = layout;
  for (const pos of cellPositions) {
    const x = pos.x * pxPerMm;
    const y = pos.y * pxPerMm;
    const w = slotW * pxPerMm;
    const h = slotH * pxPerMm;
    ctx.drawImage(source, x, y, w, h);
  }
}
