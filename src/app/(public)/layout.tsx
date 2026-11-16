import React from "react";
import { Navbar } from "@/components/public-site/Navbar";
import { Footer } from "@/components/public-site/Footer";
import { FloatingActionButtons } from "@/components/public-site/FloatingActionButtons";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-site w-full bg-white relative">
      <SmoothScroll />
      <Navbar />
      <main className="w-full">{children}</main>
      <Footer />
      {/* Persistent WhatsApp and Phone Call buttons on bottom right */}
      <FloatingActionButtons />
    </div>
  );
}
