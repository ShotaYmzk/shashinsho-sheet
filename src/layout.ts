export type LayoutResult = {
  cols: number;
  rows: number;
  count: number;
  slotW: number;
  slotH: number;
  marginMm: number;
  gapMm: number;
  innerW: number;
  innerH: number;
  offsetX: number;
  offsetY: number;
  cellPositions: { x: number; y: number }[];
};

/**
 * 用紙上に slotW×slotH mm のセルを gapMm 間隔で最大枚数配置。
 * 内側余白 marginMm。未使用領域はセルブロックを中央寄せ。
 */
export function computeLayout(
  marginMm: number,
  gapMm: number,
  slotW: number,
  slotH: number,
  paperW: number,
  paperH: number,
): LayoutResult {
  const innerW = Math.max(0, paperW - 2 * marginMm);
  const innerH = Math.max(0, paperH - 2 * marginMm);

  const cols = Math.max(
    1,
    Math.floor((innerW + gapMm) / (slotW + gapMm)),
  );
  const rows = Math.max(
    1,
    Math.floor((innerH + gapMm) / (slotH + gapMm)),
  );

  const usedW = cols * slotW + (cols - 1) * gapMm;
  const usedH = rows * slotH + (rows - 1) * gapMm;
  const offsetX = marginMm + (innerW - usedW) / 2;
  const offsetY = marginMm + (innerH - usedH) / 2;

  const cellPositions: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cellPositions.push({
        x: offsetX + c * (slotW + gapMm),
        y: offsetY + r * (slotH + gapMm),
      });
    }
  }

  return {
    cols,
    rows,
    count: cols * rows,
    slotW,
    slotH,
    marginMm,
    gapMm,
    innerW,
    innerH,
    offsetX,
    offsetY,
    cellPositions,
  };
}
