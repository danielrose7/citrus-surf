/**
 * Shared SQL generation utilities for converting data to SQL statements
 */

import { toast } from "@/components/ui/use-toast";

export interface SqlGeneratorOptions {
  tableName: string;
  mappedHeaders: string[];
  valueRows: string[];
  columnCastings: string[];
  whereColumn?: string;
  conflictColumns?: string;
}

/**
 * Escapes a SQL string value by doubling single quotes
 */
export function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Converts a value to a SQL-safe string representation
 */
export function valueToSqlString(value: unknown): string {
  if (value === undefined || value === null) return "NULL";

  if (typeof value === "string") {
    const escaped = escapeSqlString(value);
    return `'${escaped}'`;
  }

  if (typeof value === "object") {
    const escaped = escapeSqlString(JSON.stringify(value));
    return `'${escaped}'`;
  }

  return `'${String(value)}'`;
}

/**
 * Recursively builds a PostgreSQL JSONB constructor expression from a JS value.
 * Objects → jsonb_build_object(), Arrays → jsonb_build_array(),
 * primitives → SQL literals.
 */
export function valueToJsonbExpression(value: unknown): string {
  if (value === undefined || value === null) return "NULL";

  if (Array.isArray(value)) {
    const elements = value.map((el) => valueToJsonbExpression(el));
    return `jsonb_build_array(${elements.join(", ")})`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "'{}'::jsonb";
    const args = entries.flatMap(([key, val]) => [
      `'${escapeSqlString(key)}'`,
      valueToJsonbExpression(val),
    ]);
    return `jsonb_build_object(${args.join(", ")})`;
  }

  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `'${escapeSqlString(value)}'`;

  return `'${escapeSqlString(String(value))}'`;
}

/**
 * Converts a value to a SQL string, using JSONB builder expressions when
 * the column has a ::jsonb or ::json casting and the value is/contains JSON.
 */
export function valueToSqlStringWithCasting(
  value: unknown,
  casting: string
): string {
  const isJsonCast =
    casting === "::jsonb" || casting === "::json";

  if (!isJsonCast) return valueToSqlString(value);

  if (value === undefined || value === null) return "NULL";

  // If already an object/array, use the builder directly
  if (typeof value === "object") {
    return valueToJsonbExpression(value);
  }

  // If it's a string, try parsing as JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) {
        return valueToJsonbExpression(parsed);
      }
    } catch {
      // Not valid JSON — fall through to default
    }
  }

  return valueToSqlString(value);
}

/**
 * Converts a string to snake_case for database column names
 */
export function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Generates a PostgreSQL UPDATE loop DO block
 */
export function generateUpdateLoop(options: SqlGeneratorOptions): string {
  const {
    tableName,
    mappedHeaders,
    valueRows,
    columnCastings,
    whereColumn,
  } = options;

  const whereCol = whereColumn || mappedHeaders[0];
  const updateColumns = mappedHeaders.slice(1);

  return `DO $$
DECLARE
    row_data RECORD;
BEGIN
    FOR row_data IN
        SELECT * FROM (VALUES
            ${valueRows.join(",\n            ")}
        ) AS row_data(${mappedHeaders.join(", ")})
    LOOP
        UPDATE ${tableName}
        SET ${updateColumns
          .map((col, idx) => {
            const castingIndex = idx + 1; // Skip first column (WHERE column)
            const casting = columnCastings[castingIndex]
              ? `${columnCastings[castingIndex]}`
              : "";
            return `${col} = row_data.${col}${casting}`;
          })
          .join(", ")}
        WHERE ${whereCol} = row_data.${mappedHeaders[0]}${columnCastings[0] ? columnCastings[0] : ""};
    END LOOP;
END $$;`;
}

/**
 * Generates a PostgreSQL INSERT loop DO block
 */
export function generateInsertLoop(options: SqlGeneratorOptions): string {
  const { tableName, mappedHeaders, valueRows, columnCastings } = options;

  return `DO $$
DECLARE
    row_data RECORD;
BEGIN
    FOR row_data IN
        SELECT * FROM (VALUES
            ${valueRows.join(",\n            ")}
        ) AS row_data(${mappedHeaders.join(", ")})
    LOOP
        INSERT INTO ${tableName} (${mappedHeaders.join(", ")})
        VALUES (${mappedHeaders
          .map((col, idx) => {
            const casting = columnCastings[idx] ? `${columnCastings[idx]}` : "";
            return `row_data.${col}${casting}`;
          })
          .join(", ")});
    END LOOP;
END $$;`;
}

