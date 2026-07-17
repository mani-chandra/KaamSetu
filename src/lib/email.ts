import { prisma } from "@/lib/prisma";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "KaamSetu <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[email:dev] To: ${to} | ${subject}`);
    }
    return { success: true, mode: "dev" as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    console.error("[email] Failed to send:", await res.text());
    return { success: false, mode: "resend" as const };
  }

  return { success: true, mode: "resend" as const };
}

export async function sendEmailToUser(
  userId: string,
  subject: string,
  html: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.email) return;
  await sendEmail({ to: user.email, subject, html });
}

export function emailTemplate(title: string, body: string, ctaUrl?: string, ctaLabel?: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0F766E;margin:0 0 16px">${title}</h2>
      <p style="color:#334155;line-height:1.6">${body}</p>
      ${ctaUrl ? `<p><a href="${ctaUrl}" style="display:inline-block;background:#0F766E;color:white;padding:12px 24px;border-radius:6px;text-decoration:none">${ctaLabel || "View details"}</a></p>` : ""}
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">KaamSetu — India's trusted local services platform</p>
    </div>
  `;
}
