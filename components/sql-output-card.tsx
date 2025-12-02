import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clipboard, ClipboardCheck } from "lucide-react";

interface SqlOutputCardProps {
  sqlOutput: string;
  copied: boolean;
  onCopy: () => void;
}

export function SqlOutputCard({
  sqlOutput,
  copied,
  onCopy,
}: SqlOutputCardProps) {
  if (!sqlOutput) return null;

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>SQL Output</CardTitle>
          <CardDescription>Ready to use in your database</CardDescription>
        </div>
        <Button
          variant="outline"
          onClick={onCopy}
          className="flex items-center gap-2"
        >
          {copied ? (
            <ClipboardCheck className="h-4 w-4" />
          ) : (
            <Clipboard className="h-4 w-4" />
          )}
          Copy SQL
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          className="min-h-[300px] font-mono text-sm"
          readOnly
          value={sqlOutput}
        />
      </CardContent>
    </Card>
  );
}
