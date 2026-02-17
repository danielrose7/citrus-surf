import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getAllPosts } from "@/lib/utils/blog";
import { SITE_URL, blogListJsonLd } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "Blog | Citrus Surf",
  description:
    "Tips, updates, and guides for working with data more efficiently.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog | Citrus Surf",
    description:
      "Tips, updates, and guides for working with data more efficiently.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogListJsonLd()),
        }}
      />
    <div>
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="space-y-4">
        {posts.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{post.date}</span>
                  {post.author && (
                    <>
                      <span aria-hidden="true">&middot;</span>
                      <span>{post.author}</span>
                    </>
                  )}
                  {post.tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${tag}`}
                      className="blog-tag"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
