import { useState } from "react";
import { toSnakeCase } from "@/lib/utils/sql-generator";

export function useSqlConverterState() {
  const [sqlOutput, setSqlOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [outputFormat, setOutputFormat] = useState("values");
  const [scriptType, setScriptType] = useState("insert");
  const [tableName, setTableName] = useState("");
  const [whereColumn, setWhereColumn] = useState("");
  const [conflictColumn, setConflictColumn] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<string[]>([]);
  const [columnCastings, setColumnCastings] = useState<string[]>([]);

  const updateColumnMapping = (index: number, value: string) => {
    const newMappings = [...columnMappings];
    newMappings[index] = value;
    setColumnMappings(newMappings);
  };

  const updateColumnCasting = (index: number, value: string) => {
    const newCastings = [...columnCastings];
    newCastings[index] = value;
    setColumnCastings(newCastings);
  };

  const initializeColumnMappings = (newHeaders: string[]) => {
    setHeaders(newHeaders);
    if (columnMappings.length !== newHeaders.length) {
      setColumnMappings(newHeaders.map((header) => toSnakeCase(header)));
    }
    if (columnCastings.length !== newHeaders.length) {
      setColumnCastings(new Array(newHeaders.length).fill(""));
    }
  };

  const clearAll = (resetInput: () => void) => {
    resetInput();
    setSqlOutput("");
    setCopied(false);
    setTableName("");
    setWhereColumn("");
    setConflictColumn("");
    setHeaders([]);
    setColumnMappings([]);
    setColumnCastings([]);
  };

  return {
    // State
    sqlOutput,
    setSqlOutput,
    copied,
    setCopied,
    outputFormat,
    setOutputFormat,
    scriptType,
    setScriptType,
    tableName,
    setTableName,
    whereColumn,
    setWhereColumn,
    conflictColumn,
    setConflictColumn,
    headers,
    columnMappings,
    columnCastings,
    // Functions
    updateColumnMapping,
    updateColumnCasting,
    initializeColumnMappings,
    clearAll,
  };
}
