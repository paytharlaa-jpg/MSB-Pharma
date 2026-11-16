"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Maximize2, Sparkles } from "lucide-react";

export interface GalleryItem {
  title: string;
  category: string;
  image: string;
  caption: string;
  tall?: boolean;
  isNew?: boolean;
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  const visible = filter === "All" ? items : items.filter((i) => i.category === filter);

  const step = useCallback(
    (dir: 1 | -1) => setOpen((cur) => (cur === null ? cur : (cur + dir + visible.length) % visible.length)),
    [visible.length]
  );

  useEffect(() => {
    if (open === null) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open, step]);

  const current = open !== null ? visible[open] : null;

  return (
    <>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter gallery">
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={filter === c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              filter === c
                ? "bg-[#0f2d6b] text-white shadow-[0_12px_24px_-12px_rgba(15,45,107,0.8)]"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#1b4db3]/40 hover:text-[#0f2d6b]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[280px] sm:auto-rows-[260px] grid-flow-dense gap-5">
          {visible.map((item, idx) => (
            <motion.figure
              key={`${filter}-${item.image}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: (idx % 3) * 0.08 }}
              className={item.tall ? "sm:row-span-2" : ""}
            >
              <button
                onClick={() => setOpen(idx)}
                className="group relative block w-full h-full overflow-hidden rounded-[26px] bg-slate-100 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1b4db3]/30"
                aria-label={`Open ${item.title}`}
              >
                <div className="absolute inset-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.06]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#071636]/90 via-[#071636]/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[11px] font-semibold text-[#0f2d6b]">{item.category}</span>
                  {item.isNew && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#3a991d] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      <Sparkles className="w-3 h-3" /> New
                    </span>
                  )}
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-heading text-lg font-bold leading-snug !text-white">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/75 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                    {item.caption}
                  </p>
                </figcaption>
                <span className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </button>
            </motion.figure>
          ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[90] bg-[#050f26]/95 backdrop-blur-md flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
            onClick={() => setOpen(null)}
          >
            <div className="flex items-center justify-between px-5 sm:px-8 py-5 text-white/80 text-sm">
              <span className="tabular-nums">
                {(open ?? 0) + 1} / {visible.length}
              </span>
              <button onClick={() => setOpen(null)} className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative flex-1 flex items-center justify-center px-4 sm:px-20" onClick={(e) => e.stopPropagation()}>
              <motion.div
                key={current.image}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                className="relative w-full max-w-5xl aspect-[4/3] max-h-[68vh]"
              >
                <Image src={current.image} alt={current.title} fill sizes="90vw" className="object-contain" />
              </motion.div>
              <button onClick={() => step(-1)} className="absolute left-2 sm:left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center" aria-label="Previous image">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={() => step(1)} className="absolute right-2 sm:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center" aria-label="Next image">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="px-5 sm:px-8 pb-8 pt-4 text-center max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9be07e]">{current.category}</p>
              <h3 className="mt-2 font-heading text-xl sm:text-2xl font-bold !text-white">{current.title}</h3>
              <p className="mt-2 text-sm text-white/70">{current.caption}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
