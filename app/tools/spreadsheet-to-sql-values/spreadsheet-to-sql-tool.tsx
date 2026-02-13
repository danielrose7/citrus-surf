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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  valueToSqlStringWithCasting,
} from "@/lib/utils/sql-generator";

export function SpreadsheetToSqlTool() {
  const [csvInput, setCsvInput] = useState("");
  const [delimiter, setDelimiter] = useState("tab");

  // Use shared state hook
  const state = useSqlConverterState();

  // Parse CSV and convert to SQL format
  const convertToSql = () => {
    // Use shared validation
    if (!validateSqlInput(csvInput, state.outputFormat, state.tableName, "CSV")) {
      return;
    }

    try {
      // Split into lines and filter out empty lines
      const lines = csvInput.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        toast({
          title: "No data found",
          description: "Please enter valid data",
          variant: "destructive",
        });
        return;
      }

      // Determine the delimiter to use
      const delimiterChar =
        delimiter === "tab" ? "\t" : delimiter === "comma" ? "," : "\t";

      // Parse each line
      const rows = lines.map((line) => parseLine(line, delimiterChar));

      if (state.outputFormat === "script") {
        // Extract headers from first row
        const csvHeaders = rows[0];
        state.initializeColumnMappings(csvHeaders);

        // Process data rows (skip header row)
        const dataRows = rows.slice(1);

        if (dataRows.length === 0) {
          toast({
            title: "No data rows found",
            description: "Please ensure you have data rows after the header",
            variant: "destructive",
          });
          return;
        }

        // Prepare common parameters
        const mappedHeaders =
          state.columnMappings.length === csvHeaders.length
            ? state.columnMappings
            : csvHeaders.map((header) => header.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, ""));

        const finalCastings =
          state.columnCastings.length === csvHeaders.length
            ? state.columnCastings
            : new Array(csvHeaders.length).fill("");

        const valueRows = dataRows.map((values) => {
          const escapedValues = values.map((value, idx) =>
            valueToSqlStringWithCasting(value, finalCastings[idx])
          );
          return `(${escapedValues.join(", ")})`;
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
        // Original VALUES format
        const valueRows = rows.map((values) => {
          const escapedValues = values.map((value) => {
            const escaped = value.replace(/'/g, "''");
            return `'${escaped}'`;
          });
          return `(${escapedValues.join(", ")})`;
        });

        const sql = generateValues(valueRows);
        state.setSqlOutput(sql);
      }

      // Use shared success toast
      showConversionSuccess(state.outputFormat, state.scriptType);
    } catch (error) {
      toast({
        title: "Error converting to SQL",
        description: "Please check your data format and try again",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const loadSampleData = () => {
    setCsvInput(`uuid\tfirst_name\tlast_name\temail
ffa773fa-45db-443e-bbd8-1ca7b1a13d49\tRoy\tRoper\troy.roper@example.com
fe057db7-01f5-478c-ae2d-9ceb168c21d7\tDavid\tWeaver\tdavid.weaver@example.com
a1b2c3d4-e5f6-7890-abcd-ef1234567890\tSarah\tJohnson\tsarah.johnson@example.com`);
    state.setTableName("contact");
    state.setWhereColumn("external_id");
  };

  const parseLine = (line: string, delimiter: string): string[] => {
    // For tab-delimited data, just split by tabs
    if (delimiter === "\t") {
      return line.split("\t");
    }

    // For comma-delimited data, handle quoted fields
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        // Handle quotes - toggle inQuotes state
        if (inQuotes && i < line.length - 1 && line[i + 1] === '"') {
          // Double quotes inside quoted field - add a single quote
          current += '"';
          i++; // Skip the next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // End of field
        result.push(current);
        current = "";
      } else {
        // Add character to current field
        current += char;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  };

  // Use shared clipboard utility
  const copyToClipboard = async () => {
    await utilCopyToClipboard(state.sqlOutput, () => state.setCopied(true));
    setTimeout(() => state.setCopied(false), 2000);
  };

  const clearAll = () => {
    state.clearAll(() => setCsvInput(""));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="relative inline-block">
            Spreadsheet to SQL Converter
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-teal-400 rounded-full"></div>
          </CardTitle>
          <CardDescription>
            Convert data from CSV files, Google Spreadsheets, or Excel exports
            to SQL VALUES, UPDATE loops, INSERT statements, or UPSERT operations
            for database import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <OutputFormatSelector
                value={state.outputFormat}
                onChange={state.setOutputFormat}
              />

              <div className="space-y-2">
                <Label>Delimiter</Label>
                <RadioGroup
                  defaultValue="tab"
                  value={delimiter}
                  onValueChange={setDelimiter}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tab" id="tab" />
                    <Label htmlFor="tab">Tab</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comma" id="comma" />
                    <Label htmlFor="comma">Comma</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

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
              <Label htmlFor="csvInput">Input Data</Label>
              <Textarea
                id="csvInput"
                placeholder="Paste your data here"
                className="min-h-[150px] font-mono text-sm"
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
              />
            </div>

            {state.outputFormat === "script" && state.headers.length > 0 && (
              <SqlColumnMappingGrid
                headers={state.headers}
                columnMappings={state.columnMappings}
                columnCastings={state.columnCastings}
                onMappingChange={state.updateColumnMapping}
                onCastingChange={state.updateColumnCasting}
                sourceLabel="CSV Header"
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
