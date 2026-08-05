"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from "react";

/**
 * The brand veil — a full-page entrance that plays once per tab session
 * before the site is seen: on a night-water scene, a frame-scale ensō ring
 * draws itself around the surfacing mark, YUVOY rises through a baseline
 * mask, a handwritten stroke signs off under the kicker, and the surface
 * rolls up to unveil a page that has already settled underneath it. The
 * whole choreography is CSS in globals.css; this file only decides whether
 * it exists and tidies up after it.
 *
 * Who never sees it, decided before first paint by the inline script below:
 * anyone who already saw it this session (the storage flag), anyone who
 * prefers reduced motion, and anyone without JavaScript — for all of them
 * the veil stays `display: none` and React removes it at hydration. Showing
 * is the act that needs arguing for, which is what makes every no-show path
 * flash-proof.
 *
 * It is theatre over a live page, never a gate: the page renders and hydrates
 * behind it, the exit ends in `visibility: hidden` without JavaScript's help,
 * and any keypress dismisses it early — a keyboard user's focus must not sit
 * behind a curtain. The storage flag is stamped when it starts, not when it
 * ends, so a mid-play refresh does not replay it.
 */

const STORAGE_KEY = "yuvoy.intro-played";

/**
 * Mirrors the CSS timeline (`--intro-exit-at` + `--intro-exit`); the design
 * system's rule is that the two are changed together. Used only for the
 * belt-and-braces removal timeout, so it needs margin, not precision.
 */
const INTRO_TOTAL_MS = 3250;

/** The `data-skip` fade is 200ms in CSS; settle just after it. */
const SKIP_FADE_MS = 240;

const LETTERS = [..."YUVOY"];

/**
 * TEMPORARY (review aid, owner direction): freeze the veil after its
 * entrance so the composition can be inspected. While true: the close and
 * exit never run (CSS `[data-hold]` rule), no keypress or timer dismisses
 * it, and the session flag is neither read nor written, so every reload
 * replays it. Flip to false and remove the `[data-hold]` CSS rule before
 * merge — the veil must never ship holding a page hostage.
 */
const HOLD_FOR_REVIEW = true;

/**
 * Runs during HTML parsing, before first paint, from the <script> rendered
 * beneath the veil — which is why it may use getElementById. Kept inline,
 * dependency-free and defensive: if storage is unavailable the veil simply
 * never shows, which is the safe failure. Exported for the unit test, which
 * asserts the contract because jsdom never executes injected scripts.
 * Under `data-hold` (review aid) the session flag is bypassed so reloads
 * replay.
 */
export const INTRO_DECIDE = `(()=>{try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var v=document.getElementById("yuvoy-intro");if(!v)return;if(!v.hasAttribute("data-hold")){if(sessionStorage.getItem("${STORAGE_KEY}"))return;sessionStorage.setItem("${STORAGE_KEY}","1")}v.setAttribute("data-play","")}catch(e){}})()`;

export function BrandIntro() {
  const veilRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const veil = veilRef.current;
    if (!veil) return;

    // The pre-paint script did not stamp it (repeat visit, reduced motion,
    // or a client-only render where the script never ran): it is already
    // invisible, so just take it out of the tree.
    if (!veil.hasAttribute("data-play")) {
      setGone(true);
      return;
    }

    // TEMPORARY (review aid): held for inspection — no dismissal of any kind.
    if (veil.hasAttribute("data-hold")) return;

    let timer = 0;
    const settle = () => setGone(true);

    // The veil's own exit is the one that matters; the letters and the
    // sign-off stroke bubble their own `animationend` events past here.
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === veil && event.animationName === "yuvoy-intro-exit") {
        settle();
      }
    };

    const onKeyDown = () => {
      veil.setAttribute("data-skip", "");
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SKIP_FADE_MS);
    };

    veil.addEventListener("animationend", onAnimationEnd);
    window.addEventListener("keydown", onKeyDown);
    // If `animationend` never arrives (an extension pausing animations, an
    // interrupted paint), the veil still leaves the tree shortly after its
    // scheduled end.
    timer = window.setTimeout(settle, INTRO_TOTAL_MS + 600);

    return () => {
      veil.removeEventListener("animationend", onAnimationEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, []);

  if (gone) return null;

  return (
    <>
      <IntroVeil ref={veilRef} hold={HOLD_FOR_REVIEW} />
      <script dangerouslySetInnerHTML={{ __html: INTRO_DECIDE }} />
    </>
  );
}

