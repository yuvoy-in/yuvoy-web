import type { Category } from "@/lib/api/types";

/**
 * Display label + placeholder gradient per category. Gradients stand in for
 * photography until real assets land — full class strings are literal so
 * Tailwind detects them.
 */
export const CATEGORY_META: Record<
  Category,
  { label: string; gradient: string }
> = {
  adventure: { label: "Adventure", gradient: "from-terra/30 to-forest/25" },
  nature_wildlife: {
    label: "Nature & Wildlife",
    gradient: "from-forest/30 to-terra/15",
  },
  food_drink: { label: "Food & Drink", gradient: "from-terra/35 to-terra/10" },
  arts_creativity: {
    label: "Arts & Creativity",
    gradient: "from-terra/25 to-cream-deep",
  },
  learning: { label: "Learning", gradient: "from-forest/25 to-cream-deep" },
  culture_heritage: {
    label: "Culture & Heritage",
    gradient: "from-terra/25 to-forest/20",
  },
  wellness: { label: "Wellness", gradient: "from-forest/20 to-terra/10" },
  entertainment: {
    label: "Entertainment",
    gradient: "from-terra/30 to-midnight/25",
  },
  community: { label: "Community", gradient: "from-forest/25 to-terra/15" },
  sports: { label: "Sports", gradient: "from-forest/30 to-terra/20" },
  local_life: { label: "Local Life", gradient: "from-terra/25 to-forest/25" },
  events: { label: "Events", gradient: "from-midnight/30 to-terra/15" },
};
