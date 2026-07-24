export type Tier = {
  id: string;
  index: string;
  name: string;
  price: string;
  priceNote?: string;
  tagline: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

// Edit your plans here — prices in INR.
export const TIERS: Tier[] = [
  {
    id: "starter",
    index: "01",
    name: "Starter",
    price: "₹2,999",
    tagline: "The essentials, done beautifully.",
    features: [
      "Up to 4 pages",
      "Responsive on every device",
      "Fast & SEO-ready",
      "Contact & social links",
    ],
    cta: "Choose Starter",
  },
  {
    id: "custom",
    index: "02",
    name: "Custom",
    price: "₹6,999",
    tagline: "Shaped around your brand.",
    features: [
      "Everything in Starter",
      "Themes & styles, your choice",
      "Custom sections & layout",
      "Revisions until it's right",
    ],
    cta: "Choose Custom",
    featured: true,
  },
  {
    id: "signature",
    index: "03",
    name: "Signature",
    price: "Let's talk",
    priceNote: "tailored quote",
    tagline: "Bespoke, without limits.",
    features: [
      "Fully bespoke design",
      "Advanced features & integrations",
      "Unique, memorable interactions",
      "Built entirely to your vision",
    ],
    cta: "Start a conversation",
  },
];
