import type { components } from "./schema";

/**
 * Ergonomic aliases over the generated OpenAPI schema. Import these across the
 * app so the contract stays the single source of truth — regenerate with
 * `pnpm codegen` whenever `contracts/openapi.yaml` changes.
 */
type Schemas = components["schemas"];

export type Money = Schemas["Money"];
export type Category = Schemas["Category"];
export type ExperienceMode = Schemas["ExperienceMode"];
export type PolicyTier = Schemas["PolicyTier"];
export type Provider = Schemas["Provider"];
export type Media = Schemas["Media"];
export type ExperienceSummary = Schemas["ExperienceSummary"];
export type Experience = Schemas["Experience"];
export type ExperiencePage = Schemas["ExperiencePage"];
export type Slot = Schemas["Slot"];
export type Booking = Schemas["Booking"];
export type User = Schemas["User"];
