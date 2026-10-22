import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, User, ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Article Not Found | MSB PHARMACHEM" };

  return {
    title: `${post.title} | MSB PHARMACHEM`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post = null;

  try {
    post = await prisma.blogPost.findUnique({
      where: { slug },
    });
  } catch (err) {
    console.error("BlogPostPage query error:", err);
  }

  if (!post) {
    notFound();
  }

  return (
    <article className="py-16 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00488F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Industry Insights</span>
        </Link>

        {/* Title & Metadata */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                {new Date(post.publishedDate).toLocaleDateString("en-IN", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <span>{post.author}</span>
            </span>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-4 whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Call to Action Box */}
        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base text-slate-900">Need Reliable API or Intermediate Sourcing?</h3>
            <p className="text-xs text-slate-500">
              Our commercial procurement desk in Hyderabad provides fast quotes, COA, and export documentation.
            </p>
          </div>
          <Link href="/contact" className="shrink-0">
            <Button variant="brand-green" size="md">
              <span>Request Quotation</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
