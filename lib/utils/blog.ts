import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { format } from "date-fns";

const postsDirectory = path.join(process.cwd(), "app/blog/posts");

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  author: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export function getPostSlugs(): string[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title,
    date: data.date,
    description: data.description,
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: data.author || "",
    content,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post) return null;
      const { content: _, ...meta } = post;
      return meta;
    })
    .filter((post): post is BlogPostMeta => post !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getRecentPosts(count: number): BlogPostMeta[] {
  return getAllPosts().slice(0, count);
}

export function getPostsByMonth(): { month: string; posts: BlogPostMeta[] }[] {
  const posts = getAllPosts();
  const groups = new Map<string, BlogPostMeta[]>();

  for (const post of posts) {
    const month = format(new Date(post.date), "MMMM yyyy");
    const existing = groups.get(month) || [];
    existing.push(post);
    groups.set(month, existing);
  }

  return Array.from(groups.entries()).map(([month, posts]) => ({
    month,
    posts,
  }));
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function getAdjacentPosts(slug: string): {
  prev: BlogPostMeta | null;
  next: BlogPostMeta | null;
} {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  };
}
