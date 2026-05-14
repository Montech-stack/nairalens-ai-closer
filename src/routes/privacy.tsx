import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — NairaLens" },
      {
        name: "description",
        content: "NairaLens Privacy Policy — how we collect, use, and protect your data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-noir text-foreground">
      <header className="border-b border-border bg-noir-elevated/40 backdrop-blur-xl px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo size="md" />
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to NairaLens
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <p className="font-mono text-xs text-gold mb-2">LEGAL</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground font-mono">Last updated: 9 May 2026</p>
        </div>

        <div className="prose-dark space-y-10 text-muted-foreground text-sm sm:text-base leading-relaxed">
          <Section title="1. Introduction">
            <p>
              NairaLens ("we", "our", or "us") is operated by Montech Stack Ltd, a technology
              company registered in Nigeria. This Privacy Policy explains how we collect, use,
              share, and protect information about you when you use the NairaLens platform,
              including our website, AI sales engine, WhatsApp integration, and related services
              (collectively, the "Service").
            </p>
            <p>
              By using NairaLens, you agree to the practices described in this policy. If you do not
              agree, please stop using the Service. We are committed to compliance with the Nigeria
              Data Protection Regulation (NDPR) 2019 and the Nigeria Data Protection Act (NDPA)
              2023.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect the following categories of information:</p>
            <SubHeading>2.1 Information You Provide Directly</SubHeading>
            <ul>
              <li>
                <strong>Account information:</strong> Name, email address, phone number, and
                password when you register.
              </li>
              <li>
                <strong>Business information:</strong> Company name, business type, city of
                operation, number of agents, and revenue details entered during onboarding.
              </li>
              <li>
                <strong>WhatsApp connection:</strong> Your WhatsApp Business account and Meta ad
                account identifiers, obtained via Meta's OAuth flow when you connect through
                NairaLens. NairaLens manages the API infrastructure on your behalf.
              </li>
              <li>
                <strong>Knowledge Vault content:</strong> Documents you upload (e.g., C of O, Survey
                Plans, property listings) for the AI to reference during sales conversations.
              </li>
              <li>
                <strong>Objection scripts and sales personas:</strong> Custom instructions you
                configure for your AI sales agent.
              </li>
            </ul>
            <SubHeading>2.2 Information Collected Automatically</SubHeading>
            <ul>
              <li>
                <strong>Lead conversation data:</strong> WhatsApp messages sent to your business
                number that are processed through the NairaLens webhook.
              </li>
              <li>
                <strong>Usage data:</strong> Pages visited, features used, clicks, session duration,
                and in-app actions.
              </li>
              <li>
                <strong>Device and technical data:</strong> IP address, browser type, operating
                system, and referring URL.
              </li>
              <li>
                <strong>Performance data:</strong> API response times, error logs, and system health
                metrics.
              </li>
            </ul>
            <SubHeading>2.3 Information from Third Parties</SubHeading>
            <ul>
              <li>
                <strong>WhatsApp/Meta:</strong> Lead messages routed through the Meta WhatsApp Cloud
                API to our webhook.
              </li>
              <li>
                <strong>Supabase:</strong> We use Supabase (hosted on AWS) as our database and
                authentication provider.
              </li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, and improve the NairaLens platform and AI sales engine.</li>
              <li>Authenticate your identity and secure your account.</li>
              <li>
                Process incoming WhatsApp leads, generate AI responses, and score lead intent.
              </li>
              <li>
                Train and fine-tune AI response quality based on aggregated, anonymised conversation
                patterns (never attributable to individual leads or businesses without consent).
              </li>
              <li>
                Send transactional communications (account confirmations, billing receipts, service
                alerts).
              </li>
              <li>
                Send product updates and marketing communications (you may opt out at any time).
              </li>
              <li>
                Detect, prevent, and investigate fraud, abuse, or violations of our Terms of
                Service.
              </li>
              <li>
                Comply with applicable laws, regulations, and lawful requests from Nigerian
                authorities.
              </li>
            </ul>
          </Section>

          <Section title="4. WhatsApp Lead Data">
            <p>
              When you connect your WhatsApp Business number to NairaLens, messages sent by your
              leads are received by our servers via the Meta WhatsApp Cloud API webhook. Please
              note:
            </p>
            <ul>
              <li>
                Your leads' phone numbers, names (if shared), and message content are stored in your
                NairaLens account database, scoped exclusively to your organisation.
              </li>
              <li>
                You are the data controller for your leads' personal data. NairaLens acts as a data
                processor on your behalf.
              </li>
              <li>
                You are responsible for obtaining any consents required from your leads under
                applicable law, including NDPR, before collecting their data via WhatsApp.
              </li>
              <li>
                Lead data is not shared with other NairaLens customers or used to train models in a
                way that could identify your leads without explicit consent.
              </li>
              <li>
                You can export or delete your lead data at any time from the NairaLens dashboard.
              </li>
            </ul>
          </Section>

          <Section title="5. Data Sharing and Disclosure">
            <p>
              We do not sell your personal data. We may share it only in the following
              circumstances:
            </p>
            <ul>
              <li>
                <strong>Service providers:</strong> Supabase (database/auth), Cloudflare
                (hosting/CDN), and other infrastructure partners who process data on our behalf
                under strict data processing agreements.
              </li>
              <li>
                <strong>Meta/WhatsApp:</strong> Our integration with the Meta WhatsApp Cloud API is
                governed by Meta's own privacy policies.
              </li>
              <li>
                <strong>AI model providers:</strong> Conversation data may be sent to AI inference
                providers (e.g., OpenAI or Anthropic) to generate responses. This is done without
                your lead's full name or other unnecessary identifiers where possible.
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose data if required by Nigerian
                law, court order, or regulatory authority.
              </li>
              <li>
                <strong>Business transfers:</strong> In the event of a merger, acquisition, or sale
                of assets, your data may be transferred. We will notify you in advance.
              </li>
            </ul>
          </Section>

          <Section title="6. Data Storage and Security">
            <p>
              Your data is stored on servers in the European Union (Supabase) and served via
              Cloudflare's global edge network. We implement industry-standard security measures
              including:
            </p>
            <ul>
              <li>AES-256 encryption for data at rest.</li>
              <li>TLS 1.2+ encryption for all data in transit.</li>
              <li>
                Row-Level Security (RLS) policies in our database so each organisation's data is
                isolated.
              </li>
              <li>Regular security audits and penetration testing.</li>
              <li>Access controls limiting employee access to production data.</li>
            </ul>
            <p>
              No system is 100% secure. If you believe your account has been compromised, contact us
              immediately at <strong>security@nairalens.com</strong>.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your data for as long as your account is active or as needed to provide the
              Service. Specifically:
            </p>
            <ul>
              <li>
                <strong>Account data:</strong> Retained until you delete your account, plus 30 days
                for recovery.
              </li>
              <li>
                <strong>Lead conversation logs:</strong> Retained for 24 months by default. You can
                delete individual conversations or all lead data at any time.
              </li>
              <li>
                <strong>Billing records:</strong> Retained for 7 years as required by Nigerian tax
                law.
              </li>
              <li>
                <strong>System logs:</strong> Retained for 90 days for security and debugging
                purposes.
              </li>
            </ul>
          </Section>

          <Section title="8. Your Rights Under NDPR/NDPA">
            <p>
              As a data subject or data controller using our platform, you have the following rights
              under Nigerian data protection law:
            </p>
            <ul>
              <li>
                <strong>Right to access:</strong> Request a copy of the personal data we hold about
                you.
              </li>
              <li>
                <strong>Right to rectification:</strong> Correct inaccurate or incomplete data.
              </li>
              <li>
                <strong>Right to erasure:</strong> Request deletion of your personal data, subject
                to legal retention requirements.
              </li>
              <li>
                <strong>Right to data portability:</strong> Export your data in a machine-readable
                format (CSV/JSON).
              </li>
              <li>
                <strong>Right to object:</strong> Object to processing of your data for marketing
                purposes.
              </li>
              <li>
                <strong>Right to restrict processing:</strong> Request that we limit how we use your
                data in certain circumstances.
              </li>
            </ul>
            <p>
              To exercise these rights, email <strong>privacy@nairalens.com</strong>. We will
              respond within 30 days.
            </p>
          </Section>

          <Section title="9. Cookies and Tracking">
            <p>
              NairaLens uses cookies and similar technologies to maintain your session, remember
              your preferences, and analyse usage. Types of cookies we use:
            </p>
            <ul>
              <li>
                <strong>Strictly necessary:</strong> Required for authentication and session
                management. Cannot be disabled.
              </li>
              <li>
                <strong>Analytics:</strong> Anonymous usage statistics to help us improve the
                product. You may opt out.
              </li>
            </ul>
            <p>
              We do not use third-party advertising cookies or sell your cookie data to advertisers.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              NairaLens is a business tool intended for adults and companies. We do not knowingly
              collect personal data from anyone under the age of 18. If you believe a minor has
              created an account, please contact us and we will delete the account promptly.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the
              "Last updated" date above and notify you by email if the changes are material.
              Continued use of the Service after the effective date constitutes acceptance of the
              updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>For privacy-related questions, data requests, or to report a concern:</p>
            <ul>
              <li>
                <strong>Email:</strong> privacy@nairalens.com
              </li>
              <li>
                <strong>Security issues:</strong> security@nairalens.com
              </li>
              <li>
                <strong>Registered address:</strong> Montech Stack Ltd, Lagos, Nigeria
              </li>
            </ul>
            <p>
              You also have the right to lodge a complaint with the Nigeria Data Protection
              Commission (NDPC) at <strong>ndpb.gov.ng</strong> if you believe your rights have been
              violated.
            </p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-4 sm:px-6 mt-12 bg-noir-elevated/20">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <span>© 2026 NairaLens · Montech Stack Ltd</span>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-gold">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-gold">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-4 pb-2 border-b border-border/50">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-foreground mt-4 mb-1">{children}</h3>;
}
