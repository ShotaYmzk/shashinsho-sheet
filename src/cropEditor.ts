import { EXPORT_DPI, MM_PER_INCH, mmToPx } from './constants';

const VIEW_BASE_W = 380;

export class CropEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private img: HTMLImageElement | null = null;
  /** 切り抜き枠の物理サイズ（横×縦 mm） */
  private slotWmm = 24;
  private slotHmm = 30;
  panX = 0;
  panY = 0;
  /** 1 以上。ベースの cover スケールに掛ける */
  zoom = 1;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2d unsupported');
    this.canvas = canvas;
    this.ctx = ctx;
    this.bindPointer();
  }

  getSlotMm(): { w: number; h: number } {
    return { w: this.slotWmm, h: this.slotHmm };
  }

  private viewW(): number {
    return VIEW_BASE_W;
  }

  private viewH(): number {
    return VIEW_BASE_W * (this.slotHmm / this.slotWmm);
  }

  setSlotMm(widthMm: number, heightMm: number): void {
    if (widthMm <= 0 || heightMm <= 0) return;
    this.slotWmm = widthMm;
    this.slotHmm = heightMm;
    this.resizeCanvas();
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.render();
  }

  setImage(img: HTMLImageElement): void {
    this.img = img;
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.resizeCanvas();
    this.render();
  }

  setZoomFromSlider(percent: number): void {
    this.zoom = Math.max(1, Math.min(4, percent / 100));
    this.render();
  }

  private resizeCanvas(): void {
    const W = this.viewW();
    const H = this.viewH();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.style.width = `${W}px`;
    this.canvas.style.height = `${H}px`;
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private baseScale(): number {
    const img = this.img;
    if (!img || img.naturalWidth === 0) return 1;
    const Iw = img.naturalWidth;
    const Ih = img.naturalHeight;
    const W = this.viewW();
    const H = this.viewH();
    return Math.max(W / Iw, H / Ih);
  }

  totalScale(): number {
    return this.baseScale() * this.zoom;
  }

  render(): void {
    const ctx = this.ctx;
    const W = this.viewW();
    const H = this.viewH();
    const img = this.img;
    const dpr = this.canvas.width / W;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#1a1a1e';
    ctx.fillRect(0, 0, W, H);

    if (img && img.naturalWidth > 0) {
      const Iw = img.naturalWidth;
      const Ih = img.naturalHeight;
      const s = this.totalScale();
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.clip();
      ctx.translate(W / 2 + this.panX, H / 2 + this.panY);
      ctx.scale(s, s);
      ctx.drawImage(img, -Iw / 2, -Ih / 2);
      ctx.restore();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);
  }

  /** 印刷用 DPI の切り抜き（スロットmm と同じ縦横比） */
  getCroppedCanvas(): HTMLCanvasElement {
    const img = this.img;
    if (!img || img.naturalWidth === 0) {
      throw new Error('画像がありません');
    }
    const outW = Math.max(1, Math.round(mmToPx(EXPORT_DPI, this.slotWmm)));
    const outH = Math.max(1, Math.round(mmToPx(EXPORT_DPI, this.slotHmm)));

    const W = this.viewW();
    const H = this.viewH();
    const s = this.totalScale();
    const Iw = img.naturalWidth;
    const Ih = img.naturalHeight;
    const sx = (-W / 2 - this.panX) / s + Iw / 2;
    const sy = (-H / 2 - this.panY) / s + Ih / 2;
    const sw = W / s;
    const sh = H / s;

    const out = document.createElement('canvas');
    out.width = outW;
    out.height = outH;
    const octx = out.getContext('2d');
    if (!octx) throw new Error('2d');
    octx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    return out;
  }

  private bindPointer(): void {
    const el = this.canvas;
    el.addEventListener('pointerdown', (e) => {
      if (!this.img) return;
      this.dragging = true;
      el.setPointerCapture(e.pointerId);
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });
    el.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.panX += dx;
      this.panY += dy;
      this.render();
    });
    el.addEventListener('pointerup', (e) => {
      this.dragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    });
    el.addEventListener('pointercancel', () => {
      this.dragging = false;
    });
  }
}

export function pxPerMmFromDpi(dpi: number): number {
  return dpi / MM_PER_INCH;
}
