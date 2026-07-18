import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/invoice";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          category: true,
          customer: { include: { user: true } },
          professional: { include: { user: true } },
        },
      },
    },
  });

  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isCustomer = payment.booking.customer.userId === session.user.id;
  const isPro = payment.booking.professional?.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isCustomer && !isPro && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pdfBytes = await generateInvoicePdf({
    invoiceNumber: payment.invoiceNumber || payment.id.slice(0, 8).toUpperCase(),
    amount: payment.amount,
    currency: payment.currency,
    paidAt: payment.paidAt,
    customerName: payment.booking.customer.user.name || "Customer",
    professionalName: payment.booking.professional?.user.name || "Professional",
    serviceName: payment.booking.category.name,
    bookingTitle: payment.booking.title,
    bookingDate: payment.booking.scheduledDate?.toLocaleDateString("en-IN") || "—",
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${payment.invoiceNumber || payment.id}.pdf"`,
    },
  });
}
