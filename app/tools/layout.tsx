import type React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="surf-heading text-3xl font-bold no-underline">
          <span className="surf-label">Citrus Surf <span className="surf-emoji" role="img" aria-label="Surfer">🏄‍</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
      {children}
    </div>
  );
}
