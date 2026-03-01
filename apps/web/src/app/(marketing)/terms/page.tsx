import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Starter App',
  description: 'Terms of service for Starter App. Read the terms and conditions for using the service.',
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold">Terms of Service</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: [Date]</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using this application and website (the &quot;Service&quot;), you agree to be bound by these
            Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Description of Service</h2>
          <p>
            [Your Company] provides a web application and related features through a web dashboard and mobile
            application. Features may vary by plan (Free or Pro).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Account Registration</h2>
          <p>
            You must create an account to use the Service. You are responsible for maintaining the confidentiality of
            your account credentials and for all activities under your account. You must provide accurate and complete
            information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
            <li>Use automated means to access the Service without our permission</li>
            <li>Impersonate another person or entity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Subscriptions and Billing</h2>
          <p>
            Some features require a paid Pro subscription. Subscriptions are billed on a recurring basis. You may cancel
            at any time, and your access will continue until the end of the current billing period. Refunds are provided
            at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by [Your Company] and are
            protected by intellectual property laws. You retain ownership of any data you input into the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
            either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or
            error-free.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, [Your Company] shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages arising out of or relating to your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violations of these Terms. Upon termination, your
            right to use the Service ceases immediately. You may delete your account at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of material changes by posting
            the updated Terms and updating the &quot;Last updated&quot; date. Continued use of the Service constitutes
            acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">11. Contact Us</h2>
          <p>If you have questions about these Terms, please contact us at [your-email@example.com].</p>
        </section>
      </div>
    </div>
  );
}
