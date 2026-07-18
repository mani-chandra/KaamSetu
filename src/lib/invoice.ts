import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type InvoiceData = {
  invoiceNumber: string;
  amount: number;
  currency: string;
  paidAt: Date | null;
  customerName: string;
  professionalName: string;
  serviceName: string;
  bookingTitle: string;
  bookingDate: string;
};

export async function generateInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const teal = rgb(0.08, 0.72, 0.65);
  const dark = rgb(0.1, 0.1, 0.15);
  const muted = rgb(0.5, 0.5, 0.55);

  page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: teal });
  page.drawText("KaamSetu", { x: 40, y: 808, size: 22, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Tax Invoice", { x: 460, y: 808, size: 14, font, color: rgb(1, 1, 1) });

  let y = 740;
  page.drawText(`Invoice #${data.invoiceNumber}`, { x: 40, y, size: 18, font: fontBold, color: dark });
  y -= 30;
  page.drawText(`Date: ${data.paidAt ? data.paidAt.toLocaleDateString("en-IN") : "Pending"}`, { x: 40, y, size: 11, font, color: muted });

  y -= 50;
  page.drawText("Bill To", { x: 40, y, size: 12, font: fontBold, color: dark });
  y -= 18;
  page.drawText(data.customerName, { x: 40, y, size: 11, font, color: muted });

  y -= 40;
  page.drawText("Service Provider", { x: 40, y, size: 12, font: fontBold, color: dark });
  y -= 18;
  page.drawText(data.professionalName, { x: 40, y, size: 11, font, color: muted });

  y -= 50;
  page.drawRectangle({ x: 40, y: y - 80, width: 515, height: 80, color: rgb(0.95, 0.98, 0.97), borderColor: teal, borderWidth: 1 });
  y -= 25;
  page.drawText("Description", { x: 55, y, size: 10, font: fontBold, color: dark });
  page.drawText("Category", { x: 300, y, size: 10, font: fontBold, color: dark });
  page.drawText("Amount", { x: 480, y, size: 10, font: fontBold, color: dark });
  y -= 22;
  page.drawText(data.bookingTitle, { x: 55, y, size: 10, font, color: muted });
  page.drawText(data.serviceName, { x: 300, y, size: 10, font, color: muted });
  page.drawText(`${data.currency} ${data.amount.toFixed(2)}`, { x: 480, y, size: 10, font, color: dark });

  y -= 60;
  page.drawText(`Total: ${data.currency} ${data.amount.toFixed(2)}`, { x: 380, y, size: 14, font: fontBold, color: teal });

  y -= 80;
  page.drawText("Thank you for using KaamSetu — India's trusted local services platform.", { x: 40, y, size: 9, font, color: muted });

  return pdf.save();
}
