/** 目盛り本数が多すぎないよう、span（mm）に応じた刻み幅 */
export function pickMmTickStep(spanMm: number): number {
  if (!(spanMm > 0)) return 5;
  let approx = spanMm / 6;
  if (approx < 0.5) approx = 0.5;
  const pow10 = 10 ** Math.floor(Math.log10(approx));
  const n = approx / pow10;
  const base = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  let step = base * pow10;
  while (spanMm / step > 12) step *= 2;
  while (spanMm / step < 2 && step > 0.5) step /= 2;
  return Math.max(0.5, step);
}

export function mmTickValues(spanMm: number, stepMm: number): number[] {
  const out: number[] = [0];
  let t = stepMm;
  while (t < spanMm - 1e-6) {
    out.push(Math.round(t * 100) / 100);
    t += stepMm;
  }
  const end = Math.round(spanMm * 100) / 100;
  if (out[out.length - 1] < end - 1e-6) out.push(end);
  return out;
}

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function formatMm(mm: number): string {
  return Number.isInteger(mm) ? String(mm) : String(mm);
}

/** 上辺：左端 0 → 右端 spanMm（mm）。幾何は cssWidth 全体に比例（切り抜き canvas の表示幅と一致させる） */
export function drawHorizontalMmRuler(
  canvas: HTMLCanvasElement,
  spanMm: number,
  cssWidth: number,
  cssHeight: number,
): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = cssWidth;
  const H = cssHeight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = cssVar('--surface', '#18181c');
  ctx.fillRect(0, 0, W, H);

  const xAt = (mm: number) => (mm / spanMm) * W;

  const step = pickMmTickStep(spanMm);
  const ticks = mmTickValues(spanMm, step);
  const baseline = H - 5;
  const lineCol = cssVar('--border', '#555');
  const textCol = cssVar('--muted', '#888');

  ctx.strokeStyle = lineCol;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, baseline);
  ctx.lineTo(W, baseline);
  ctx.stroke();

  ctx.font = '11px system-ui, -apple-system, sans-serif';
  const labelLift = 10;
  const ty = baseline - labelLift;

  for (const mm of ticks) {
    const x = xAt(mm);
    const isEnd = Math.abs(mm - spanMm) < 1e-4;
    const isStart = mm === 0;
    const tickLen = isStart || isEnd ? 7 : 5;
    ctx.beginPath();
    ctx.moveTo(x, baseline);
    ctx.lineTo(x, baseline - tickLen);
    ctx.stroke();

    ctx.fillStyle = textCol;
    const text = formatMm(mm);
    if (isStart) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(text, Math.min(W - 2, Math.max(2, x + 2)), ty);
    } else if (isEnd) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(text, Math.max(2, W - 2), ty);
    } else {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(text, Math.max(8, Math.min(W - 8, x)), ty);
    }
  }
}

/** 左辺：上端 0 → 下端 spanMm（mm）。画面上で y 下向き＝mm 増。横幅は CSS（列幅）に任せ、計測して幾何に使う */
export function drawVerticalMmRuler(
  canvas: HTMLCanvasElement,
  spanMm: number,
  cssHeight: number,
): void {
  canvas.style.height = `${cssHeight}px`;
  const layoutW = Math.max(1, Math.round(canvas.getBoundingClientRect().width));
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(layoutW * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = layoutW;
  const H = cssHeight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = cssVar('--surface', '#18181c');
  ctx.fillRect(0, 0, W, H);

  const yAt = (mm: number) => (mm / spanMm) * H;

  const step = pickMmTickStep(spanMm);
  const ticks = mmTickValues(spanMm, step);
  const baseline = W - 4;
  const lineCol = cssVar('--border', '#555');
  const textCol = cssVar('--muted', '#888');

  ctx.strokeStyle = lineCol;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(baseline, 0);
  ctx.lineTo(baseline, H);
  ctx.stroke();

  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  const textX = baseline - 5;

  for (const mm of ticks) {
    const y = yAt(mm);
    const isEnd = Math.abs(mm - spanMm) < 1e-4;
    const isStart = mm === 0;
    const tickLen = isStart || isEnd ? 7 : 5;
    ctx.beginPath();
    ctx.moveTo(baseline, y);
    ctx.lineTo(baseline + tickLen, y);
    ctx.stroke();

    ctx.fillStyle = textCol;
    const text = formatMm(mm);
    if (isStart) {
      ctx.textBaseline = 'top';
      ctx.fillText(text, textX, Math.min(H - 10, Math.max(2, y + 2)));
    } else if (isEnd) {
      ctx.textBaseline = 'bottom';
      ctx.fillText(text, textX, Math.max(10, H - 2));
    } else {
      ctx.textBaseline = 'middle';
      ctx.fillText(text, textX, Math.max(10, Math.min(H - 10, y)));
    }
  }
}
