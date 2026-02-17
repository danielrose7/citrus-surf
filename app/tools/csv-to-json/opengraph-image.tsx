import {
  createToolOGImage,
  ogSize,
  ogContentType,
} from "@/lib/utils/tool-og-image";

export const alt = "CSV to JSON Converter — Citrus Surf";
export const size = ogSize;
export const contentType = ogContentType;

export default function OGImage() {
  return createToolOGImage(
    "CSV to JSON Converter",
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
      <path d="M12 3v18" />
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
    </svg>,
  );
}
