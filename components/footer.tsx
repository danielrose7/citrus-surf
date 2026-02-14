import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left Column - Brand */}
          <div className="text-center md:text-left">
            <p className="text-lg font-medium text-foreground">
              🏄‍♂️ Life's short, go surfing 🌊
            </p>
          </div>

          {/* Center Column - Location */}
          <div className="text-center">
            <a
              href="https://gobloom.io"
              target="_blank"
              rel="noopener noreferrer"
              className="mountain-link text-sm text-muted-foreground"
            >
              <span className="mountain-label">Made in Silverton, CO</span>
            </a>
          </div>

          {/* Right Column - Navigation */}
          <div className="text-center md:text-right">
            <div className="flex flex-col md:flex-row items-center md:justify-end gap-4 md:gap-6 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/playground"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Playground
              </Link>
              <Link
                href="/tools"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Tools
              </Link>
              <Link
                href="/site-map"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
