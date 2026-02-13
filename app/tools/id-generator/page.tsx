import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { ToolExplanation } from "@/components/tool-explanation";
import { SITE_URL, toolJsonLd } from "@/lib/constants/site";
import { IdGeneratorTool } from "./id-generator-tool";

const title = "UUID & ULID Generator Online";
const description =
  "Generate UUID v4, UUID v7, and ULID identifiers in bulk. Free online tool — create up to 1,000 unique IDs instantly. No signup required.";
const url = `${SITE_URL}/tools/id-generator`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "UUID generator",
    "ULID generator",
    "UUID v4",
    "UUID v7",
    "bulk ID generator",
    "unique identifier",
  ],
  alternates: { canonical: url },
  openGraph: { title, description, url },
};

export default function IdGeneratorPage() {
  return (
    <>
      <NavBar />
      <IdGeneratorTool />
      <ToolExplanation
        title="About ID Formats"
        description="Understanding UUID v4, UUID v7, and ULID — when to use each"
      >
        <h3>What Are These ID Formats?</h3>
        <ul>
          <li>
            <strong>UUID v4</strong> — A 128-bit identifier generated from random
            bytes. The most widely used UUID version. Format:{" "}
            <code>xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</code> (the{" "}
            <code>4</code> at position 15 indicates version 4).
          </li>
          <li>
            <strong>UUID v7</strong> — A 128-bit identifier that embeds a
            Unix timestamp in the first 48 bits, followed by random bytes.
            Format: <code>xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx</code> (the{" "}
            <code>7</code> at position 15 indicates version 7). IDs are
            naturally sortable by creation time.
          </li>
          <li>
            <strong>ULID</strong> — A 128-bit identifier encoded as 26
            Crockford Base32 characters. The first 10 characters encode a
            millisecond timestamp, the last 16 are random. Sortable and
            case-insensitive.
          </li>
        </ul>

        <h3>UUID v4 vs v7 — How to Tell Them Apart</h3>
        <p>
          Look at the first character of the third group (position 15 in the
          string, including hyphens). For v4, it&apos;s always <code>4</code>.
          For v7, it&apos;s always <code>7</code>.
        </p>
        <ul>
          <li>
            <code>
              550e8400-e29b-<strong>4</strong>1d4-a716-446655440000
            </code>{" "}
            — UUID v4
          </li>
          <li>
            <code>
              019c584d-b523-<strong>7</strong>54b-b5d2-d503d80c1ad5
            </code>{" "}
            — UUID v7
          </li>
        </ul>
        <p>
          The key difference: v7 UUIDs generated later will sort after earlier
          ones because the timestamp comes first. v4 UUIDs have no ordering
          guarantee.
        </p>

        <h3>When to Use Which</h3>
        <ul>
          <li>
            <strong>UUID v4</strong> — Use when you need a random identifier
            with no ordering requirement. Great for general-purpose IDs, session
            tokens, or any case where sortability doesn&apos;t matter. Maximum
            compatibility with existing systems.
          </li>
          <li>
            <strong>UUID v7</strong> — Use when you need time-ordered records
            in a standard UUID format. Ideal for database primary keys (better
            index locality than v4), event logs, or any system that benefits
            from chronological ordering while staying UUID-compatible.
          </li>
          <li>
            <strong>ULID</strong> — Use when you want a compact, sortable,
            human-friendly ID. The Crockford Base32 encoding is shorter than
            UUID strings (26 vs 36 characters), avoids ambiguous characters,
            and is case-insensitive. Good for URLs, user-facing IDs, and
            systems where string length matters.
          </li>
        </ul>

        <h3>Comparison Table</h3>
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>UUID v4</th>
              <th>UUID v7</th>
              <th>ULID</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Length</td>
              <td>36 chars</td>
              <td>36 chars</td>
              <td>26 chars</td>
            </tr>
            <tr>
              <td>Sortable</td>
              <td>No</td>
              <td>Yes (time-ordered)</td>
              <td>Yes (time-ordered)</td>
            </tr>
            <tr>
              <td>Encoding</td>
              <td>Hex + hyphens</td>
              <td>Hex + hyphens</td>
              <td>Crockford Base32</td>
            </tr>
            <tr>
              <td>Timestamp</td>
              <td>None</td>
              <td>Unix ms (48 bits)</td>
              <td>Unix ms (48 bits)</td>
            </tr>
            <tr>
              <td>Compatibility</td>
              <td>Universal</td>
              <td>UUID-compatible</td>
              <td>Needs ULID support</td>
            </tr>
          </tbody>
        </table>
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
