"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hero } from "@/content/home";

/** Mobile bar that appears once the hero CTA scrolls away and hides again while the form is on screen. */
export function StickyCta() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero-cta");
    const form = document.getElementById("book");
    if (!hero || !form || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) setHeroVisible(entry.isIntersecting);
        if (entry.target === form) setFormVisible(entry.isIntersecting);
      }
    });
    observer.observe(hero);
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const show = !heroVisible && !formVisible;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-night-700 bg-night-950/90 pb-safe px-4 pt-3 backdrop-blur-md transition duration-300 md:hidden ${
        show
          ? "translate-y-0 opacity-100 ease-[var(--ease-out)]"
          : "pointer-events-none translate-y-full opacity-0 ease-[var(--ease-in)]"
      }`}
      aria-hidden={!show}
    >
      <Link
        href="#book"
        tabIndex={show ? 0 : -1}
        className="flex min-h-12 items-center justify-center rounded-control bg-teal-400 text-body font-semibold text-night-950 active:scale-97"
      >
        {hero.cta}
      </Link>
    </div>
  );
}
