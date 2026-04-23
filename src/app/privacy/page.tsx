/**
 * src/app/privacy/page.tsx — Privacy Policy (static, public)
 *
 * No auth required. Publicly accessible at /privacy.
 * Standard SaaS privacy policy covering data collection, use,
 * storage, and user rights under GDPR / IT Act 2000 (India).
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — GrowthX AI",
  description:
    "Learn how GrowthX AI collects, uses, and protects your data.",
};

const LAST_UPDATED = "23 April 2026";
const SUPPORT_EMAIL = "support@growthxai.in";
const COMPANY_NAME = "GrowthX AI";
const COMPANY_FULL = "GrowthX AI Technologies Private Limited";

export default function PrivacyPolicyPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* ── Header ── */}
        <header style={styles.header}>
          <a href="/" style={styles.logo}>
            GrowthX <span style={styles.logoAccent}>AI</span>
          </a>
        </header>

        {/* ── Hero ── */}
        <section style={styles.hero}>
          <p style={styles.chip}>Legal</p>
          <h1 style={styles.h1}>Privacy Policy</h1>
          <p style={styles.subtitle}>
            Last updated: <strong>{LAST_UPDATED}</strong>
          </p>
        </section>

        {/* ── Body ── */}
        <article style={styles.article}>
          <Section title="1. Introduction">
            <p>
              Welcome to {COMPANY_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
              or &ldquo;our&rdquo;). {COMPANY_FULL} operates the GrowthX AI
              platform (the &ldquo;Service&rdquo;), a contribution-margin
              intelligence tool for direct-to-consumer (D2C) brands. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard information when you use our Service.
            </p>
            <p>
              By accessing or using the Service you agree to the terms of this
              Privacy Policy. If you disagree, please discontinue use
              immediately.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h3 style={styles.h3}>2.1 Account Information</h3>
            <p>
              When you register, we collect your name, business email address,
              company name, and a hashed password. We never store passwords in
              plain text.
            </p>

            <h3 style={styles.h3}>2.2 E-Commerce Channel Data</h3>
            <p>
              To provide margin analytics, you authorize us to read order,
              product, and inventory data from connected platforms (currently
              Shopify and Amazon SP-API). We collect:
            </p>
            <ul style={styles.list}>
              <li>Order line items, quantities, prices, and statuses</li>
              <li>SKU identifiers and product names</li>
              <li>Return and refund records</li>
              <li>Advertising spend reports (Amazon Ads API)</li>
            </ul>
            <p>
              We do <strong>not</strong> collect end-customer (buyer) personal
              data. All data is scoped to your brand&rsquo;s seller account.
            </p>

            <h3 style={styles.h3}>2.3 Manually Entered Data</h3>
            <p>
              You may enter cost inputs (packaging cost, logistics cost, ad
              spend percentages, etc.) directly into the Service. This data is
              stored against your tenant account and used solely to compute
              contribution margins.
            </p>

            <h3 style={styles.h3}>2.4 Usage &amp; Technical Data</h3>
            <p>
              We automatically collect standard server logs, IP addresses,
              browser type, page-view events, and error traces to operate and
              improve the Service. We use Vercel Analytics and Supabase for
              infrastructure; both operate under their own privacy programs.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul style={styles.list}>
              <li>
                <strong>Provide the Service</strong> — compute SKU-level
                contribution margins, surface AI-generated insights, and render
                your dashboard.
              </li>
              <li>
                <strong>Improve the Service</strong> — analyse aggregated,
                anonymised usage patterns to prioritise product improvements.
              </li>
              <li>
                <strong>Communication</strong> — send transactional emails
                (account setup, sync status, billing). We do not send marketing
                emails without explicit opt-in.
              </li>
              <li>
                <strong>Legal compliance</strong> — retain records as required
                by applicable law.
              </li>
            </ul>
            <p>
              We never sell, rent, or trade your data to third parties for
              advertising purposes.
            </p>
          </Section>

          <Section title="4. AI &amp; Data Processing">
            <p>
              The Service uses Google Gemini (Google DeepMind) to generate
              natural-language insights from your margin data. Data sent to the
              Gemini API is governed by{" "}
              <a
                href="https://policies.google.com/privacy"
                style={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google&rsquo;s Privacy Policy
              </a>
              . We do not use your data to train third-party AI models.
            </p>
            <p>
              AI-generated insights are clearly labelled and should be treated
              as decision-support, not financial advice.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your account and e-commerce data for as long as your
              account is active. On account deletion:
            </p>
            <ul style={styles.list}>
              <li>
                Personal account data (name, email) is deleted within 30 days.
              </li>
              <li>
                Order and margin data is anonymised and may be retained for up
                to 12 months for aggregate analytics purposes.
              </li>
              <li>
                Backups are purged on a rolling 90-day cycle.
              </li>
            </ul>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul style={styles.list}>
              <li>TLS 1.3 encryption for all data in transit</li>
              <li>AES-256 encryption for API credentials at rest</li>
              <li>
                Row-Level Security (RLS) on our Supabase database — tenants can
                only ever access their own data
              </li>
              <li>Regular dependency audits and penetration testing</li>
            </ul>
            <p>
              No system is 100% secure. If you discover a vulnerability, please
              disclose it responsibly to{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.link}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="7. Cookies &amp; Tracking">
            <p>
              We use strictly necessary cookies to maintain your authenticated
              session via Supabase Auth. We do not use third-party advertising
              cookies. You can disable cookies in your browser, but doing so
              will prevent login from working.
            </p>
          </Section>

          <Section title="8. Third-Party Services">
            <p>
              The Service integrates with the following third parties, each
              subject to their own privacy policies:
            </p>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Service</th>
                  <th style={styles.th}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Supabase", "Database & authentication"],
                  ["Vercel", "Frontend hosting & edge network"],
                  ["Railway", "Backend API hosting"],
                  ["Google Gemini API", "AI insight generation"],
                  ["Shopify Partners API", "Order data ingestion"],
                  ["Amazon SP-API", "Order & ad data ingestion"],
                ].map(([svc, purpose]) => (
                  <tr key={svc}>
                    <td style={styles.td}>{svc}</td>
                    <td style={styles.td}>{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="9. Your Rights">
            <p>
              Depending on your jurisdiction, you may have rights including:
            </p>
            <ul style={styles.list}>
              <li>
                <strong>Access</strong> — request a copy of the personal data
                we hold about you.
              </li>
              <li>
                <strong>Correction</strong> — request correction of inaccurate
                data.
              </li>
              <li>
                <strong>Deletion</strong> — request deletion of your account
                and associated data.
              </li>
              <li>
                <strong>Portability</strong> — receive your data in a
                machine-readable format.
              </li>
              <li>
                <strong>Objection</strong> — object to certain processing
                activities.
              </li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.link}>
                {SUPPORT_EMAIL}
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section title="10. International Data Transfers">
            <p>
              Our primary infrastructure is located in the Asia-Pacific region
              (Sydney &amp; Mumbai). Some sub-processors (e.g. Google Gemini)
              may process data in the United States or Europe. Where required,
              we rely on Standard Contractual Clauses or equivalent mechanisms
              for cross-border transfers.
            </p>
          </Section>

          <Section title="11. Children's Privacy">
            <p>
              The Service is not directed to children under 18. We do not
              knowingly collect personal information from minors. If you
              believe we have inadvertently collected such information, contact
              us immediately.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be communicated by email or an in-app banner at
              least 14 days before taking effect. Continued use of the Service
              after the effective date constitutes acceptance of the updated
              policy. The &ldquo;Last updated&rdquo; date at the top of this
              page reflects the most recent revision.
            </p>
          </Section>

          <Section title="13. Contact Us">
            <p>
              For privacy-related questions, requests, or complaints, contact
              us at:
            </p>
            <address style={styles.address}>
              <strong>{COMPANY_FULL}</strong>
              <br />
              Email:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.link}>
                {SUPPORT_EMAIL}
              </a>
            </address>
            <p>
              If you are located in the European Economic Area and our response
              does not satisfy you, you have the right to lodge a complaint
              with your local data protection authority.
            </p>
          </Section>
        </article>

        {/* ── Footer ── */}
        <footer style={styles.footer}>
          <p>
            &copy; {new Date().getFullYear()} {COMPANY_FULL}. All rights
            reserved.
          </p>
          <p>
            <a href="/" style={styles.footerLink}>
              Home
            </a>{" "}
            &middot;{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.footerLink}>
              Contact
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}

