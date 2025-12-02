import { Label } from "@/components/ui/label";

interface TableConfigProps {
  scriptType: string;
  tableName: string;
  onTableNameChange: (value: string) => void;
  whereColumn: string;
  onWhereColumnChange: (value: string) => void;
  conflictColumn: string;
  onConflictColumnChange: (value: string) => void;
}

export function SqlTableConfig({
  scriptType,
  tableName,
  onTableNameChange,
  whereColumn,
  onWhereColumnChange,
  conflictColumn,
  onConflictColumnChange,
}: TableConfigProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="tableName">Table Name</Label>
        <input
          id="tableName"
          type="text"
          placeholder="e.g., users"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={tableName}
          onChange={(e) => onTableNameChange(e.target.value)}
        />
      </div>

      {scriptType === "update" && (
        <div className="space-y-2">
          <Label htmlFor="whereColumn">WHERE Column</Label>
          <input
            id="whereColumn"
            type="text"
            placeholder="e.g., id or external_id"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={whereColumn}
            onChange={(e) => onWhereColumnChange(e.target.value)}
          />
        </div>
      )}

      {scriptType === "upsert" && (
        <div className="space-y-2">
          <Label htmlFor="conflictColumn">Conflict Column(s)</Label>
          <input
            id="conflictColumn"
            type="text"
            placeholder="e.g., id or shipment_id, field_id"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={conflictColumn}
            onChange={(e) => onConflictColumnChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            For composite keys, use comma-separated column names
          </p>
        </div>
      )}
    </div>
  );
}
