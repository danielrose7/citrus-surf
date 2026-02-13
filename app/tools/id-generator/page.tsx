"use client";

import { useState } from "react";
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";
import { ulid } from "ulid";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { NavBar } from "@/components/nav-bar";
import { ToolExplanation } from "@/components/tool-explanation";

type IdType = "uuid-v4" | "uuid-v7" | "ulid";

function generateIds(type: IdType, count: number): string[] {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    switch (type) {
      case "uuid-v4":
        ids.push(uuidv4());
        break;
      case "uuid-v7":
        ids.push(uuidv7());
        break;
      case "ulid":
        ids.push(ulid());
        break;
    }
  }
  return ids;
}

function getTypeLabel(type: IdType): string {
  switch (type) {
    case "uuid-v4":
      return "UUIDs (v4)";
    case "uuid-v7":
      return "UUIDs (v7)";
    case "ulid":
      return "ULIDs";
  }
}

export default function IdGeneratorPage() {
  return (
    <>
      <NavBar />
      <IdGeneratorTool />
      <IdGeneratorExplanation />
    </>
  );
}

function IdGeneratorTool() {
  const [idType, setIdType] = useState<IdType>("uuid-v4");
  const [count, setCount] = useState(10);
  const [output, setOutput] = useState("");
  const [generatedCount, setGeneratedCount] = useState(0);
  const [generatedType, setGeneratedType] = useState<IdType>("uuid-v4");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const clampedCount = Math.max(1, Math.min(1000, count));
    const ids = generateIds(idType, clampedCount);
    setOutput(ids.join("\n"));
    setGeneratedCount(ids.length);
    setGeneratedType(idType);
    setCopied(false);
    toast({
      title: "IDs generated",
      description: `Generated ${ids.length} ${getTypeLabel(idType)}`,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "All IDs have been copied to your clipboard",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setOutput("");
    setGeneratedCount(0);
    setCopied(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="relative inline-block">
            ID Generator
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-teal-400 rounded-full"></div>
          </CardTitle>
          <CardDescription>
            Generate batches of UUIDs or ULIDs for your projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">ID Type</Label>
              <RadioGroup
                value={idType}
                onValueChange={(value: string) => setIdType(value as IdType)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="uuid-v4" id="uuid-v4" />
                  <Label htmlFor="uuid-v4" className="cursor-pointer">
                    UUID v4
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="uuid-v7" id="uuid-v7" />
                  <Label htmlFor="uuid-v7" className="cursor-pointer">
                    UUID v7
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ulid" id="ulid" />
                  <Label htmlFor="ulid" className="cursor-pointer">
                    ULID
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="count" className="mb-2 block">
                Count
              </Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={1000}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-32"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerate}>Generate</Button>
              {output && (
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {output && (
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Output</CardTitle>
              <CardDescription>
                Generated {generatedCount} {getTypeLabel(generatedType)}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              {copied ? (
                <ClipboardCheck className="h-4 w-4" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
              Copy All
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[300px] font-mono text-sm"
              readOnly
              value={output}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}

function IdGeneratorExplanation() {
  return (
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
  );
}
