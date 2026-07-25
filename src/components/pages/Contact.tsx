"use client";

import { useEffect, useState, type FormEvent } from "react";
import Rise from "../Rise";
import { useBook } from "../Book";

const INBOX = "dawndevs@hotmail.com";
// TODO: add your WhatsApp number in international format (no +, e.g. "919876543210")
// to reveal a "Chat on WhatsApp" link. Left blank so no placeholder number ships.
const WHATSAPP = "";

// Web3Forms — a free form backend, no server code needed. Submissions are
// emailed to the address the key is registered to. The access key is public by
// design (it's exposed in the browser either way), so it's committed here as the
// default; an env var (NEXT_PUBLIC_WEB3FORMS_KEY) overrides it if you'd rather
// keep it out of the repo. This default means the form works on any host with no
// extra configuration. If the key is ever blanked, the form falls back to
// opening the visitor's email app.
const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_KEY ??
  "47be3ef1-261c-40bb-931b-664f74013547";
const USES_WEB3FORMS = WEB3FORMS_ACCESS_KEY.length > 0;

const PLANS = [
  "Starter — ₹2,999",
  "Custom — ₹6,999",
  "Signature — tailored quote",
  "Not sure yet",
];

export default function Contact() {
  const { selectedPlan } = useBook();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState(selectedPlan);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [botField, setBotField] = useState(""); // honeypot — humans never fill it

  // preselect the plan the visitor picked on the pricing page
  useEffect(() => {
    const match = PLANS.find((p) => p.startsWith(selectedPlan.split(" — ")[0]));
    setPlan(match ?? "Not sure yet");
  }, [selectedPlan]);

  // No key configured yet → open the visitor's email app (the previous flow).
  function mailtoFallback() {
    const subject = `New website enquiry — ${plan}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Interested in: ${plan}`,
      "",
      "About the project:",
      message || "(not provided)",
      "",
      "— sent from dawndevs.dev",
    ].join("\n");
    window.location.href = `mailto:${INBOX}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (botField) return; // spam bot tripped the honeypot — drop it silently
    setError("");

    if (!USES_WEB3FORMS) {
      mailtoFallback();
      setSent(true);
      return;
    }

    setSending(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New website enquiry — ${plan}`,
          from_name: "dawndevs.dev",
          name,
          email,
          plan,
          message: message || "(not provided)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(
          data.message ?? "Something went wrong — please try again or email us."
        );
      }
    } catch {
      setError("Couldn't send just now — please email us directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-14">
      {/* invitation */}
      <div>
        <Rise delay={0.05}>
          <p className="eyebrow mb-8">Contact</p>
        </Rise>
        <h2 className="display text-4xl leading-[1.05] text-ink sm:text-5xl md:text-7xl">
          <Rise delay={0.12}>
            <span className="block">Let&apos;s begin</span>
          </Rise>
          <Rise delay={0.2}>
            <span className="block italic sheen">your project.</span>
          </Rise>
        </h2>
        <Rise delay={0.32}>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted">
            Tell us a little about your business. We reply to every message,
            usually within a day.
          </p>
        </Rise>
        <Rise delay={0.42}>
          <div className="mt-8 flex flex-col gap-3 text-sm">
            <a
              href={`mailto:${INBOX}`}
              className="w-fit text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-ink"
            >
              {INBOX}
            </a>
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-ink"
              >
                Chat on WhatsApp
              </a>
            )}
          </div>
        </Rise>
      </div>

      {/* form */}
      <Rise delay={0.3}>
        <form onSubmit={submit} className="card rounded-2xl p-7 md:p-8">
          {sent ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-line-2 text-xl">
                ✓
              </span>
              <h3 className="display text-2xl text-ink">
                {USES_WEB3FORMS ? "Message sent." : "Your email is ready."}
              </h3>
              <p className="max-w-xs text-sm text-muted">
                {USES_WEB3FORMS
                  ? "Thanks for reaching out — we've got your details and will reply, usually within a day."
                  : "We opened your email app with everything filled in. Hit send and we'll take it from there."}
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-1 text-sm text-muted underline underline-offset-4 hover:text-ink"
              >
                Edit my details
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* honeypot — off-screen, hidden from humans, catches bots */}
              <input
                type="text"
                name="botcheck"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                value={botField}
                onChange={(e) => setBotField(e.target.value)}
                className="hidden"
              />
              <Field label="Your name">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="field rounded-lg"
                />
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@business.com"
                  className="field rounded-lg"
                />
              </Field>
              <Field label="Which plan?">
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="field rounded-lg"
                >
                  {PLANS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="About your business">
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A cafe that needs a fresh online home…"
                  className="field resize-none rounded-lg"
                />
              </Field>
              {error && (
                <p className="text-sm text-[#e6a08f]" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="btn-solid mt-1 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send enquiry"}
                {!sending && <span aria-hidden>→</span>}
              </button>
            </div>
          )}
        </form>
      </Rise>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-[10px] tracking-[0.2em]">{label}</span>
      {children}
    </label>
  );
}
