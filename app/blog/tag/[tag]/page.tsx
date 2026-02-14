import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getAllTags, getPostsByTag } from "@/lib/utils/blog";
import { SITE_URL } from "@/lib/constants/site";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;

  return {
    title: `Posts tagged #${tag} | Citrus Surf`,
    description: `All blog posts tagged with #${tag}.`,
    alternates: { canonical: `${SITE_URL}/blog/tag/${tag}` },
    openGraph: {
      title: `Posts tagged #${tag} | Citrus Surf`,
      description: `All blog posts tagged with #${tag}.`,
      url: `${SITE_URL}/blog/tag/${tag}`,
      type: "website",
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Posts tagged #{tag}</h1>
      <div className="space-y-4">
        {posts.map((post) => (
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
                  {post.tags.map((t) => (
                    <span key={t} className="blog-tag">
                      #{t}
                    </span>
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
  );
}
