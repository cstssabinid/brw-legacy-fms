export type PortfolioCategory = {
  id: "studio-portraits" | "outdoor-sessions" | "event-coverage" | "weddings";
  label: string;
  eyebrow: string;
  title: string;
  shortTitle: string;
  copy: string;
  description: string;
  images: string[];
  cta: string;
};

const imageSet = (folder: string, prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => `/portfolio/${folder}/${prefix}-${index + 1}.jpg`);

export const portfolioCategories: PortfolioCategory[] = [
  {
    id: "studio-portraits",
    label: "Studio Portraits",
    eyebrow: "Portrait",
    title: "Studio Portraits",
    shortTitle: "Portrait",
    copy: "Clean portraits with controlled lighting, polished posing, and professional retouching for personal, fashion, and profile sessions.",
    description: "Clean portraits with controlled lighting, polished posing, and professional retouching for personal, fashion, and profile sessions.",
    images: imageSet("studio", "studio", 44),
    cta: "View Studio Work"
  },
  {
    id: "outdoor-sessions",
    label: "Outdoor Sessions",
    eyebrow: "Outdoor",
    title: "Outdoor Sessions",
    shortTitle: "Outdoor",
    copy: "Natural light photography for birthdays, lifestyle shoots, couple sessions, and personal memories in beautiful outdoor locations.",
    description: "Natural light photography for birthdays, lifestyle shoots, couple sessions, and personal memories in beautiful outdoor locations.",
    images: imageSet("outdoor", "outdoor", 15),
    cta: "View Outdoor Work"
  },
  {
    id: "event-coverage",
    label: "Event Coverage",
    eyebrow: "Coverage",
    title: "Event Coverage",
    shortTitle: "Events",
    copy: "Professional coverage for celebrations, launches, parties, graduations, and special gatherings with clear storytelling through images.",
    description: "Professional coverage for celebrations, launches, parties, graduations, and special gatherings with clear storytelling through images.",
    images: imageSet("events", "event", 8),
    cta: "View Event Work"
  },
  {
    id: "weddings",
    label: "Weddings",
    eyebrow: "Wedding",
    title: "Weddings",
    shortTitle: "Wedding",
    copy: "Elegant wedding photography for traditional, civil, and church ceremonies, capturing the full story from preparation to celebration.",
    description: "Elegant wedding photography for traditional, civil, and church ceremonies, capturing the full story from preparation to celebration.",
    images: imageSet("weddings", "wedding", 4),
    cta: "View Wedding Work"
  }
];
