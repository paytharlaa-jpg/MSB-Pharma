import React from "react";
import Image from "next/image";

/** Premium inner-page header: deep navy with a slow-parallax photo, eyebrow, title and lead. */
export function PageHero({
  eyebrow,
  title,
  accent,
  lead,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: string;
  image: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0a1d45] text-white">
      <div className="absolute inset-0" aria-hidden="true">
        <Image src={image} alt="" fill priority className="object-cover opacity-35" data-parallax="8" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1d45] via-[#0a1d45]/85 to-[#0a1d45]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1d45] via-transparent to-transparent" />
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-[#3a991d]/20 blur-[140px]" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 sm:pt-28 sm:pb-24">
        <p className="eyebrow eyebrow-light" data-reveal>
          {eyebrow}
        </p>
        <h1
          className="mt-5 max-w-4xl font-heading font-bold text-4xl sm:text-6xl lg:text-[68px] leading-[1.04] !text-white"
          data-reveal
          data-reveal-delay="0.08"
        >
          {title}
          {accent && (
            <>
              {" "}
              <span className="bg-gradient-to-r from-[#8fb4ff] to-[#9be07e] bg-clip-text text-transparent">{accent}</span>
            </>
          )}
        </h1>
        {lead && (
          <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-white/75" data-reveal data-reveal-delay="0.16">
            {lead}
          </p>
        )}
        {children && (
          <div className="mt-10" data-reveal data-reveal-delay="0.24">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

/** Section heading block used across inner pages. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  center,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center max-w-3xl mx-auto" : "max-w-3xl"} data-reveal>
      <p className={center ? "eyebrow justify-center" : "eyebrow"}>{eyebrow}</p>
      <h2 className="mt-4 font-heading font-bold text-3xl sm:text-5xl leading-[1.08] text-[#0f2d6b]">{title}</h2>
      {lead && <p className="mt-5 text-lg leading-relaxed text-slate-600">{lead}</p>}
    </div>
  );
}
