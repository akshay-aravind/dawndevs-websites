import Book from "@/components/Book";
import StructuredData from "@/components/StructuredData";
import { TIERS } from "@/components/tiers";

export default function Home() {
  return (
    <>
      <StructuredData />
      <Book />
      <div className="grain" />

      {/* Crawlable fallback — the interactive "book" is client-rendered, so this
          gives search engines and no-JS readers the real content: heading,
          summary, offerings and prices, plus a way to get in touch. Only shown
          when JavaScript is unavailable, so it never duplicates the live app. */}
      <noscript>
        <main
          style={{
            maxWidth: "48rem",
            margin: "0 auto",
            padding: "3rem 1.5rem",
            lineHeight: 1.6,
          }}
        >
          <h1>DawnDevs — Website Design &amp; Development Studio</h1>
          <p>
            We craft websites worth remembering. One focused studio, building
            websites that feel made, not assembled — beautiful, fast and clear.
          </p>

          <h2>What we do</h2>
          <p>
            One craft, done with care: design, build and care. We make elegant,
            responsive, SEO-ready websites for businesses that want an online
            home they can be proud of.
          </p>

          <h2>Plans</h2>
          <ul>
            {TIERS.map((t) => (
              <li key={t.id}>
                <strong>
                  {t.name} — {t.price}
                  {t.priceNote ? ` (${t.priceNote})` : ""}
                </strong>
                : {t.tagline}
                <ul>
                  {t.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <h2>Contact</h2>
          <p>
            Tell us a little about your business and we&apos;ll reply, usually
            within a day. Email us at{" "}
            <a href="mailto:dawndevs@hotmail.com">dawndevs@hotmail.com</a>.
          </p>
        </main>
      </noscript>
    </>
  );
}