/* ── Section helper component ── */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.section}>
      <h2 style={styles.h2}>{title}</h2>
      {children}
    </section>
  );
}

/* ── Inline styles ── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f14 0%, #1a1a2e 100%)",
    color: "#e2e8f0",
    fontFamily:
      "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    lineHeight: 1.8,
  },
  container: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "0 24px 80px",
  },

  /* Header */
  header: {
    padding: "28px 0 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 48,
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: "#e2e8f0",
    textDecoration: "none",
    letterSpacing: "-0.5px",
  },
  logoAccent: {
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  /* Hero */
  hero: {
    marginBottom: 48,
  },
  chip: {
    display: "inline-block",
    background: "rgba(99,102,241,0.15)",
    color: "#818cf8",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "4px 14px",
    marginBottom: 16,
  },
  h1: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: 800,
    margin: "0 0 12px",
    letterSpacing: "-1px",
    lineHeight: 1.15,
    background: "linear-gradient(135deg, #f1f5f9 30%, #94a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    margin: 0,
  },

  /* Article */
  article: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  section: {
    padding: "32px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  h2: {
    fontSize: 20,
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: 16,
    marginTop: 0,
    letterSpacing: "-0.3px",
  },
  h3: {
    fontSize: 15,
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: 8,
    marginTop: 20,
  },
  list: {
    paddingLeft: 20,
    margin: "12px 0",
    color: "#94a3b8",
  },
  link: {
    color: "#818cf8",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
  address: {
    fontStyle: "normal",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "20px 24px",
    margin: "16px 0",
    lineHeight: 2,
    color: "#cbd5e1",
  },

  /* Table */
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 16,
    fontSize: 14,
  },
  th: {
    textAlign: "left",
    padding: "10px 16px",
    background: "rgba(255,255,255,0.05)",
    color: "#94a3b8",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  td: {
    padding: "12px 16px",
    color: "#cbd5e1",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    verticalAlign: "top",
  },

  /* Footer */
  footer: {
    marginTop: 64,
    paddingTop: 32,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    color: "#475569",
    fontSize: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  footerLink: {
    color: "#64748b",
    textDecoration: "none",
  },
};
