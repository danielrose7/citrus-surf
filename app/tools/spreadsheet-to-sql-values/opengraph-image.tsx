import {
  createToolOGImage,
  ogSize,
  ogContentType,
} from "@/lib/utils/tool-og-image";

export const alt = "Spreadsheet to SQL Converter — Citrus Surf";
export const size = ogSize;
export const contentType = ogContentType;

export default function OGImage() {
  return createToolOGImage(
    "Spreadsheet to SQL Converter",
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
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>,
  );
}
