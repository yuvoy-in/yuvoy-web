import { z } from "zod";
import { apiBaseUrl } from "@/lib/api/base-url";
import { isAllowedPoster } from "@/lib/api/listing-poster";
import type { Money } from "@/lib/format/money";

/**
 * The listing the homepage shows: the newest one on the app's browse surface,
 * read from the public API when the page is built and again at most every
 * five minutes after that (yuvoy-web#171).
 *
 * It replaced a five-screen tour of a made-up operator, price, seat count and
 * booking reference. Reading a listing instead of writing a mock means the
 * homepage cannot show anything the app would not: the same listing, the same
 * price and unit, the same operator, and "Verified" only where the API says
 * `operator.verified`.
 *
 * ## What it carries, and what it leaves behind
 *
 * Title, activity, place, operator, the verified flag, the price and its unit
 * phrase, and the poster. **Not the next date and not the seats left.** The
 * page is static and regenerated in the background, so what a visitor sees
 * can be one regeneration old, and after a quiet night that is a whole night.
 * A price or a name survives that; "3 seats left" and "Next open: Fri" do
 * not, and the app is one tap away with both, live.
 *
 * ## Which listing
 *
 * The first one in `GET /v1/experiences`, the browse surface, whose hero
 * poster this site can serve. That list is ordered by recency and is stable
 * between requests, so the homepage changes when a listing is published,
 * edited or withdrawn, and this file makes no editorial choice of its own.
 *
 * **Not the reel feed**, although the feed is what the app opens on. The feed
 * is shuffled for every visit (yuvoy-api#213, decision D-042), so reading it
 * here would put a different listing on the homepage, and a different poster
 * through the image optimiser, every time the page regenerated.
 *
 * ## When the read fails
 *
 * The page renders without a listing and says where the listings are. It
 * never throws: a deploy must not depend on the API being up that minute,
 * and not every page that shows this has an earlier copy to fall back on.
 * The homepage regenerates in the background, but `/go/<source>` renders on
 * every request, and a throw there is an error page in front of a campaign
 * arrival. That was tried, and the e2e suite caught it. The cost is bounded:
 * if the API blinks while the homepage regenerates, the no-listing state
 * stands until the next regeneration, five minutes at most.
 *
 * The first failure in a server process is logged, so a homepage that has
 * lost its listing has a reason somewhere. An empty list is not a failure: it
 * is the true state.
 */

/** How stale the homepage's listing may get while people are visiting. */
export const LISTING_REVALIDATE_SECONDS = 300;

/** A build waits this long at most; the API answers in well under a second. */
const READ_TIMEOUT_MS = 4_000;

/** Enough to step past a listing with no usable poster without paging. */
const CANDIDATES = 10;

export interface LiveListing {
  slug: string;
  title: string;
  /** "Scuba diving". Absent on a listing nobody has classified. */
  activity: string | null;
  /** "Havelock (Swaraj Dweep)", as the API names it. */
  place: string | null;
  operator: { name: string; verified: boolean };
  /** Absent until a real contracted price exists. Never a placeholder. */
  price: Money | null;
  /** The API's phrase for the unit ("per person", "for the group"). Verbatim. */
  priceUnit: string | null;
  poster: { url: string; alt: string };
}

const text = z.string().trim().min(1);

const MoneySchema = z.object({
  amountMinor: z.number().int().positive(),
  currency: z.string().regex(/^[A-Z]{3}$/),
});

/**
 * Only the fields the card prints. Anything else on the item is ignored, so
 * the API can grow without this breaking. A malformed optional field is read
 * as absent rather than costing the whole listing.
 */
const ListingSchema = z.object({
  slug: text,
  title: text,
  location: text.optional().catch(undefined),
  activityTypeLabel: text.optional().catch(undefined),
  fromPrice: MoneySchema.optional().catch(undefined),
  pricingUnitLabel: text.optional().catch(undefined),
  operator: z.object({ name: text, verified: z.boolean() }),
  heroMedia: z.object({
    posterUrl: z.string().refine(isAllowedPoster),
    alt: z.string().trim().optional().catch(undefined),
  }),
});

const PageSchema = z.object({ items: z.array(z.unknown()) });

/**
 * The first usable listing in a `GET /v1/experiences` body, or null when
 * there is none. Throws when the body is not a page of listings at all, which
 * is a failed read rather than an empty one.
 */
export function firstListing(body: unknown): LiveListing | null {
  for (const item of PageSchema.parse(body).items) {
    const parsed = ListingSchema.safeParse(item);
    if (!parsed.success) continue;

    const experience = parsed.data;
    const media = experience.heroMedia;
    const price = experience.fromPrice ?? null;
    return {
      slug: experience.slug,
      title: experience.title,
      activity: experience.activityTypeLabel ?? null,
      place: experience.location ?? null,
      operator: experience.operator,
      price,
      // The unit belongs to the price; without one it describes nothing.
      priceUnit: price ? (experience.pricingUnitLabel ?? null) : null,
      poster: { url: media.posterUrl, alt: media.alt ?? "" },
    };
  }
  return null;
}

let failureReported = false;

/** Once per process: the reason is the same every time, and a log line per
    page view would bury it. */
function reportFailure(error: unknown): void {
  if (failureReported) return;
  failureReported = true;
  console.warn(
    "Homepage listing unavailable; showing the no-listing state.",
    error instanceof Error ? error.message : error,
  );
}

export async function readLiveListing(): Promise<LiveListing | null> {
  const base = apiBaseUrl();
  if (!base) return null;

  try {
    const response = await fetch(`${base}/v1/experiences?limit=${CANDIDATES}`, {
      headers: { accept: "application/json" },
      // Only a 200 is cached, so a failed answer is never kept.
      next: { revalidate: LISTING_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`GET /v1/experiences answered ${response.status}`);
    }
    return firstListing(await response.json());
  } catch (error) {
    reportFailure(error);
    return null;
  }
}