/**
 * Generates a PostgreSQL UPSERT loop DO block with ON CONFLICT
 * Supports both single and composite conflict columns
 */
export function generateUpsertLoop(options: SqlGeneratorOptions): string {
  const {
    tableName,
    mappedHeaders,
    valueRows,
    columnCastings,
    conflictColumns,
  } = options;

  // Parse conflict columns (supports comma-separated list for composite keys)
  const conflictColInput = conflictColumns || mappedHeaders[0];
  const conflictCols = conflictColInput
    .split(",")
    .map((col) => col.trim())
    .filter((col) => col.length > 0);

  // Filter out conflict columns from UPDATE SET clause
  const updateColumns = mappedHeaders.filter(
    (col) => !conflictCols.includes(col)
  );

  return `DO $$
DECLARE
    row_data RECORD;
BEGIN
    FOR row_data IN
        SELECT * FROM (VALUES
            ${valueRows.join(",\n            ")}
        ) AS row_data(${mappedHeaders.join(", ")})
    LOOP
        INSERT INTO ${tableName} (${mappedHeaders.join(", ")})
        VALUES (${mappedHeaders
          .map((col, idx) => {
            const casting = columnCastings[idx] ? `${columnCastings[idx]}` : "";
            return `row_data.${col}${casting}`;
          })
          .join(", ")})
        ON CONFLICT (${conflictCols.join(", ")}) DO UPDATE SET
            ${updateColumns
              .map((col) => {
                const originalIdx = mappedHeaders.indexOf(col);
                const casting = columnCastings[originalIdx]
                  ? `${columnCastings[originalIdx]}`
                  : "";
                return `${col} = EXCLUDED.${col}${casting}`;
              })
              .join(",\n            ")};
    END LOOP;
END $$;`;
}

/**
 * Generates a simple VALUES clause for SQL
 */
export function generateValues(valueRows: string[]): string {
  return valueRows.join(",\n") + ";";
}

/**
 * Validates input and table configuration for SQL generation
 */
export function validateSqlInput(
  input: string,
  outputFormat: string,
  tableName: string,
  inputType: "CSV" | "JSON" = "CSV"
): boolean {
  if (!input.trim()) {
    toast({
      title: "Empty input",
      description: `Please enter some ${inputType} data to convert`,
      variant: "destructive",
    });
    return false;
  }

  if (outputFormat === "script" && !tableName.trim()) {
    toast({
      title: "Missing table name",
      description: "Please enter a table name for script queries",
      variant: "destructive",
    });
    return false;
  }

  return true;
}

/**
 * Copies text to clipboard with toast notification
 */
export async function copyToClipboard(
  text: string,
  onSuccess: () => void
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess();

    toast({
      title: "Copied to clipboard",
      description: "The SQL has been copied to your clipboard",
    });
  } catch {
    toast({
      title: "Failed to copy",
      description: "Please try again or copy manually",
      variant: "destructive",
    });
  }
}

/**
 * Shows conversion success toast
 */
export function showConversionSuccess(
  outputFormat: string,
  scriptType: string
): void {
  toast({
    title: "Conversion complete",
    description: `Generated ${
      outputFormat === "script"
        ? `${scriptType.toUpperCase()} script`
        : "VALUES"
    } SQL`,
  });
}

export interface ScriptGenerationOptions extends SqlGeneratorOptions {
  scriptType: "insert" | "update" | "upsert";
}

/**
 * Generates SQL script based on script type
 * Handles INSERT, UPDATE, and UPSERT loops with consistent logic
 */
export function generateSqlScript(options: ScriptGenerationOptions): string {
  const { scriptType } = options;

  let sql: string;

  if (scriptType === "update") {
    sql = generateUpdateLoop(options);
    // Add human-friendly reminder for UPDATE scripts
    sql = sql.replace(
      "END $$;",
      "        -- HEY HUMAN!! REMEMBER TO ADD ANY ADDITIONAL 'WHERE' conditions beyond this 1:1 match\n    END LOOP;\nEND $$;"
    );
  } else if (scriptType === "insert") {
    sql = generateInsertLoop(options);
  } else {
    sql = generateUpsertLoop(options);
  }

  return sql;
}
