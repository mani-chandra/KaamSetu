import { LegalPage } from "@/components/legal/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="July 17, 2026"
      sections={[
        {
          title: "1. Acceptance of Terms",
          body: [
            "By accessing or using KaamSetu, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
            "KaamSetu connects customers with independent service professionals. We facilitate discovery, booking, and payments but are not the direct provider of listed services unless explicitly stated.",
          ],
        },
        {
          title: "2. Accounts & Roles",
          body: [
            "Customers must provide accurate contact details when booking. Professionals must submit truthful profile information, valid identity or certification documents where requested, and maintain up-to-date availability.",
            "Professional accounts remain inactive until approved by KaamSetu administrators. We may suspend or remove accounts that violate these terms or receive repeated complaints.",
          ],
        },
        {
          title: "3. Bookings & Payments",
          body: [
            "Instant bookings are confirmed at listed prices where available. Quote-based bookings require customer acceptance before work proceeds.",
            "Payments processed through KaamSetu are subject to our payment partner terms. Refunds and disputes are handled according to our cancellation and dispute policies.",
          ],
        },
        {
          title: "4. Conduct",
          body: [
            "Users must not harass others, post false reviews, circumvent platform fees, or use KaamSetu for unlawful activity.",
            "Professionals are responsible for the quality and safety of services they deliver. Customers are responsible for providing safe access to the service location.",
          ],
        },
        {
          title: "5. Limitation of Liability",
          body: [
            "KaamSetu is provided on an \"as is\" basis. To the extent permitted by law, we are not liable for indirect damages arising from services performed by independent professionals.",
            "Our total liability for platform-related claims is limited to the fees paid to KaamSetu for the booking in question during the preceding three months.",
          ],
        },
        {
          title: "6. Changes",
          body: [
            "We may update these terms from time to time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.",
            "For questions, contact support through the in-app help center.",
          ],
        },
      ]}
    />
  );
}
