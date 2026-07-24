"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";

const LINKS = [
  { href: "/experiences", label: "Experiences" },
  { href: "/philosophy", label: "Philosophy" },
  { href: "/journal", label: "Journal" },
  { href: "/waitlist", label: "Waitlist" },
];

const iconButton =
  "text-forest focus-visible:ring-terra rounded-full p-2 focus-visible:ring-2 focus-visible:outline-none";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={iconButton}
      >
        <Menu className="size-6" />
      </button>

      {open && (
        <div
          className="bg-cream fixed inset-0 z-50 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between px-6 py-6">
            <Wordmark />
            <button
              ref={closeRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className={iconButton}
            >
              <X className="size-6" />
            </button>
          </div>
          <nav className="mt-6 flex flex-col px-6">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-forest border-cream-line border-b py-5 text-3xl"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
