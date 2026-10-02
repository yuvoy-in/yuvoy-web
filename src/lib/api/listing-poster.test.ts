import { describe, expect, it } from "vitest";
import { matchRemotePattern } from "next/dist/shared/lib/match-remote-pattern";
import {
  isAllowedPoster,
  POSTER_HOST,
  POSTER_REMOTE_PATTERN,
} from "./listing-poster";

/**
 * The listing reader and the image optimiser must agree on every poster. If
 * the reader accepts one the optimiser refuses, the homepage shows a broken
 * picture; the other way round, a usable listing is skipped. So the reader's
 * check is held to Next's own matcher, run on the exact pattern
 * `next.config.ts` installs.
 */
const CASES = [
  // The shape the API served on 2 Oct 2026.
  `https://${POSTER_HOST}/6d198ca2c35edc71cbb85de546721d96/thumbnails/thumbnail.jpg`,
  `https://${POSTER_HOST}/6d198ca2c35edc71cbb85de546721d96/thumbnails/thumbnail.jpg?time=2s&height=600`,
  `http://${POSTER_HOST}/abc/thumbnails/thumbnail.jpg`,
  `https://${POSTER_HOST}:8443/abc/thumbnails/thumbnail.jpg`,
  `https://${POSTER_HOST}/abc/manifest/video.m3u8`,
  `https://${POSTER_HOST}/thumbnails/thumbnail.jpg`,
  `https://customer-someoneelse.cloudflarestream.com/abc/thumbnails/thumbnail.jpg`,
  `https://${POSTER_HOST}.evil.example/abc/thumbnails/thumbnail.jpg`,
  "https://imagedelivery.net/abc/logo/public",
];

describe("isAllowedPoster", () => {
  it("accepts the API's posters", () => {
    expect(isAllowedPoster(CASES[0])).toBe(true);
    expect(isAllowedPoster(CASES[1])).toBe(true);
  });

  it("refuses anything the optimiser would not serve", () => {
    for (const url of CASES.slice(2)) {
      expect(isAllowedPoster(url), url).toBe(false);
    }
    expect(isAllowedPoster("not a url")).toBe(false);
    expect(isAllowedPoster("")).toBe(false);
  });

  it("gives the same answer as Next's matcher on the configured pattern", () => {
    for (const url of CASES) {
      expect(isAllowedPoster(url), url).toBe(
        matchRemotePattern(POSTER_REMOTE_PATTERN, new URL(url)),
      );
    }
  });
});
