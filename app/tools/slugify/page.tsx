import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { ToolExplanation } from "@/components/tool-explanation";
import { SITE_URL, toolJsonLd } from "@/lib/constants/site";
import { SlugifyTool } from "./slugify-tool";

const title = "Text Slugifier — URL Slug Generator Online";
const description =
  "Convert text to URL-friendly slugs instantly. Process multiple strings at once for SEO-friendly URLs. Free bulk slug generator tool.";
const url = `${SITE_URL}/tools/slugify`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "slugify",
    "URL slug generator",
    "text to slug",
    "SEO-friendly URLs",
    "bulk slug generator",
  ],
  alternates: { canonical: url },
  openGraph: { title, description, url },
};

export default function SlugifyPage() {
  return (
    <>
      <NavBar />
      <SlugifyTool />
      <ToolExplanation
        title="About Text Slugifier"
        description="Learn how to create SEO-friendly URLs with slugs"
      >
        <h3>What is a Slug?</h3>
        <p>
          A slug is a URL-friendly version of a string, typically used in web
          addresses. Slugs are created by converting a string to lowercase,
          removing special characters, and replacing spaces with hyphens. They
          make URLs more readable for both humans and search engines.
        </p>

        <h3>Why Use Slugs?</h3>
        <ul>
          <li>
            <strong>SEO Benefits:</strong> Search engines prefer descriptive,
            keyword-rich URLs over cryptic ones with parameters and IDs.
          </li>
          <li>
            <strong>User Experience:</strong> Readable URLs are easier to
            remember, share, and understand.
          </li>
          <li>
            <strong>Consistency:</strong> Slugs provide a standardized way to
            represent content titles in URLs.
          </li>
          <li>
            <strong>Accessibility:</strong> Screen readers can better interpret
            descriptive URLs, improving accessibility.
          </li>
        </ul>

        <h3>Common Use Cases</h3>
        <ul>
          <li>
            <strong>Blog Posts:</strong> Converting article titles to slugs for
            URL paths (e.g., &quot;10-tips-for-better-seo&quot;).
          </li>
          <li>
            <strong>Product Pages:</strong> Creating clean URLs for e-commerce
            products (e.g., &quot;blue-cotton-t-shirt-large&quot;).
          </li>
          <li>
            <strong>Category Pages:</strong> Generating readable URLs for content
            categories (e.g., &quot;web-development/javascript&quot;).
          </li>
          <li>
            <strong>User Profiles:</strong> Creating vanity URLs for user profiles
            (e.g., &quot;john-doe&quot;).
          </li>
        </ul>

        <h3>Best Practices for Creating Slugs</h3>
        <ol>
          <li>
            <strong>Keep them short:</strong> Aim for concise slugs that capture
            the essence of the content without being too long.
          </li>
          <li>
            <strong>Use keywords:</strong> Include relevant keywords to improve
            SEO, but avoid keyword stuffing.
          </li>
          <li>
            <strong>Avoid stop words:</strong> Consider removing common words like
            &quot;a,&quot; &quot;the,&quot; &quot;and,&quot; etc., unless they&apos;re essential for meaning.
          </li>
          <li>
            <strong>Use hyphens, not underscores:</strong> Search engines
            recognize hyphens as word separators, but not underscores.
          </li>
          <li>
            <strong>Ensure uniqueness:</strong> Each slug should be unique within
            its context to avoid conflicts.
          </li>
        </ol>

        <h3>How Our Slugifier Works</h3>
        <p>Our slugifier tool follows these steps to convert text into slugs:</p>
        <ol>
          <li>Convert all characters to lowercase</li>
          <li>Remove all special characters and punctuation</li>
          <li>Replace spaces and underscores with hyphens</li>
          <li>Remove leading and trailing hyphens</li>
          <li>
            Handle multiple consecutive hyphens by reducing them to a single
            hyphen
          </li>
        </ol>

        <h3>Using Slugs in Different Frameworks</h3>
        <h4>Next.js</h4>
        <p>
          In Next.js, you can use slugs for dynamic routes by creating files like{" "}
          <code>[slug].js</code> or <code>[slug]/page.js</code> (in App Router).
          The slug value is then accessible via <code>params.slug</code> in your
          page component.
        </p>

        <h4>Express.js</h4>
        <p>
          In Express.js, you can define routes with slug parameters like{" "}
          <code>app.get(&apos;/posts/:slug&apos;, ...)</code> and access them via{" "}
          <code>req.params.slug</code>.
        </p>

        <h4>Django</h4>
        <p>
          Django has built-in support for slugs with the <code>SlugField</code>{" "}
          model field, which automatically validates that the value contains only
          letters, numbers, underscores, and hyphens.
        </p>
      </ToolExplanation>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolJsonLd(title, url, description)),
        }}
      />
    </>
  );
}
