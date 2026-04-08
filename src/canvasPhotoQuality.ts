/** 写真のスケール時に既定の low 補間でぼやけないよう、高品質補間を有効にする */
export function applyCanvasPhotoQuality(ctx: CanvasRenderingContext2D): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}
