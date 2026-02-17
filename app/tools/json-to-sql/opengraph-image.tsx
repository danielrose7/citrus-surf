import {
  createToolOGImage,
  ogSize,
  ogContentType,
} from "@/lib/utils/tool-og-image";

export const alt = "JSON to SQL Converter — Citrus Surf";
export const size = ogSize;
export const contentType = ogContentType;

export default function OGImage() {
  return createToolOGImage(
    "JSON to SQL Converter",
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#171717"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>,
  );
}
