import { Label } from "@/components/ui/label";
import { SqlTypeCastingOptions } from "@/components/sql-type-casting-options";
import { toSnakeCase } from "@/lib/utils/sql-generator";

interface ColumnMappingGridProps {
  headers: string[];
  columnMappings: string[];
  columnCastings: string[];
  onMappingChange: (index: number, value: string) => void;
  onCastingChange: (index: number, value: string) => void;
  sourceLabel?: string; // "CSV Header" or "JSON Property"
}

export function SqlColumnMappingGrid({
  headers,
  columnMappings,
  columnCastings,
  onMappingChange,
  onCastingChange,
  sourceLabel = "CSV Header",
}: ColumnMappingGridProps) {
  return (
    <div className="space-y-2">
      <Label>Column Mapping & Casting</Label>
      <div className="border rounded-md p-4 space-y-2">
        <div className="text-sm text-muted-foreground mb-2">
          Map your {sourceLabel.toLowerCase()}s to database column names and
          specify optional type casting:
        </div>
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 items-center mb-2 text-sm font-medium text-muted-foreground">
          <div>{sourceLabel}</div>
          <div>Database Column</div>
          <div>Type Casting</div>
        </div>
        {headers.map((header, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_1fr_1fr] gap-2 items-center"
          >
            <div className="text-sm font-medium">{header}</div>
            <input
              type="text"
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={columnMappings[index] || toSnakeCase(header)}
              onChange={(e) => onMappingChange(index, e.target.value)}
              placeholder={toSnakeCase(header)}
            />
            <div className="relative">
              <input
                type="text"
                list={`casting-options-${index}`}
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Select or type custom (e.g., ::uuid)"
                value={columnCastings[index] || ""}
                onChange={(e) => onCastingChange(index, e.target.value)}
              />
              <SqlTypeCastingOptions id={`casting-options-${index}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
