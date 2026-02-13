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

export function IdGeneratorTool() {
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
