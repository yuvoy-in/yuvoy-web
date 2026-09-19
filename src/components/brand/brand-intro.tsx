"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type Ref } from "react";
import { preload } from "react-dom";
import {
  LETTER_HEIGHT,
  LETTER_TOP,
  YUVOY_LETTERS,
} from "@/components/brand/yuvoy-letter-paths";

/**
 * The brand veil — a full-page entrance that plays once per tab session
 * before the site is seen: on a night-water scene, the mark surfaces from
 * depth, YUVOY rises through a baseline mask, "Experience more." lands as
 * the display statement with a handwritten stroke as its underline, and the
 * surface rolls up to unveil a page that has already settled underneath it.
 * The whole choreography is CSS in globals.css; this file only decides
 * whether it exists and tidies up after it.
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
 * and any attempt to move the page — a keypress, a wheel, a touch drag —
 * dismisses it early. The storage flag is stamped when it starts, not when it
 * ends, so a mid-play refresh does not replay it.
 */

const STORAGE_KEY = "yuvoy.intro-played";

/**
 * Mirrors the CSS timeline (`--intro-exit-at` + `--intro-exit`); the design
 * system's rule is that the two are changed together. Used only for the
 * belt-and-braces removal timeout, so it needs margin, not precision.
 */
const INTRO_TOTAL_MS = 3400;

/** The `data-skip` fade is 200ms in CSS; settle just after it. */
const SKIP_FADE_MS = 240;

/**
 * Runs during HTML parsing, before first paint, from the <script> rendered
 * beneath the veil — which is why it may use getElementById. Kept inline,
 * dependency-free and defensive: if storage is unavailable the veil simply
 * never shows, which is the safe failure. Exported for the unit test, which
 * asserts the contract because jsdom never executes injected scripts.
 */
export const INTRO_DECIDE = `(()=>{try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(sessionStorage.getItem("${STORAGE_KEY}"))return;sessionStorage.setItem("${STORAGE_KEY}","1");var v=document.getElementById("yuvoy-intro");if(v){v.setAttribute("data-play","");v.setAttribute("data-intro-wait","")}}catch(e){}})()`;

