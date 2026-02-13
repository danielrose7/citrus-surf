"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { NavBar } from "@/components/nav-bar";
import { ToolExplanation } from "@/components/tool-explanation";
import { OutputFormatSelector } from "@/components/sql-output-format-selector";
import { ScriptTypeSelector } from "@/components/sql-script-type-selector";
import { SqlTableConfig } from "@/components/sql-table-config";
import { SqlColumnMappingGrid } from "@/components/sql-column-mapping-grid";
import { SqlOutputCard } from "@/components/sql-output-card";
import { useSqlConverterState } from "@/lib/hooks/use-sql-converter-state";
import {
  generateSqlScript,
  generateValues,
  validateSqlInput,
  copyToClipboard as utilCopyToClipboard,
  showConversionSuccess,
  valueToSqlString,
  valueToSqlStringWithCasting,
} from "@/lib/utils/sql-generator";

export default function JsonToSqlPage() {
  return (
    <>
      <NavBar />
      <JsonToSqlTool />
      <JsonToSqlExplanation />
    </>
  );
}

function JsonToSqlExplanation() {
  return (
    <ToolExplanation
      title="About JSON to SQL Converter"
      description="Transform JSON data into SQL statements for database operations"
    >
      <h3>What is a JSON to SQL Converter?</h3>
      <p>
        A JSON to SQL converter transforms JSON data (arrays of objects) into
        SQL statements that can be executed in a database. This tool is perfect
        for converting API responses, exported data, or any structured JSON into
        database-ready SQL queries including INSERT statements, UPDATE loops,
        and VALUES clauses.
      </p>

      <h3>Common Use Cases</h3>
      <ul>
        <li>
          <strong>API Data Import:</strong> Convert JSON responses from APIs
          directly into SQL for database storage.
        </li>
        <li>
          <strong>Data Migration:</strong> Transform JSON exports from NoSQL
          databases or applications into SQL for relational databases.
        </li>
        <li>
          <strong>Bulk Operations:</strong> Generate UPDATE or INSERT statements
          for multiple records from JSON data.
        </li>
        <li>
          <strong>Testing & Development:</strong> Create SQL statements from
          JSON test data or mock API responses.
        </li>
        <li>
          <strong>Data Synchronization:</strong> Convert JSON data from external
          systems into SQL for database updates.
        </li>
      </ul>

      <h3>How to Use This Tool</h3>
      <ol>
        <li>Paste your JSON array of objects into the input field</li>
        <li>
          Choose your desired output format (VALUES, UPDATE Loop, INSERT Loop,
          or UPSERT Loop)
        </li>
        <li>
          For UPDATE/INSERT/UPSERT loops, enter your table name and configure
          column mappings
        </li>
        <li>
          Specify type casting for columns that need it (e.g., ::uuid,
          ::timestamp)
        </li>
        <li>Click "Convert to SQL" to generate the SQL statements</li>
        <li>Copy the generated SQL and execute it in your database</li>
      </ol>

      <h3>Output Formats</h3>
      <ul>
        <li>
          <strong>VALUES:</strong> Generates a simple VALUES clause that can be
          used in INSERT statements or CTEs.
        </li>
        <li>
          <strong>UPDATE Loop:</strong> Creates a PostgreSQL DO block that
          updates existing records based on a WHERE condition.
        </li>
        <li>
          <strong>INSERT Loop:</strong> Generates a PostgreSQL DO block that
          inserts new records into the specified table.
        </li>
        <li>
          <strong>UPSERT Loop:</strong> Creates a PostgreSQL DO block that uses
          INSERT with ON CONFLICT to either insert new records or update
          existing ones based on a conflict column (unique constraint or index).
          Perfect for data synchronization when you want to handle both inserts
          and updates in a single operation.
        </li>
      </ul>

      <h3>JSON Structure Requirements</h3>
      <p>
        Your JSON should be an array of objects where each object represents a
        row of data:
      </p>
      <pre className="bg-muted p-3 rounded text-sm">
        {`[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  },
  {
    "id": "987fcdeb-51a2-43d1-9f12-345678901234",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25
  }
]`}
      </pre>

      <h3>Type Casting</h3>
      <p>
        The tool supports PostgreSQL type casting to ensure your data is
        properly typed in the database. Without casting, all values are
        inserted as text strings. Casting tells PostgreSQL to interpret and
        validate values as the correct type, catching errors early and
        ensuring data integrity. Common castings include:
      </p>
      <ul>
        <li>
          <strong>::uuid</strong> - For UUID fields (validates format)
        </li>
        <li>
          <strong>::timestamp / ::timestamptz</strong> - For datetime fields
        </li>
        <li>
          <strong>::integer / ::numeric</strong> - For whole or decimal numbers
        </li>
        <li>
          <strong>::boolean</strong> - For true/false values
        </li>
        <li>
          <strong>::jsonb / ::json</strong> - For JSON data (see below)
        </li>
        <li>
          <strong>Custom types</strong> - Any PostgreSQL type or enum
        </li>
      </ul>

      <h3>JSONB &amp; JSON Columns</h3>
      <p>
        When you apply <code>::jsonb</code> or <code>::json</code> casting,
        the tool does something special: instead of inserting a raw JSON
        string like <code>&apos;{`{"city":"Portland"}`}&apos;::jsonb</code>,
        it generates PostgreSQL builder expressions:
      </p>
      <pre className="bg-muted p-3 rounded text-sm">
        {`-- Object values become:
jsonb_build_object('city', 'Portland', 'state', 'OR')

-- Array values become:
jsonb_build_array(1, 2, 3)

-- Nested structures are handled recursively:
jsonb_build_object('address', jsonb_build_object('city', 'Portland'))`}
      </pre>
      <p>
        This approach is more robust than string literals because PostgreSQL
        validates each key and value individually, making it easier to spot
        errors. It also handles quoting and escaping automatically, so you
        don&apos;t have to worry about special characters breaking your SQL.
      </p>

      <h3>Tips for Best Results</h3>
      <ul>
        <li>
          <strong>Consistent Structure:</strong> Ensure all objects in your JSON
          array have the same property structure.
        </li>
        <li>
          <strong>Data Types:</strong> Use appropriate type casting for UUIDs,
          timestamps, and other special data types.
        </li>
        <li>
          <strong>Test First:</strong> Always test generated SQL on a small
          dataset before running on production data.
        </li>
        <li>
          <strong>Backup:</strong> Create database backups before executing
          large update operations.
        </li>
        <li>
          <strong>Validation:</strong> Validate your JSON format before
          conversion to avoid errors.
        </li>
      </ul>

      <h3>UPSERT Loop Details</h3>
      <p>
        The UPSERT Loop uses PostgreSQL&apos;s native{" "}
        <code>INSERT ... ON CONFLICT ... DO UPDATE</code> syntax to handle both
        inserts and updates automatically. Key points:
      </p>
      <ul>
        <li>
          <strong>Conflict Column(s):</strong> Specify the column(s) that have a
          unique constraint or index. For composite keys, use comma-separated
          column names (e.g., &quot;col1, col2&quot;). When a conflict occurs,
          the row is updated instead of inserted.
        </li>
        <li>
          <strong>Automatic Updates:</strong> All columns except the conflict
          column(s) are automatically updated when a conflict is detected.
        </li>
        <li>
          <strong>Type Safety:</strong> Type casting is applied to ensure data
          consistency between insert and update operations.
        </li>
        <li>
          <strong>Database Constraint Required:</strong> Ensure your table has a
          unique constraint or index on the conflict column(s) for this pattern
          to work correctly.
        </li>
        <li>
          <strong>Composite Keys:</strong> Perfect for tables with composite
          unique constraints like{" "}
          <code>@@unique([col1, col2])</code> in Prisma models.
        </li>
      </ul>

      <h3>Security & Privacy</h3>
      <p>
        All JSON processing happens locally in your browser. Your data never
        leaves your device, ensuring complete privacy and security. However,
        always verify generated SQL before executing it on sensitive databases.
      </p>
    </ToolExplanation>
  );
}

