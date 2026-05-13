import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — NairaLens" },
      { name: "description", content: "NairaLens Terms of Service — the rules and agreements governing use of the platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-noir text-foreground">
      <header className="border-b border-border bg-noir-elevated/40 backdrop-blur-xl px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo size="md" />
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to NairaLens
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <p className="font-mono text-xs text-gold mb-2">LEGAL</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3">Terms of Service</h1>
          <p className="text-sm text-muted-foreground font-mono">Last updated: 9 May 2026</p>
        </div>

        <div className="space-y-10 text-muted-foreground text-sm sm:text-base leading-relaxed">

          <Section title="1. Acceptance of Terms">
            <p>
              These Terms of Service ("Terms") are a legally binding agreement between you ("Customer", "you", or "your")
              and Montech Stack Ltd ("NairaLens", "we", "us", or "our"), the operator of the NairaLens platform.
            </p>
            <p>
              By creating an account, accessing, or using NairaLens in any way, you confirm that you have read,
              understood, and agree to these Terms. If you are using NairaLens on behalf of a company or organisation,
              you represent that you have authority to bind that entity to these Terms.
            </p>
            <p>
              If you do not agree to these Terms, you must not use the Service.
            </p>
          </Section>

          <Section title="2. Description of the Service">
            <p>
              NairaLens is an AI-powered sales automation platform built for Nigerian real estate businesses. The Service
              includes:
            </p>
            <ul>
              <li>An AI sales agent that engages WhatsApp leads on behalf of your business.</li>
              <li>Lead intelligence and intent scoring (0–100 scale).</li>
              <li>Objection handling configuration and deployment.</li>
              <li>A Knowledge Vault for storing and retrieving property documents.</li>
              <li>Campaign management tools.</li>
              <li>Dashboard analytics and conversation audit logs.</li>
              <li>WhatsApp Cloud API integration via Meta for Developers.</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time. We will
              provide reasonable notice of material changes where possible.
            </p>
          </Section>

          <Section title="3. Account Registration and Security">
            <p>
              To use NairaLens, you must create an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information during registration and keep it updated.</li>
              <li>Choose a strong password and keep it confidential. You are responsible for all activity under your account.</li>
              <li>Notify us immediately at <strong>support@nairalens.com</strong> if you suspect unauthorised access to your account.</li>
              <li>Not share your account credentials with third parties or create accounts on behalf of others without authorisation.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or that appear to be
              used fraudulently.
            </p>
          </Section>

          <Section title="4. Subscription Plans and Payment">
            <SubHeading>4.1 Pricing</SubHeading>
            <p>
              NairaLens offers subscription plans as published on our website. Prices are stated in Nigerian Naira (₦)
              and are subject to change. We will notify active subscribers at least 30 days before any price increase
              takes effect.
            </p>
            <SubHeading>4.2 Free Trial</SubHeading>
            <p>
              We may offer a free trial period. At the end of the trial, you must subscribe to a paid plan to continue
              using the Service. We are not obligated to continue offering free trials.
            </p>
            <SubHeading>4.3 Billing</SubHeading>
            <p>
              Subscriptions are billed monthly or annually in advance. All payments are non-refundable except where
              required by Nigerian consumer protection law. If your payment fails, we will notify you and may suspend
              your account after a 7-day grace period.
            </p>
            <SubHeading>4.4 Taxes</SubHeading>
            <p>
              Prices exclude applicable taxes (including VAT at the rate prescribed by Nigerian law). You are
              responsible for any taxes applicable to your use of the Service.
            </p>
          </Section>

          <Section title="5. WhatsApp Integration and Meta Policy Compliance">
            <p>
              To use NairaLens's WhatsApp features, you connect your WhatsApp Business account or Meta ad accounts
              through NairaLens's Meta integration — no API keys or developer setup required. By connecting, you agree to:
            </p>
            <ul>
              <li>Comply with Meta's WhatsApp Business Policy, Commerce Policy, and Messaging Guidelines at all times.</li>
              <li>Obtain all necessary consents from leads and customers before messaging them via WhatsApp.</li>
              <li>Not use NairaLens to send spam, unsolicited bulk messages, or content that violates Meta's policies.</li>
              <li>Grant NairaLens only the permissions necessary to receive and send messages on your behalf, and revoke access at any time from your Meta Business settings.</li>
            </ul>
            <p>
              Any suspension or ban of your WhatsApp Business account by Meta is outside NairaLens's control.
              We will not provide refunds arising from Meta's enforcement actions against your account.
            </p>
          </Section>

          <Section title="6. Acceptable Use Policy">
            <p>You agree not to use NairaLens to:</p>
            <ul>
              <li>Violate any applicable Nigerian law or regulation, including NDPR/NDPA, the Cybercrimes (Prohibition, Prevention, etc.) Act, or consumer protection laws.</li>
              <li>Engage in deceptive, fraudulent, or misleading sales practices or misrepresent properties to leads.</li>
              <li>Send harassing, abusive, or threatening messages to leads through the AI agent.</li>
              <li>Transmit viruses, malware, or other harmful code.</li>
              <li>Attempt to reverse-engineer, scrape, or extract proprietary algorithms or models from the Service.</li>
              <li>Resell or sublicense the Service without our prior written consent.</li>
              <li>Use the Service for any purpose other than legitimate real estate sales and lead management.</li>
              <li>Upload documents you do not have the legal right to use or share.</li>
            </ul>
            <p>
              We reserve the right to investigate suspected violations and suspend or terminate accounts immediately
              without refund.
            </p>
          </Section>

          <Section title="7. AI-Generated Content Disclaimer">
            <p>
              NairaLens uses artificial intelligence to generate sales responses on behalf of your business. You
              acknowledge and agree that:
            </p>
            <ul>
              <li>AI-generated responses may occasionally contain errors, inaccuracies, or information that is incomplete. You are responsible for reviewing AI behaviour and configuring appropriate guardrails.</li>
              <li>NairaLens does not guarantee that AI responses will always close deals, qualify leads accurately, or comply with your specific business standards without your active configuration and oversight.</li>
              <li>You are legally responsible for all communications sent to leads through your WhatsApp number, including those generated by the NairaLens AI. We are a tool, not a party to your sales transactions.</li>
              <li>Claims made by the AI about property prices, availability, legal status, or market data are based on information you provide. NairaLens is not liable for incorrect information arising from inaccurate data in your Knowledge Vault or settings.</li>
            </ul>
          </Section>

          <Section title="8. Intellectual Property">
            <SubHeading>8.1 NairaLens IP</SubHeading>
            <p>
              The NairaLens platform, including its AI models, scoring algorithms, user interface, brand, and
              proprietary methodologies, are owned by Montech Stack Ltd and protected by Nigerian and international
              intellectual property laws. You receive a limited, non-exclusive, non-transferable licence to use the
              Service during your subscription period.
            </p>
            <SubHeading>8.2 Your Content</SubHeading>
            <p>
              You retain ownership of all content you upload to NairaLens, including property documents, scripts,
              and lead data. By uploading content, you grant us a limited licence to process and use that content
              solely to provide the Service to you.
            </p>
          </Section>

          <Section title="9. Confidentiality">
            <p>
              Each party agrees to keep the other's confidential information (including business data, pricing,
              technical details, and customer data) confidential and not to disclose it to third parties except
              as necessary to provide or use the Service, or as required by law.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by Nigerian law:
            </p>
            <ul>
              <li>NairaLens's total liability to you for any claim arising from or related to these Terms or the Service will not exceed the amount you paid us in the 3 months preceding the claim.</li>
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of revenue, loss of profit, loss of deals, loss of data, or business interruption.</li>
              <li>We are not liable for any downtime, service interruptions, or failure of third-party services (including Meta/WhatsApp, Supabase, or AI providers).</li>
            </ul>
          </Section>

          <Section title="11. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless NairaLens, its directors, employees, and partners
              from and against any claims, damages, losses, or expenses (including legal fees) arising from:
            </p>
            <ul>
              <li>Your use of the Service in violation of these Terms.</li>
              <li>Content you upload or messages sent through the AI agent that violate applicable laws or third-party rights.</li>
              <li>Your failure to comply with Meta's WhatsApp policies.</li>
              <li>Any misrepresentation you make to leads through the Service.</li>
            </ul>
          </Section>

          <Section title="12. Term and Termination">
            <p>
              These Terms apply from the date you create an account and continue until terminated. You may cancel
              your subscription at any time through your account dashboard. Cancellation takes effect at the end
              of your current billing period.
            </p>
            <p>
              We may terminate or suspend your account immediately (without refund) if you materially breach
              these Terms, fail to pay amounts due, or if required by law. Upon termination:
            </p>
            <ul>
              <li>Your access to the Service ends immediately.</li>
              <li>Your data will be retained for 30 days and then deleted, unless you request earlier deletion.</li>
              <li>Sections 7, 8, 9, 10, 11, 13, and 14 survive termination.</li>
            </ul>
          </Section>

          <Section title="13. Governing Law and Dispute Resolution">
            <p>
              These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria,
              without regard to conflict of law provisions.
            </p>
            <p>
              Any dispute arising from these Terms shall first be attempted to be resolved through good-faith
              negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration
              in Lagos, Nigeria, under the Arbitration and Conciliation Act (Cap A18, Laws of the Federation
              of Nigeria 2004). Judgment on any arbitration award may be entered in any court of competent jurisdiction.
            </p>
          </Section>

          <Section title="14. General Provisions">
            <ul>
              <li><strong>Entire agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and NairaLens.</li>
              <li><strong>Amendments:</strong> We may update these Terms at any time. We will notify you by email of material changes. Continued use constitutes acceptance.</li>
              <li><strong>Waiver:</strong> Our failure to enforce any right under these Terms does not constitute a waiver of that right.</li>
              <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions continue in full force.</li>
              <li><strong>Assignment:</strong> You may not assign these Terms without our prior written consent. We may assign them in connection with a merger or acquisition.</li>
            </ul>
          </Section>

          <Section title="15. Contact Us">
            <p>
              For questions about these Terms:
            </p>
            <ul>
              <li><strong>Email:</strong> legal@nairalens.com</li>
              <li><strong>Support:</strong> support@nairalens.com</li>
              <li><strong>Registered address:</strong> Montech Stack Ltd, Lagos, Nigeria</li>
            </ul>
          </Section>

        </div>
      </main>

      <footer className="border-t border-border py-8 px-4 sm:px-6 mt-12 bg-noir-elevated/20">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <span>© 2026 NairaLens · Montech Stack Ltd</span>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-gold">Privacy Policy</Link>
            <Link to="/" className="hover:text-gold">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-4 pb-2 border-b border-border/50">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-foreground mt-4 mb-1">{children}</h3>;
}