export function BrandIntro() {
  const veilRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  // The horizon is a CSS background, which the browser only discovers once
  // styles apply — on a cold cache it could pop in mid-fade. Preloading
  // from render puts it on the wire with the document itself. (The mark is
  // already preloaded by next/image `priority`; the fonts by next/font.)
  preload("/assets/intro-horizon.webp", { as: "image" });

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

    // The veil owns the whole viewport while it plays, so scrolling could
    // only move the page invisibly underneath it — a moving scrollbar over
    // a still frame reads as breakage (owner report). Locked here rather
    // than in the pre-paint script so a hydration failure can never strand
    // a scroll-locked page: no JavaScript, no lock.
    const html = document.documentElement;
    html.style.overflow = "hidden";
    const unlock = () => {
      html.style.overflow = "";
    };

    /*
      Safari tints its tab and toolbar from the page, and it decides that
      tint at load — when the veil is covering every pixel with forest. It
      does not re-decide when the veil leaves, so the chrome stayed green
      over a paper page (owner report, 2026-08-06). The declared
      `theme-color` (paper, in the root layout's viewport) is what it
      should be reading; re-inserting that meta element is a mutation
      Safari does act on, so the chrome re-reads it at the moment the page
      appears. Harmless everywhere else: browsers that never sampled
      pixels simply read the same value again.
    */
    const retintChrome = () => {
      const meta = document.querySelector('meta[name="theme-color"]');
      const head = meta?.parentNode;
      if (!meta || !head) return;
      head.removeChild(meta);
      requestAnimationFrame(() => head.appendChild(meta));
    };

    let timer = 0;
    const settle = () => {
      unlock();
      retintChrome();
      setGone(true);
    };

    // The veil's own exit is the one that matters; the letters and the
    // sign-off stroke bubble their own `animationend` events past here.
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === veil && event.animationName === "yuvoy-intro-exit") {
        settle();
      }
    };

    // On the exit's FIRST frame, not its last: the scroll lock releases
    // (restoring the scrollbar reflows the page while the veil still
    // covers every pixel), and `data-intro-wait` comes off — which lets
    // the cover's suspended `emerge` entrance re-apply from zero, so the
    // hero surfaces through the dissolving veil.
    const onAnimationStart = (event: AnimationEvent) => {
      if (event.target === veil && event.animationName === "yuvoy-intro-exit") {
        unlock();
        retintChrome();
        veil.removeAttribute("data-intro-wait");
      }
    };

    /*
      Any attempt to move the page dismisses the veil: a keypress, a wheel
      or trackpad gesture, a touch drag. The scroll lock above is what
      makes this necessary — without it a visitor who reaches for the
      scrollbar in the first few seconds gets a page that answers nothing,
      which is indistinguishable from a hung page (found by the e2e suite,
      2026-08-06: two header-scroll specs scrolled nothing while the veil
      held the lock). The veil is theatre, and theatre yields the moment
      someone asks to get on with it.
    */
    const skip = () => {
      veil.setAttribute("data-skip", "");
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SKIP_FADE_MS);
    };

    veil.addEventListener("animationstart", onAnimationStart);
    veil.addEventListener("animationend", onAnimationEnd);
    window.addEventListener("keydown", skip);
    // Passive: these listeners never call preventDefault — the lock, not
    // the handler, is what stops the page moving.
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    // If `animationend` never arrives (an extension pausing animations, an
    // interrupted paint), the veil still leaves the tree shortly after its
    // scheduled end.
    timer = window.setTimeout(settle, INTRO_TOTAL_MS + 600);

    return () => {
      veil.removeEventListener("animationstart", onAnimationStart);
      veil.removeEventListener("animationend", onAnimationEnd);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.clearTimeout(timer);
      unlock();
    };
  }, []);

  if (gone) return null;

  return (
    <>
      <IntroVeil ref={veilRef} />
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
export function IntroVeil({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      id="yuvoy-intro"
      aria-hidden
      suppressHydrationWarning
      className="intro-veil"
    >
      {/* The scene, bottom to top: the owner's island horizon (silhouettes
          and moonlit glint, faded upward into the field), particle swells
          rolling in from each edge and dying away before the centre so the
          lockup keeps a pool of still dark, then grain. Each wing holds
          four independently orbiting planes — neighbouring dots belong to
          different planes, so no line of dots ever moves as a group. */}
      <div className="intro-horizon" />
      <div className="intro-wave">
        <span className="intro-swell intro-swell-1" />
        <span className="intro-swell intro-swell-2" />
        <span className="intro-swell intro-swell-3" />
        <span className="intro-swell intro-swell-4" />
      </div>
      <div className="intro-wave intro-wave-right">
        <span className="intro-swell intro-swell-1" />
        <span className="intro-swell intro-swell-2" />
        <span className="intro-swell intro-swell-3" />
        <span className="intro-swell intro-swell-4" />
      </div>
      <div className="grain" />
      <div className="intro-stage flex flex-col items-center">
        {/*
          The delivered vector ensō, paper-on-dark variant generated by
          scripts/generate-vector-brand.mjs. `unoptimized`: SVG needs no
          optimiser pass, and this keeps `dangerouslyAllowSVG` out of the
          image config.
        */}
        <Image
          unoptimized
          src="/brand/yuvoy-mark-vector-paper.svg"
          alt=""
          width={584}
          height={561}
          priority
          className="intro-mark h-24 w-auto sm:h-28"
        />
        {/*
          YUVOY in the master logo's own drawn letterforms (generated
          per-letter module), coloured by token via fill-current, arriving
          as ONE block in the cover headline's exact emerge — the animation
          sits on the word wrapper, like the hero's sits on its h1. All
          five cells share the module's vertical window, so they sit on one
          baseline.
        */}
        <span className="intro-word text-paper mt-9 flex h-8 items-end gap-5 sm:h-10 sm:gap-6">
          {YUVOY_LETTERS.map((letter, index) => (
            <svg
              key={index}
              viewBox={`${letter.x} ${LETTER_TOP} ${letter.width} ${LETTER_HEIGHT}`}
              width={letter.width}
              height={LETTER_HEIGHT}
              fill="none"
              className="h-full w-auto"
            >
              <path d={letter.d} className="fill-current" />
            </svg>
          ))}
        </span>
        {/*
          The statement — the brand kicker promoted to the display voice, in
          the italic terracotta turn (§2), the site's most recognisable
          typographic move: the engineered wordmark speaks, the editorial
          voice answers. `leading-tight` + `pb-1` reserve room for the
          descenders an italic line clips at display size.
        */}
        {/* Cursive handwriting (the veil-only script face), written on by
            the mask sweep in globals.css. `terra-soft` per the palette:
            the measured accent for text on forest (§1). */}
        <span className="intro-kicker font-script text-terra-soft mt-5 text-5xl leading-tight font-medium sm:text-6xl">
          Experience more.
        </span>
        {/*
          The sign-off swash, tucked close under the words: a calligraphic
          sliver — tapered tips, weight in the middle — arching upward
          (owner direction: the bow flipped and deepened) while climbing
          from bottom-left to top-right, revealed left to right after the
          word is written. Decoration, so it is exempt from text floors.
        */}
        <svg
          viewBox="0 0 288 18"
          fill="none"
          className="text-terra-soft mt-1 h-4 w-56 sm:w-72"
        >
          <path
            className="intro-stroke fill-current"
            d="M2 16Q150 -2 286 3Q150 3 2 16Z"
          />
        </svg>
      </div>
      {/* The island's name grounds the frame — the cover's own opening
          words, so the veil and the page tell one story. */}
      <span className="intro-place label text-paper/70 absolute inset-x-0 bottom-[max(2.5rem,calc(env(safe-area-inset-bottom)+1.25rem))] text-center">
        Andaman Islands
      </span>
    </div>
  );
}