/**
 * The veil's markup, presentation only — split out so the unit test can
 * assert the lockup without the lifecycle effect removing it first.
 *
 * `suppressHydrationWarning` is scoped to this element because the pre-paint
 * script legitimately mutates its attributes (`data-play`) between server
 * render and hydration. `aria-hidden`: the veil is theatre; the page behind
 * it is the accessible truth, and the skip link stays the first tab stop.
 */
export function IntroVeil({
  ref,
  hold = false,
}: {
  ref?: Ref<HTMLDivElement>;
  hold?: boolean;
}) {
  return (
    <div
      ref={ref}
      id="yuvoy-intro"
      aria-hidden
      suppressHydrationWarning
      data-hold={hold ? "" : undefined}
      className="intro-veil"
    >
      {/* The scene, bottom to top: drifting dive-light over the night-water
          gradient, then grain. Both are decoration layers the preview
          surface already owns; the veil borrows them at reduced strength. */}
      <div className="caustics opacity-60" />
      <div className="grain" />
      {/*
        The great ring — the ensō at the scale of the frame, drawing itself
        around the lockup. Its box shares the veil's bottom padding so its
        centre sits exactly on the lockup's optical centre.
      */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        className="intro-ring text-cream/12 absolute inset-0 bottom-12 m-auto size-72 sm:size-96"
      >
        <circle
          cx="50"
          cy="50"
          r="48.5"
          pathLength={1}
          stroke="currentColor"
          strokeWidth={0.9}
          strokeLinecap="round"
        />
      </svg>
      <div className="intro-stage flex flex-col items-center">
        <Image
          src="/brand/yuvoy-mark-on-dark.png"
          alt=""
          width={256}
          height={256}
          quality={100}
          priority
          className="intro-mark size-20 sm:size-24"
        />
        {/*
          The wordmark rules (§2): sans caps on `tracking-wordmark`. The
          negative margin gives back the tracking the last letter carries,
          so the word is optically centred, not centred-plus-a-gap. Each
          letter sits in an overflow-clipped cell and rises through its
          baseline — set type arriving, not a fade.
        */}
        <span className="tracking-wordmark text-cream mt-9 -mr-(--tracking-wordmark) flex font-sans text-4xl font-bold sm:text-5xl">
          {LETTERS.map((letter, index) => (
            <span key={index} className="overflow-hidden">
              <span
                className="intro-letter block"
                style={{ "--i": index } as CSSProperties}
              >
                {letter}
              </span>
            </span>
          ))}
        </span>
        <span className="intro-kicker label text-terra-soft mt-4">
          Experience more.
        </span>
        {/*
          The sign-off: a hand-drawn underline swash beneath the kicker — the
          ensō's brush answering in miniature (hand-drawn by owner direction,
          so the one sanctioned hand-rolled path). pathLength="1" lets the CSS
          dash pair draw it without knowing its real length. Decoration, so it
          is exempt from text floors.
        */}
        <svg
          viewBox="0 0 144 12"
          fill="none"
          className="text-terra-soft mt-3 h-3 w-36"
        >
          <path
            className="intro-stroke"
            d="M3 8.75C30 3.5 60 11.75 92 7.5S128 4.25 141 7"
            pathLength={1}
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
          />
        </svg>
      </div>
      {/* The island's name grounds the frame — the cover's own opening
          words, so the veil and the page tell one story. */}
      <span className="intro-place label text-cream/60 absolute inset-x-0 bottom-10 text-center">
        Andaman Islands
      </span>
    </div>
  );
}
