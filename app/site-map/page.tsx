import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { SITE_URL } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Browse all pages and tools available on Citrus Surf.",
  alternates: { canonical: `${SITE_URL}/site-map` },
};

const sections = [
  {
    heading: "Main",
    links: [
      { href: "/", label: "Home" },
      { href: "/playground", label: "Interactive Data Playground" },
    ],
  },
  {
    heading: "Blog",
    links: [{ href: "/blog", label: "All Posts" }],
  },
  {
    heading: "Tools",
    links: [
      { href: "/tools/id-generator", label: "UUID & ULID Generator" },
      { href: "/tools/csv-to-json", label: "CSV to JSON Converter" },
      { href: "/tools/json-to-csv", label: "JSON to CSV Converter" },
      { href: "/tools/json-to-sql", label: "JSON to SQL Converter" },
      { href: "/tools/slugify", label: "Text Slugifier" },
      {
        href: "/tools/spreadsheet-to-sql-values",
        label: "Spreadsheet to SQL Converter",
      },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Sitemap</h1>
          <Link
            href="/sitemap.xml"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View as XML
          </Link>
        </div>
        {sections.map((section) => (
          <div key={section.heading} className="mb-8">
            <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
