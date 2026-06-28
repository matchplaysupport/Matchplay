import type { Metadata } from "next";
import { LegalPage, Section } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Match Play collects, uses, and protects your information.",
  robots: { index: true, follow: true },
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="June 28, 2026">
      <Section heading="Overview">
        <p>
          Match Play (&quot;we,&quot; &quot;us&quot;) operates a golf tee-time booking and scoring platform. This policy explains what
          information we collect, why, and the choices you have. By joining our waitlist or using our products, you agree to this policy.
        </p>
      </Section>
      <Section heading="Information we collect">
        <p>
          <strong>Waitlist details.</strong> When you join the waitlist we collect your name (or course name), email address, and
          whether you identify as a golfer or a course operator.
        </p>
        <p>
          <strong>Account &amp; booking data.</strong> Once our apps launch, we collect the information needed to create your account,
          book tee times, and process payments (handled by our payment processor).
        </p>
        <p>
          <strong>Usage data.</strong> We collect basic analytics — pages visited, referring source, and device type — to improve the
          product. We honour your browser&apos;s &quot;Do Not Track&quot; and reduced-tracking preferences where supported.
        </p>
      </Section>
      <Section heading="How we use your information">
        <p>To contact you about early access, operate and improve our services, process bookings and payments, prevent abuse, and comply with law.</p>
      </Section>
      <Section heading="Payments">
        <p>
          Payments are processed by <strong>Stripe</strong>. We do not store full card numbers on our servers. Stripe&apos;s handling of your
          payment data is governed by its own privacy policy.
        </p>
      </Section>
      <Section heading="Sharing">
        <p>
          We do not sell your personal information. We share data only with service providers who help us operate (such as our hosting,
          email, and payment partners), or when required by law.
        </p>
      </Section>
      <Section heading="Your choices">
        <p>You can unsubscribe from emails at any time using the link in any message, or request access to or deletion of your data by contacting us.</p>
      </Section>
      <Section heading="Contact">
        <p>Questions about this policy? Email <strong>privacy@matchplay.golf</strong>.</p>
      </Section>
    </LegalPage>
  );
}
