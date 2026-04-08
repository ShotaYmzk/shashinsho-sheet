import { PDFDocument } from 'pdf-lib';
import { mmToPt } from './constants';
import type { LayoutResult } from './layout';

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
