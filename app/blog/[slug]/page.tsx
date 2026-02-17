import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MarkdownRenderer from "@/components/markdown-renderer";
import {
  getPostSlugs,
  getPostBySlug,
  getAdjacentPosts,
} from "@/lib/utils/blog";
import { SITE_URL, blogPostJsonLd } from "@/lib/constants/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPostSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Citrus Surf`,
    description: post.description,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            blogPostJsonLd({
              title: post.title,
              description: post.description,
              date: post.date,
              author: post.author,
              slug,
              tags: post.tags,
            })
          ),
        }}
      />
    <article>
      <Link
        href="/blog"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        All Posts
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>{post.date}</span>
          {post.author && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{post.author}</span>
            </>
          )}
          {post.tags.map(tag => (
            <Link key={tag} href={`/blog/tag/${tag}`} className="blog-tag">
              #{tag}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <p className="text-lg text-muted-foreground">{post.description}</p>
      </header>

      <MarkdownRenderer content={post.content} />

      <nav className="mt-12 pt-8 border-t flex justify-between items-center gap-4">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
          >
            {next.title}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
    </>
  );
}
