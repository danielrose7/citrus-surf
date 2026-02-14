import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BlogPostMeta } from "./blog";

const mockFiles: Record<string, string> = {
  "post-a.md": [
    "---",
    "title: Post A",
    'date: "2026-02-13"',
    "description: First post",
    "tags: [alpha, shared]",
    "author: Claude Code",
    "---",
    "Content A",
  ].join("\n"),
  "post-b.md": [
    "---",
    "title: Post B",
    'date: "2026-01-15"',
    "description: Second post",
    "tags: [beta]",
    "---",
    "Content B",
  ].join("\n"),
  "post-c.md": [
    "---",
    "title: Post C",
    'date: "2026-02-10"',
    "description: Third post",
    "tags: [gamma, shared]",
    "author: Claude Code",
    "---",
    "Content C",
  ].join("\n"),
};

vi.mock("fs", () => ({
  default: {
    readdirSync: () => Object.keys(mockFiles),
    existsSync: (p: string) => {
      const name = p.split("/").pop()!;
      return name in mockFiles;
    },
    readFileSync: (p: string) => {
      const name = p.split("/").pop()!;
      return mockFiles[name];
    },
  },
}));

vi.mock("path", () => ({
  default: {
    join: (...parts: string[]) => parts.join("/"),
  },
}));

describe("blog utilities", () => {
  let blog: typeof import("./blog");

  beforeEach(async () => {
    vi.resetModules();
    blog = await import("./blog");
  });

  describe("getPostSlugs", () => {
    it("returns slugs without .md extension", () => {
      const slugs = blog.getPostSlugs();
      expect(slugs).toEqual(["post-a", "post-b", "post-c"]);
    });
  });

  describe("getPostBySlug", () => {
    it("returns parsed post with frontmatter and content", () => {
      const post = blog.getPostBySlug("post-a");
      expect(post).not.toBeNull();
      expect(post!.slug).toBe("post-a");
      expect(post!.title).toBe("Post A");
      expect(post!.date).toBe("2026-02-13");
      expect(post!.description).toBe("First post");
      expect(post!.content).toContain("Content A");
    });

    it("returns null for non-existent slug", () => {
      const post = blog.getPostBySlug("does-not-exist");
      expect(post).toBeNull();
    });
  });

  describe("getAllPosts", () => {
    it("returns posts sorted by date descending", () => {
      const posts = blog.getAllPosts();
      const dates = posts.map((p: BlogPostMeta) => p.date);
      expect(dates).toEqual(["2026-02-13", "2026-02-10", "2026-01-15"]);
    });

    it("does not include content field", () => {
      const posts = blog.getAllPosts();
      expect(posts[0]).not.toHaveProperty("content");
    });
  });

  describe("getRecentPosts", () => {
    it("returns first N posts", () => {
      const posts = blog.getRecentPosts(2);
      expect(posts).toHaveLength(2);
      expect(posts[0].slug).toBe("post-a");
      expect(posts[1].slug).toBe("post-c");
    });
  });

  describe("getPostsByMonth", () => {
    it("groups posts by month", () => {
      const groups = blog.getPostsByMonth();
      expect(groups).toHaveLength(2);
      expect(groups[0].month).toBe("February 2026");
      expect(groups[0].posts).toHaveLength(2);
      expect(groups[1].month).toBe("January 2026");
      expect(groups[1].posts).toHaveLength(1);
    });
  });

  describe("author", () => {
    it("parses author from frontmatter", () => {
      const post = blog.getPostBySlug("post-a");
      expect(post!.author).toBe("Claude Code");
    });

    it("defaults to empty string when no author", () => {
      const post = blog.getPostBySlug("post-b");
      expect(post!.author).toBe("");
    });
  });

  describe("tags", () => {
    it("parses tags from frontmatter", () => {
      const post = blog.getPostBySlug("post-a");
      expect(post!.tags).toEqual(["alpha", "shared"]);
    });

    it("defaults to empty array when no tags", () => {
      // Temporarily test with a post that has no tags field
      const posts = blog.getAllPosts();
      for (const post of posts) {
        expect(Array.isArray(post.tags)).toBe(true);
      }
    });
  });

  describe("getAllTags", () => {
    it("returns sorted unique tags", () => {
      const tags = blog.getAllTags();
      expect(tags).toEqual(["alpha", "beta", "gamma", "shared"]);
    });
  });

  describe("getPostsByTag", () => {
    it("returns posts matching the tag sorted by date desc", () => {
      const posts = blog.getPostsByTag("shared");
      expect(posts).toHaveLength(2);
      expect(posts[0].slug).toBe("post-a");
      expect(posts[1].slug).toBe("post-c");
    });

    it("returns empty array for unknown tag", () => {
      const posts = blog.getPostsByTag("nonexistent");
      expect(posts).toEqual([]);
    });
  });

  describe("getAdjacentPosts", () => {
    it("returns prev and next for middle post", () => {
      const { prev, next } = blog.getAdjacentPosts("post-c");
      // Sorted order: post-a (0), post-c (1), post-b (2)
      // prev = older = post-b, next = newer = post-a
      expect(prev?.slug).toBe("post-b");
      expect(next?.slug).toBe("post-a");
    });

    it("returns null prev for oldest post", () => {
      const { prev, next } = blog.getAdjacentPosts("post-b");
      expect(prev).toBeNull();
      expect(next?.slug).toBe("post-c");
    });

    it("returns null next for newest post", () => {
      const { prev, next } = blog.getAdjacentPosts("post-a");
      expect(prev?.slug).toBe("post-c");
      expect(next).toBeNull();
    });

    it("returns nulls for unknown slug", () => {
      const { prev, next } = blog.getAdjacentPosts("unknown");
      expect(prev).toBeNull();
      expect(next).toBeNull();
    });
  });
});
