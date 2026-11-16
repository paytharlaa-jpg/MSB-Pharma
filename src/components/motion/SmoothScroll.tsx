"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide motion layer for the public website:
 *  - Lenis inertia scrolling (desktop / mouse wheel; native touch scrolling is kept on phones)
 *  - keeps GSAP ScrollTrigger in sync so existing pinned / scrubbed sections keep working
 *  - [data-parallax] images drift + settle as they cross the viewport
 *  - [data-reveal] elements fade / rise in once when they enter
 * Everything is skipped when the visitor prefers reduced motion.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.documentElement.classList.add("motion-reduced");
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      anchors: { offset: -96 },
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Expose for components that need to pause scrolling (e.g. mobile menu)
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // (Re)bind declarative scroll effects on every route change
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Parallax: uses the individual CSS `translate` / `scale` properties so it never fights
      // with Tailwind hover transforms already on the same image.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax || 12);
        gsap.fromTo(
          el,
          // scale always covers the travel so image edges never show
          { "--py": `${-amount}%`, "--ps": 1 + (2 * amount) / 100 + 0.04 },
          {
            "--py": `${amount}%`,
            "--ps": 1 + (2 * amount) / 100,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const kind = el.dataset.reveal || "up";
        const from: gsap.TweenVars =
          kind === "left" ? { x: -48 } : kind === "right" ? { x: 48 } : kind === "scale" ? { scale: 0.94 } : { y: 40 };
        gsap.from(el, {
          ...from,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          delay: Number(el.dataset.revealDelay || 0),
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // Staggered children: <div data-stagger> ... children animate one after another
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.from(el.children, {
          y: 36,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      // Animated counters: <span data-count="400" data-suffix="+">0</span>
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count || 0);
        const suffix = el.dataset.suffix || "";
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => (el.textContent = `${Math.round(obj.v)}${suffix}`),
        });
      });
    });

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      clearTimeout(refresh);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
