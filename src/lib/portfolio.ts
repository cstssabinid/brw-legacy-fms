export type PortfolioCategory = {
  id: "studio-portraits" | "outdoors" | "events" | "wedding-coverage";
  label: string;
  eyebrow: string;
  title: string;
  copy: string;
  images: string[];
};

const studioPortraits = Array.from({ length: 44 }, (_, index) => `/studio-blog/studio_portraits%20(${index + 1}).JPG`);
const outdoors = Array.from({ length: 15 }, (_, index) => `/studio-blog/outdoors%20(${index + 1}).JPG`);
const events = Array.from({ length: 8 }, (_, index) => `/studio-blog/events%20(${index + 1}).JPG`);
const weddingCoverage = Array.from({ length: 4 }, (_, index) => `/studio-blog/wedding_covareges%20(${index + 1}).JPG`);

export const portfolioCategories: PortfolioCategory[] = [
  {
    id: "studio-portraits",
    label: "Studio portraits",
    eyebrow: "Portrait",
    title: "Studio Portraits",
    copy: "Controlled lighting, polished posing, and clean retouching for personal, fashion, and profile portraits.",
    images: studioPortraits
  },
  {
    id: "outdoors",
    label: "Outdoors",
    eyebrow: "Lifestyle",
    title: "Outdoor Stories",
    copy: "Natural locations shaped into bright memories for couples, families, graduates, and personal milestones.",
    images: outdoors
  },
  {
    id: "events",
    label: "Events",
    eyebrow: "Coverage",
    title: "Event Moments",
    copy: "Clear, lively coverage for ceremonies, corporate gatherings, birthdays, and community celebrations.",
    images: events
  },
  {
    id: "wedding-coverage",
    label: "Wedding coverage",
    eyebrow: "Marriage",
    title: "Wedding Coverage",
    copy: "Structured storytelling for ceremonies, receptions, portraits, albums, and highlight memories.",
    images: weddingCoverage
  }
];
