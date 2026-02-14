import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";
import { getAllPosts, getAllTags } from "@/lib/utils/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    priority: 0.6,
  }));

  const tagPages = getAllTags().map((tag) => ({
    url: `${SITE_URL}/blog/tag/${tag}`,
    priority: 0.4,
  }));

  return [
    { url: SITE_URL, priority: 1.0 },
    { url: `${SITE_URL}/blog`, priority: 0.7 },
    ...blogPosts,
    ...tagPages,
    { url: `${SITE_URL}/playground`, priority: 0.7 },
    { url: `${SITE_URL}/site-map`, priority: 0.3 },
    { url: `${SITE_URL}/tools/id-generator`, priority: 0.8 },
    { url: `${SITE_URL}/tools/csv-to-json`, priority: 0.8 },
    { url: `${SITE_URL}/tools/json-to-csv`, priority: 0.8 },
    { url: `${SITE_URL}/tools/json-to-sql`, priority: 0.8 },
    { url: `${SITE_URL}/tools/slugify`, priority: 0.8 },
    {
      url: `${SITE_URL}/tools/spreadsheet-to-sql-values`,
      priority: 0.8,
    },
  ];
}
