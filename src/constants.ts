export const EXPORT_DPI = 300;
/** 300dpi PNG の辺の上限（超える用紙では PNG を無効化） */
export const PNG_MAX_DIMENSION_PX = 8192;
export const MM_PER_INCH = 25.4;

export function mmToPx(dpi: number, mm: number): number {
  return (mm / MM_PER_INCH) * dpi;
}

/** PDF / 印刷でよく使う pt 変換 */
export function mmToPt(mm: number): number {
  return (mm / MM_PER_INCH) * 72;
}
