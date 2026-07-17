import { LegalPage } from "@/components/legal/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 17, 2026"
      sections={[
        {
          title: "1. Information We Collect",
          body: [
            "We collect account information such as name, email, phone number, and city when you register.",
            "Professionals may upload profile photos, portfolio images, and verification documents. Customers provide booking addresses and service details.",
            "We collect usage data including pages visited, bookings made, and device/browser information to improve the platform.",
          ],
        },
        {
          title: "2. How We Use Information",
          body: [
            "We use your data to operate bookings, process payments, send notifications, verify professionals, and provide customer support.",
            "We may send service-related emails or messages about bookings, quotes, and account status. Marketing messages are sent only where permitted.",
          ],
        },
        {
          title: "3. Sharing",
          body: [
            "Booking details are shared between the customer and assigned professional to complete the service.",
            "We use trusted third parties for payments (Razorpay), email delivery (Resend), and hosting. These providers process data under their own privacy policies.",
            "We do not sell personal information to advertisers.",
          ],
        },
        {
          title: "4. Data Retention & Security",
          body: [
            "We retain account and booking records as long as needed to provide services and meet legal obligations.",
            "We apply reasonable technical and organizational measures to protect data, but no online system is completely secure.",
          ],
        },
        {
          title: "5. Your Rights",
          body: [
            "You may request access, correction, or deletion of your personal data by contacting support, subject to legal and operational requirements.",
            "You can update profile information from your dashboard at any time.",
          ],
        },
        {
          title: "6. Contact",
          body: [
            "For privacy questions, reach out via the Support page in your dashboard or email the address listed in your account communications.",
          ],
        },
      ]}
    />
  );
}
