import React from "react";
import { Navbar } from "@/components/public-site/Navbar";
import { Footer } from "@/components/public-site/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full bg-white">
      <Navbar />
      <main className="w-full">{children}</main>
      <Footer />
    </div>
  );
}
