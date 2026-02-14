import type React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getRecentPosts, getPostsByMonth, getAllTags } from "@/lib/utils/blog";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const recentPosts = getRecentPosts(5);
  const postsByMonth = getPostsByMonth();
  const allTags = getAllTags();

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="surf-heading text-3xl font-bold no-underline"
        >
          <span className="surf-label">
            Citrus Surf{" "}
            <span className="surf-emoji" role="img" aria-label="Surfer">
              🏄‍
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            All Posts
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <main className="flex-1 min-w-0">{children}</main>

        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Recent Posts
            </h3>
            <ul className="space-y-2">
              {recentPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="blog-tag"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Archive
            </h3>
            <ul className="space-y-3">
              {postsByMonth.map(({ month, posts }) => (
                <li key={month}>
                  <p className="text-sm font-medium text-muted-foreground">
                    {month}
                  </p>
                  <ul className="mt-1 space-y-1">
                    {posts.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-sm text-foreground hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
