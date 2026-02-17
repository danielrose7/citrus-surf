export const SITE_URL = "https://www.citrus.surf";
export const SITE_NAME = "Citrus Surf";

export function blogPostJsonLd(post: {
  title: string;
  description: string;
  date: string;
  author?: string;
  slug: string;
  tags: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author || "Daniel Rose",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };
}

export function blogListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    description:
      "Tips, updates, and guides for working with data more efficiently.",
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function toolJsonLd(name: string, url: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url,
    description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
