import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Starter App',
  description: 'Privacy policy for Starter App. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: [Date]</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            [Your Company] (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates this application
            and website (collectively, the &quot;Service&quot;). This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Information We Collect</h2>
          <h3 className="text-lg font-medium">Account Information</h3>
          <p>
            When you create an account, we collect your name, email address, and authentication credentials via our
            third-party authentication provider (Clerk).
          </p>
          <h3 className="text-lg font-medium">Device Information</h3>
          <p>
            We collect device identifiers, device model, operating system version, and app version to provide device
            management features and improve the Service.
          </p>
          <h3 className="text-lg font-medium">Push Notification Tokens</h3>
          <p>
            If you opt in to push notifications, we store your device push token to deliver notifications. You can
            disable notifications at any time in your device settings or the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>To provide, maintain, and improve the Service</li>
            <li>To send push notifications (opt-in)</li>
            <li>To communicate with you about your account and the Service</li>
            <li>To detect and prevent fraud or abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Service providers</strong> — We use third-party services for authentication (Clerk), hosting, and
              push notifications that process data on our behalf
            </li>
            <li>
              <strong>Legal requirements</strong> — We may disclose information if required by law or to protect our
              rights
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. You may request deletion of your account and
            associated data by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Security</h2>
          <p>
            We implement industry-standard security measures including encrypted data transmission (TLS), secure
            authentication, and access controls. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at [your-email@example.com].</p>
        </section>
      </div>
    </div>
  );
}
