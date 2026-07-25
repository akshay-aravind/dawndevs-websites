import { TIERS } from "./tiers";

/* --------------------------------------------------------------------------
   Structured data (JSON-LD) — server-rendered so every crawler and AI reader
   gets DawnDevs' identity, offerings and prices without executing the app's
   client-side "book". Kept in sync with the real plans in tiers.ts.
-------------------------------------------------------------------------- */

const SITE_URL = "https://dawndevs.dev";
const SITE_NAME = "DawnDevs";
const EMAIL = "dawndevs@hotmail.com";
const DESCRIPTION =
  "A studio that builds one thing, beautifully: websites. Three clear ways to work together — Starter, Custom, and Signature.";

// "₹2,999" → "2999" (Offer.price wants a bare number; currency is separate).
const numericPrice = (price: string) => price.replace(/[^0-9.]/g, "");

export default function StructuredData() {
  const graph = [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#studio`,
      name: SITE_NAME,
      alternateName: "DawnDevs Studio",
      description: DESCRIPTION,
      url: SITE_URL,
      email: EMAIL,
      image: `${SITE_URL}/opengraph-image.png`,
      logo: `${SITE_URL}/icon.png`,
      priceRange: "₹₹",
      areaServed: "Worldwide",
      knowsAbout: [
        "Website design",
        "Website development",
        "Responsive web design",
        "Landing pages",
        "Small business websites",
      ],
      serviceType: "Website design and development",
      contactPoint: {
        "@type": "ContactPoint",
        email: EMAIL,
        contactType: "customer support",
        availableLanguage: ["English"],
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Website plans",
        itemListElement: TIERS.map((t) => {
          const numeric = numericPrice(t.price);
          return {
            "@type": "Offer",
            name: t.name,
            description: t.tagline,
            category: "Website design",
            ...(numeric
              ? { price: numeric, priceCurrency: "INR" }
              : { priceSpecification: { "@type": "PriceSpecification", description: "Tailored quote" } }),
            itemOffered: {
              "@type": "Service",
              name: `${t.name} website plan`,
              description: t.tagline,
              serviceType: "Website design and development",
              provider: { "@id": `${SITE_URL}/#studio` },
            },
          };
        }),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#studio` },
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      // Server-rendered constant; no user input flows into this string.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