function JsonToSqlTool() {
  const [jsonInput, setJsonInput] = useState("");

  // Use shared state hook
  const state = useSqlConverterState();

  // Parse JSON and convert to SQL format
  const convertToSql = () => {
    // Use shared validation
    if (
      !validateSqlInput(jsonInput, state.outputFormat, state.tableName, "JSON")
    ) {
      return;
    }

    try {
      // Parse JSON
      let jsonData;
      try {
        jsonData = JSON.parse(jsonInput);
      } catch {
        toast({
          title: "Invalid JSON",
          description: "Please check your JSON format and try again",
          variant: "destructive",
        });
        return;
      }

      // Ensure JSON is an array
      if (!Array.isArray(jsonData)) {
        toast({
          title: "Invalid JSON structure",
          description: "JSON must be an array of objects",
          variant: "destructive",
        });
        return;
      }

      if (jsonData.length === 0) {
        toast({
          title: "Empty JSON array",
          description: "The JSON array contains no items to convert",
          variant: "destructive",
        });
        return;
      }

      // Extract all possible keys from all objects
      const allKeys = new Set<string>();
      jsonData.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          Object.keys(item).forEach((key) => allKeys.add(key));
        }
      });

      const jsonHeaders = Array.from(allKeys);
      state.initializeColumnMappings(jsonHeaders);

      if (state.outputFormat === "script") {
        // Generate mapped headers
        const mappedHeaders =
          state.columnMappings.length === jsonHeaders.length
            ? state.columnMappings
            : jsonHeaders.map((header) =>
                header
                  .toLowerCase()
                  .replace(/[^a-zA-Z0-9]+/g, "_")
                  .replace(/^_+|_+$/g, "")
              );

        const finalCastings =
          state.columnCastings.length === jsonHeaders.length
            ? state.columnCastings
            : new Array(jsonHeaders.length).fill("");

        // Convert JSON objects to value rows (JSONB columns use builder expressions)
        const valueRows = jsonData.map((item) => {
          const values = jsonHeaders.map((header, idx) => {
            const value = item[header];
            return valueToSqlStringWithCasting(value, finalCastings[idx]);
          });
          return `(${values.join(", ")})`;
        });

        // Generate SQL using shared script generation utility
        const sql = generateSqlScript({
          scriptType: state.scriptType as "insert" | "update" | "upsert",
          tableName: state.tableName,
          mappedHeaders,
          valueRows,
          columnCastings: finalCastings,
          whereColumn: state.whereColumn,
          conflictColumns: state.conflictColumn,
        });

        state.setSqlOutput(sql);
      } else {
        // VALUES format
        const valueRows = jsonData.map((item) => {
          const values = jsonHeaders.map((header) => {
            const value = item[header];
            return valueToSqlString(value);
          });
          return `(${values.join(", ")})`;
        });

        const sql = generateValues(valueRows);
        state.setSqlOutput(sql);
      }

      // Use shared success toast
      showConversionSuccess(state.outputFormat, state.scriptType);
    } catch (error) {
      toast({
        title: "Error converting to SQL",
        description: "Please check your JSON format and try again",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const loadSampleData = () => {
    setJsonInput(
      JSON.stringify(
        [
          {
            id: "ffa773fa-45db-443e-bbd8-1ca7b1a13d49",
            first_name: "Roy",
            last_name: "Roper",
            email: "roy.roper@example.com",
            age: 32,
            active: true,
          },
          {
            id: "fe057db7-01f5-478c-ae2d-9ceb168c21d7",
            first_name: "David",
            last_name: "Weaver",
            email: "david.weaver@example.com",
            age: 28,
            active: true,
          },
          {
            id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            first_name: "Sarah",
            last_name: "Johnson",
            email: "sarah.johnson@example.com",
            age: 35,
            active: false,
          },
        ],
        null,
        2
      )
    );
    state.setTableName("users");
    state.setWhereColumn("id");
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      toast({
        title: "JSON formatted",
        description: "Your JSON has been formatted with proper indentation",
      });
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON format and try again",
        variant: "destructive",
      });
    }
  };

  // Use shared clipboard utility
  const copyToClipboard = async () => {
    await utilCopyToClipboard(state.sqlOutput, () => state.setCopied(true));
    setTimeout(() => state.setCopied(false), 2000);
  };

  const clearAll = () => {
    state.clearAll(() => setJsonInput(""));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="relative inline-block">
            JSON to SQL Converter
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-teal-400 rounded-full"></div>
          </CardTitle>
          <CardDescription>
            Convert JSON arrays of objects into SQL VALUES, UPDATE loops, INSERT
            statements, or UPSERT operations for database operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <OutputFormatSelector
              value={state.outputFormat}
              onChange={state.setOutputFormat}
            />

            {state.outputFormat === "script" && (
              <ScriptTypeSelector
                value={state.scriptType}
                onChange={state.setScriptType}
              />
            )}

            {state.outputFormat === "script" && (
              <SqlTableConfig
                scriptType={state.scriptType}
                tableName={state.tableName}
                onTableNameChange={state.setTableName}
                whereColumn={state.whereColumn}
                onWhereColumnChange={state.setWhereColumn}
                conflictColumn={state.conflictColumn}
                onConflictColumnChange={state.setConflictColumn}
              />
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="jsonInput">JSON Input</Label>
                <Button variant="outline" size="sm" onClick={formatJson}>
                  Format JSON
                </Button>
              </div>
              <Textarea
                id="jsonInput"
                placeholder='Paste your JSON array here. Example: [{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]'
                className="min-h-[200px] font-mono text-sm"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
            </div>

            {state.outputFormat === "script" && state.headers.length > 0 && (
              <SqlColumnMappingGrid
                headers={state.headers}
                columnMappings={state.columnMappings}
                columnCastings={state.columnCastings}
                onMappingChange={state.updateColumnMapping}
                onCastingChange={state.updateColumnCasting}
                sourceLabel="JSON Property"
              />
            )}

            <div className="flex gap-2">
              <Button onClick={convertToSql}>Convert to SQL</Button>
              <Button variant="outline" onClick={loadSampleData}>
                Load Sample Data
              </Button>
              {state.sqlOutput && (
                <Button variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <SqlOutputCard
        sqlOutput={state.sqlOutput}
        copied={state.copied}
        onCopy={copyToClipboard}
      />
    </>
  );
}
