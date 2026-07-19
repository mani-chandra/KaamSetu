/** Curated Unsplash covers for category groups — slugs match `CATEGORY_CATALOG`. All URLs verified (HTTP 200). */
export const CATEGORY_GROUP_IMAGES: Record<string, string> = {
  "home-repair-maintenance":
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&q=80&auto=format&fit=crop",
  "cleaning-services":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80&auto=format&fit=crop",
  "home-improvement":
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80&auto=format&fit=crop",
  education:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80&auto=format&fit=crop",
  "beauty-wellness":
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80&auto=format&fit=crop",
  "healthcare-personal-care":
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80&auto=format&fit=crop",
  childcare:
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=900&q=80&auto=format&fit=crop",
  "cooking-food":
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&q=80&auto=format&fit=crop",
  transportation:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80&auto=format&fit=crop",
  "event-services":
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=80&auto=format&fit=crop",
  "digital-it-services":
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80&auto=format&fit=crop",
  "automobile-services":
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=80&auto=format&fit=crop",
  "pet-services":
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&q=80&auto=format&fit=crop",
  "moving-logistics":
    "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=900&q=80&auto=format&fit=crop",
  "religious-cultural-services":
    "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=900&q=80&auto=format&fit=crop",
  "rental-services":
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80&auto=format&fit=crop",
};

export const DEFAULT_CATEGORY_GROUP_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&auto=format&fit=crop";

/** Journey + bridge backgrounds (verified). */
export const HOME_STORY_IMAGES = {
  wide: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=2400&q=85&auto=format&fit=crop",
  interior: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=2400&q=85&auto=format&fit=crop",
  tap: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=2400&q=85&auto=format&fit=crop",
  service: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=2400&q=85&auto=format&fit=crop",
  bridge: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=2400&q=80&auto=format&fit=crop",
} as const;

export function getCategoryGroupImage(slug: string, categoryImageUrl?: string | null) {
  return categoryImageUrl || CATEGORY_GROUP_IMAGES[slug] || DEFAULT_CATEGORY_GROUP_IMAGE;
}
