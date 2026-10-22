import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Industry Blog & Sourcing Insights | MSB PHARMACHEM",
  description:
    "Explore pharmaceutical supply chain articles, API procurement guides, and impurity standard technical discussions from MSB PHARMACHEM.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedDate: "desc" },
  });

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#00488F] uppercase tracking-wider">
            Technical Editorial
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Industry Insights & Sourcing Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Technical perspectives on API self-reliance, regulatory standards, impurity profiling, and global pharmaceutical supply chain resilience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {post.coverImage && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(post.publishedDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{post.author}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-[#00488F] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-0 text-xs font-semibold text-[#00488F] flex items-center">
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
