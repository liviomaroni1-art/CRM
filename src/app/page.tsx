"use client";

import { useState } from "react";

const navLinks = [
  { label: "Products", hasDropdown: true },
  { label: "Solutions", hasDropdown: true },
  { label: "Developers", hasDropdown: true },
  { label: "Resources", hasDropdown: true },
  { label: "Pricing", hasDropdown: false },
];

const trustedBrands = [
  "Stripe",
  "Notion",
  "Linear",
  "Vercel",
  "Figma",
  "Shopify",
  "Slack",
];

const faqItems = [
  {
    question: "Which plan should I purchase?",
    answer:
      "Our team can help you determine the right plan for your organization, but we have found that the Professional plan provides a strong foundation that meets most customers' needs. As your requirements grow, you can seamlessly upgrade to access more advanced features.",
  },
  {
    question: "Can I purchase individual products or additional features?",
    answer:
      "Yes, you can purchase individual products or add-on features to complement your existing plan. Contact our sales team to discuss the best configuration for your specific needs.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes, we offer a 14-day free trial with full access to all features. No credit card required. Start building and see the value for yourself before committing to a plan.",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "All plans include email support with a 24-hour response time. Professional and Enterprise plans include priority support with dedicated account managers and 24/7 live chat assistance.",
  },
];

const footerLinks = {
  Socials: [
    { label: "Twitter", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "GitHub", href: "#" },
  ],
  About: [
    { label: "Contact Us", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Careers", href: "#" },
  ],
  Compare: [
    { label: "vs Salesforce", href: "#" },
    { label: "vs HubSpot", href: "#" },
    { label: "vs Pipedrive", href: "#" },
  ],
  "Get Started": [
    { label: "Sign Up", href: "#" },
    { label: "Log In", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Case Studies", href: "#" },
    { label: "Help Center", href: "#" },
  ],
};

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 4V16M4 10H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 10H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Banner */}
      <div className="bg-slate-900 px-4 py-2.5 text-center text-sm text-white">
        <span className="text-slate-300">
          Introducing CRM 3.0 — Smarter pipelines, faster closes.{" "}
        </span>
        <a href="#" className="font-medium text-white underline hover:text-blue-300">
          Learn more &rarr;
        </a>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3 3h4.5v4.5H3V3zm7.5 0H15v4.5h-4.5V3zM3 10.5h4.5V15H3v-4.5zm7.5 0H15V15h-4.5v-4.5z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">CRM</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href="#"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="text-slate-400" />}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="#"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Free trial
            </a>
            <a
              href="#"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              Contact us
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 8a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM14 14c0-2.761-2.686-5-6-5s-6 2.239-6 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Login
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {mobileMenuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href="#"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href="#"
                  className="rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Free trial
                </a>
                <a
                  href="#"
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700"
                >
                  Contact us
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-blue-400 to-slate-300" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Get Started
                <br />
                in Minutes
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-500">
                Start getting more distribution and ROI out of your customer
                relationships. Try CRM for free for 14 days.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#"
                  className="rounded-full bg-primary px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark"
                >
                  Start Free Trial
                </a>
                <a
                  href="#"
                  className="rounded-full border border-slate-300 px-7 py-3 text-sm font-semibold uppercase tracking-wider text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
                >
                  Book a 15 Minute Demo
                </a>
              </div>
            </div>

            {/* Right side — scrolling roles */}
            <div className="relative flex items-center overflow-hidden">
              <div className="flex flex-col gap-2">
                {[
                  { text: "Sales Teams", opacity: "opacity-20" },
                  { text: "Growth Teams", opacity: "opacity-40" },
                  { text: "Account Managers", opacity: "opacity-100" },
                  { text: "Founders & Execs", opacity: "opacity-100" },
                  { text: "Revenue Ops", opacity: "opacity-40" },
                  { text: "Customer Success", opacity: "opacity-20" },
                ].map((item) => (
                  <span
                    key={item.text}
                    className={`text-3xl font-bold text-primary sm:text-4xl lg:text-5xl ${item.opacity}`}
                  >
                    {item.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trusted Brands Section */}
        <section className="border-t border-slate-200 bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Top brands trust CRM
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-500">
              Thousands of forward-thinking organizations rely on our platform to
              manage their customer relationships and accelerate growth.
            </p>
            <a
              href="#"
              className="mt-4 inline-block text-base font-medium text-slate-900 underline underline-offset-4 hover:text-primary"
            >
              Explore customer stories
            </a>

            {/* Logo grid */}
            <div className="mt-16 grid grid-cols-2 items-center gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {trustedBrands.map((brand) => (
                <div
                  key={brand}
                  className="flex items-center justify-center"
                >
                  <span className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                    {brand}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-slate-200 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Frequently
                  <br />
                  asked
                  <br />
                  questions
                </h2>
              </div>
              <div className="divide-y divide-slate-200">
                {faqItems.map((item, index) => (
                  <div key={index} className="py-6">
                    <button
                      onClick={() =>
                        setOpenFaq(openFaq === index ? -1 : index)
                      }
                      className="flex w-full items-center justify-between text-left"
                    >
                      <h3 className="text-lg font-semibold text-slate-900 pr-4">
                        {item.question}
                      </h3>
                      <span className="flex-shrink-0 text-slate-400">
                        {openFaq === index ? <MinusIcon /> : <PlusIcon />}
                      </span>
                    </button>
                    {openFaq === index && (
                      <p className="mt-4 max-w-2xl leading-relaxed text-slate-500">
                        {item.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M3 3h4.5v4.5H3V3zm7.5 0H15v4.5h-4.5V3zM3 10.5h4.5V15H3v-4.5zm7.5 0H15V15h-4.5v-4.5z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold">CRM</span>
              </div>
              <p className="mt-4 text-sm text-slate-400">hello@crm.com</p>
              <p className="text-sm text-slate-400">
                San Francisco, CA
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {category}
                </h4>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} CRM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
