import { Link } from "react-router-dom";
import rockyLogo from "@/assets/rocky-logo.png";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 brand-font">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .brand-font { font-family: 'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; letter-spacing: -0.0125em; }
      `}</style>

      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={rockyLogo} alt="Rocky AI Logo" className="w-9 h-9 object-contain" />
            <span className="font-bold tracking-tight">Rocky AI</span>
          </Link>
          <Link to="/" className="text-sm text-neutral-600 hover:text-neutral-900">← Back to home</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-neutral-500 mb-10">Last updated: April 18, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-neutral-700 leading-relaxed">
              Rocky AI ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our website or use our AI-powered
              calling services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li><strong>Account information:</strong> name, email, phone number, company name.</li>
              <li><strong>Lead data:</strong> contact information you or your CRM provide so our agents can call leads.</li>
              <li><strong>Call data:</strong> call recordings, transcripts, outcomes, and metadata.</li>
              <li><strong>Usage data:</strong> pages visited, features used, device and browser information.</li>
              <li><strong>Cookies & pixels:</strong> including the Meta Pixel for advertising analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Provide, operate, and improve our services.</li>
              <li>Place AI-powered calls on your behalf and report outcomes.</li>
              <li>Process payments and manage subscriptions.</li>
              <li>Send service notifications, summaries, and support communications.</li>
              <li>Measure marketing performance and improve our website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Sharing of Information</h2>
            <p className="text-neutral-700 leading-relaxed">
              We share information with trusted service providers (e.g., hosting, payment processing, telephony,
              analytics) only as needed to deliver the service. We do not sell your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Data Retention</h2>
            <p className="text-neutral-700 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services,
              comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-neutral-700 leading-relaxed">
              Depending on your location, you may have rights to access, correct, delete, or export your personal
              data, and to object to or restrict certain processing. Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Security</h2>
            <p className="text-neutral-700 leading-relaxed">
              We use industry-standard safeguards to protect your information. No method of transmission over the
              internet is 100% secure, but we work hard to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Compliance</h2>
            <p className="text-neutral-700 leading-relaxed">
              Our calling features include quiet-hours enforcement and opt-out handling to support TCPA and similar
              regulations. You are responsible for ensuring you have appropriate consent to contact your leads.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Changes to This Policy</h2>
            <p className="text-neutral-700 leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes will be posted on this page
              with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
            <p className="text-neutral-700 leading-relaxed">
              Questions about this Privacy Policy? Email us at{" "}
              <a href="mailto:support@rockyaivoice.org" className="text-primary underline">support@rockyaivoice.org</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-neutral-200 py-8">
        <div className="mx-auto max-w-5xl px-4 text-sm text-neutral-600">
          © 2025 Rocky AI. All rights reserved. · <Link to="/" className="hover:text-neutral-900">Home</Link>
        </div>
      </footer>
    </div>
  );
}
