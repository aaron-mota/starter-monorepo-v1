import Link from 'next/link';
import { BarChart3, CheckCircle, CreditCard, Database, LayoutDashboard, Lock, Smartphone, Zap } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'Authentication',
    description: 'Clerk-powered auth with sign-in, sign-up, and user management out of the box.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'A fully responsive dashboard layout with sidebar navigation and mobile support.',
  },
  {
    icon: CreditCard,
    title: 'Stripe Billing',
    description: 'Subscription management with free and pro tiers, checkout, and customer portal.',
  },
  {
    icon: Database,
    title: 'MongoDB + tRPC',
    description: 'Type-safe API layer with tRPC, MongoDB native driver, and Zod validation.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Ready',
    description: 'Pre-built analytics page with chart components using Recharts.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Push notifications, device registration, and deep linking support included.',
  },
];

const pricingFeatures = [
  { name: 'Items', free: 'Up to 10', pro: 'Up to 100' },
  { name: 'Team Members', free: 'Up to 3', pro: 'Up to 20' },
  { name: 'History Retention', free: '30 days', pro: '365 days' },
  { name: 'Advanced Analytics', free: false, pro: true },
  { name: 'Data Export', free: false, pro: true },
  { name: 'Notifications', free: false, pro: true },
];

const faqs = [
  {
    q: 'What is this starter template?',
    a: 'This is a production-ready monorepo template built with Next.js 15, MongoDB, tRPC, Clerk auth, and Stripe billing. It gives you a complete foundation to build your SaaS product.',
  },
  {
    q: 'What tech stack does it use?',
    a: 'Next.js 15 (App Router), MongoDB (native driver), tRPC, TanStack Query, Clerk for auth, Stripe for billing, shadcn/ui components, Tailwind CSS, and Turborepo for monorepo management.',
  },
  {
    q: 'How does billing work?',
    a: 'Stripe is fully integrated with subscription checkout, customer portal, webhook handling, and plan-based feature gating. Free and Pro tiers are pre-configured.',
  },
  {
    q: 'Can I customize the plans?',
    a: 'Yes! Plan limits and features are defined in a shared constants file. Update the limits, pricing, and Stripe price IDs to match your product.',
  },
  {
    q: 'Is it ready for production?',
    a: 'The template includes auth, billing, webhooks, push notifications, rate limiting, and proper error handling. Deploy to Vercel and connect your services to go live.',
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center md:py-32">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Ship your SaaS faster
          <br />
          with a production-ready starter
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          A full-stack monorepo template with authentication, billing, dashboard, and API layer. Stop rebuilding the
          basics and focus on what makes your product unique.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get Started Free
          </Link>
          <a href="#features" className="rounded-md border px-6 py-3 text-base font-medium hover:bg-accent">
            See Features
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Everything you need to launch</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Pre-built features and patterns so you can focus on your product, not boilerplate.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6">
                <f.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Built with modern tools</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            A curated stack of proven technologies for building scalable applications.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Next.js 15', desc: 'App Router' },
              { name: 'MongoDB', desc: 'Native Driver' },
              { name: 'tRPC', desc: 'Type-safe API' },
              { name: 'Clerk', desc: 'Authentication' },
              { name: 'Stripe', desc: 'Billing' },
              { name: 'shadcn/ui', desc: 'Components' },
              { name: 'Tailwind CSS', desc: 'Styling' },
              { name: 'Turborepo', desc: 'Monorepo' },
            ].map((tech) => (
              <div key={tech.name} className="rounded-xl border p-4 text-center">
                <Zap className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-2 font-semibold">{tech.name}</p>
                <p className="text-xs text-muted-foreground">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-bold">Simple pricing</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Start free, upgrade when you need more.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-xl border p-6">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-1 text-3xl font-bold">$0</p>
              <p className="text-sm text-muted-foreground">Forever</p>
              <ul className="mt-6 space-y-3">
                {pricingFeatures.map((f) => (
                  <li key={f.name} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`h-4 w-4 ${f.free ? 'text-primary' : 'text-muted-foreground/40'}`} />
                    <span className={!f.free ? 'text-muted-foreground/60' : ''}>
                      {f.name}: {typeof f.free === 'boolean' ? (f.free ? 'Yes' : 'No') : f.free}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-6 block rounded-md border px-4 py-2 text-center text-sm font-medium hover:bg-accent"
              >
                Get Started
              </Link>
            </div>
            {/* Pro */}
            <div className="rounded-xl border-2 border-primary p-6">
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-1 text-3xl font-bold">
                $4.99<span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="text-sm text-muted-foreground">or $49/year (save 18%)</p>
              <ul className="mt-6 space-y-3">
                {pricingFeatures.map((f) => (
                  <li key={f.name} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>
                      {f.name}: {typeof f.pro === 'boolean' ? (f.pro ? 'Yes' : 'No') : f.pro}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-6 block rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Start Free, Upgrade Later
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold">Frequently asked questions</h2>
          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-xl border p-4">
                <summary className="cursor-pointer list-none text-sm font-medium">{faq.q}</summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-muted/30 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Create your free account and start building your product today.
        </p>
        <Link
          href="/sign-up"
          className="mt-8 inline-block rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign Up Free
        </Link>
      </section>
    </div>
  );
}
