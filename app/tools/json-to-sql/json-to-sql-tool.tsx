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

export function JsonToSqlTool() {
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
