export const EXPORT_DPI = 300;
/** 各写真セル四隅の切り取りガイド（外向きの腕の長さ・mm） */
export const SHEET_CORNER_MARK_MM = 2;
/** ガイド線の太さ（mm）— 髪の毛程度の細線 */
export const SHEET_CORNER_STROKE_MM = 0.07;
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
