export function getRazorpayConfig() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    enabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  };
}

/** Demo checkout is allowed only outside production. */
export function isDemoPaymentsAllowed() {
  return process.env.NODE_ENV !== "production";
}

export function generateInvoiceNumber() {
  const date = new Date();
  const prefix = "KS";
  const timestamp = date.getFullYear().toString().slice(2) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${timestamp}-${random}`;
}

export async function createRazorpayOrder(amount: number, receipt: string) {
  const config = getRazorpayConfig();
  if (!config.enabled) {
    if (!isDemoPaymentsAllowed()) {
      throw new Error("Payment gateway not configured");
    }
    return { id: `order_demo_${Date.now()}`, amount: amount * 100, currency: "INR" };
  }

  const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
    }),
  });

  if (!res.ok) throw new Error("Failed to create Razorpay order");
  return res.json();
}
