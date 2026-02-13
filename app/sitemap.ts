import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1.0 },
    { url: `${SITE_URL}/playground`, priority: 0.7 },
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
