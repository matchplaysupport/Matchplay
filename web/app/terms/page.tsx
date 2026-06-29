import type { Metadata } from "next";
import { LegalPage, Section } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of The Clubhouse.",
  robots: { index: true, follow: true },
};

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="June 28, 2026">
      <Section heading="Acceptance">
        <p>
          By joining the Clubhouse waitlist or using our websites and apps (the &quot;Services&quot;), you agree to these Terms. If you do
          not agree, please do not use the Services.
        </p>
      </Section>
      <Section heading="The Services">
        <p>
          The Clubhouse connects golfers with tee times offered by independent golf courses and provides scoring, handicap, and leaderboard
          features. Courses set their own availability and pricing; The Clubhouse is not the operator of any course and is not responsible
          for course conditions, access, or play.
        </p>
      </Section>
      <Section heading="Waitlist">
        <p>
          Joining the waitlist does not guarantee access to the Services. We may contact you about early access and product updates. The
          Services are offered on a region-by-region basis and availability may vary.
        </p>
      </Section>
      <Section heading="Bookings &amp; payments">
        <p>
          When booking is available, tee-time reservations are subject to the course&apos;s pricing and cancellation policy shown at checkout.
          Payments are processed by Stripe. Course operators receive payouts under the terms of their The Clubhouse agreement.
        </p>
      </Section>
      <Section heading="Acceptable use">
        <p>You agree not to misuse the Services, including by attempting to disrupt them, scrape data, submit fraudulent bookings, or violate any applicable law.</p>
      </Section>
      <Section heading="Disclaimers &amp; liability">
        <p>
          The Services are provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by law, The Clubhouse is not
          liable for indirect or consequential damages arising from your use of the Services.
        </p>
      </Section>
      <Section heading="Changes">
        <p>We may update these Terms from time to time. Material changes will be reflected by the &quot;last updated&quot; date above.</p>
      </Section>
      <Section heading="Contact">
        <p>Questions about these Terms? Email <strong>legal@golftheclubhouse.com</strong>.</p>
      </Section>
    </LegalPage>
  );
}
