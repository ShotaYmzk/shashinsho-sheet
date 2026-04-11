import { PDFDocument, rgb } from 'pdf-lib';
import {
  mmToPt,
  SHEET_CORNER_MARK_MM,
  SHEET_CORNER_STROKE_MM,
} from './constants';
import type { LayoutResult } from './layout';
import type { PDFPage } from 'pdf-lib';

function drawPdfCellCornerMarks(
  page: PDFPage,
  xPt: number,
  yPt: number,
  widthPt: number,
  heightPt: number,
): void {
  const arm = mmToPt(SHEET_CORNER_MARK_MM);
  const lw = Math.max(0.12, mmToPt(SHEET_CORNER_STROKE_MM));
  const black = rgb(0, 0, 0);

  const line = (x0: number, y0: number, x1: number, y1: number) => {
    page.drawLine({
      start: { x: x0, y: y0 },
      end: { x: x1, y: y1 },
      thickness: lw,
      color: black,
    });
  };

  const xl = xPt;
  const xr = xPt + widthPt;
  const yb = yPt;
  const yt = yPt + heightPt;

  // drawImage の矩形と同じ四隅（PDF は左下原点・y は上方向）
  line(xl - arm, yt, xl, yt);
  line(xl, yt, xl, yt + arm);
  line(xr, yt, xr + arm, yt);
  line(xr, yt, xr, yt + arm);
  line(xr + arm, yb, xr, yb);
  line(xr, yb, xr, yb - arm);
  line(xl, yb, xl - arm, yb);
  line(xl, yb, xl, yb - arm);
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('toBlob failed'));
          return;
        }
        void blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      },
      'image/png',
      1,
    );
  });
}

/** 1ページ・指定用紙実寸（mm）。各セルに同じラスタ画像を埋め込む */
export async function buildSheetPdf(
  layout: LayoutResult,
  tileCanvas: HTMLCanvasElement,
  paperWidthMm: number,
  paperHeightMm: number,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const wPt = mmToPt(paperWidthMm);
  const hPt = mmToPt(paperHeightMm);
  const page = pdfDoc.addPage([wPt, hPt]);

  const pngBytes = await canvasToPngBytes(tileCanvas);
  const image = await pdfDoc.embedPng(pngBytes);

  const { cellPositions, slotW, slotH } = layout;
  const k = mmToPt(1);

  for (const pos of cellPositions) {
    const xPt = pos.x * k;
    const widthPt = slotW * k;
    const heightPt = slotH * k;
    const yPt = hPt - (pos.y + slotH) * k;
    page.drawImage(image, {
      x: xPt,
      y: yPt,
      width: widthPt,
      height: heightPt,
    });
    drawPdfCellCornerMarks(page, xPt, yPt, widthPt, heightPt);
  }

  return pdfDoc.save();
}

export function downloadBytes(data: Uint8Array, filename: string, mime: string): void {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  const blob = new Blob([copy], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
