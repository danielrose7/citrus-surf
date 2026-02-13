import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { ToolExplanation } from "@/components/tool-explanation";
import { SITE_URL, toolJsonLd } from "@/lib/constants/site";
import { SpreadsheetToSqlTool } from "./spreadsheet-to-sql-tool";

const title = "Spreadsheet to SQL Converter — CSV & Excel to SQL";
const description =
  "Convert CSV, Google Sheets, or Excel data to SQL VALUES, INSERT, UPDATE, or UPSERT statements. Free PostgreSQL query generator with type casting.";
const url = `${SITE_URL}/tools/spreadsheet-to-sql-values`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "spreadsheet to SQL",
    "CSV to SQL",
    "Excel to SQL",
    "Google Sheets to SQL",
    "SQL VALUES generator",
    "PostgreSQL",
  ],
  alternates: { canonical: url },
  openGraph: { title, description, url },
};

export default function SqlConverterPage() {
  return (
    <>
      <NavBar />
      <SpreadsheetToSqlTool />
      <ToolExplanation
        title="About Spreadsheet to SQL Converter"
        description="Learn how to efficiently convert CSV, Google Spreadsheets, and Excel data to SQL queries"
      >
        <h3>What is a Spreadsheet to SQL Converter?</h3>
        <p>
          A Spreadsheet to SQL converter is a tool that transforms data from
          various spreadsheet formats including CSV files, Google Spreadsheets
          exports, and Excel spreadsheets into SQL statements that can be executed
          in a database. This tool bridges the gap between spreadsheet data and
          database operations, making it easy to import or update data in your
          database regardless of whether your data comes from CSV files, Google
          Spreadsheets, or Excel workbooks.
        </p>

        <h3>Common Use Cases</h3>
        <ul>
          <li>
            <strong>Data Migration:</strong> Quickly convert exported data from
            Google Spreadsheets, Excel, or CSV files from one system into SQL for
            importing into another database.
          </li>
          <li>
            <strong>Bulk Updates:</strong> Generate UPDATE statements to modify
            multiple records at once using data from CSV exports, Google
            Spreadsheets, or Excel files.
          </li>
          <li>
            <strong>Database Seeding:</strong> Create SQL statements to populate
            test or development databases with sample data from spreadsheet
            applications.
          </li>
          <li>
            <strong>Data Correction:</strong> Generate SQL to fix data issues
            across multiple records using data exported from Google Spreadsheets,
            Excel, or saved as CSV files.
          </li>
        </ul>

        <h3>How to Use This Tool</h3>
        <ol>
          <li>
            Export your data from Google Spreadsheets, Excel, or save as CSV
            format
          </li>
          <li>Choose your desired output format (VALUES, UPDATE Loop, INSERT Loop, or UPSERT Loop)</li>
          <li>Select the appropriate delimiter for your data (tab or comma)</li>
          <li>For UPDATE/INSERT/UPSERT loops, enter your table name and relevant column configuration</li>
          <li>Paste your spreadsheet data into the input field</li>
          <li>Click &quot;Convert to SQL&quot; to generate the SQL statements</li>
          <li>
            Copy the generated SQL and execute it in your database management tool
          </li>
        </ol>

        <h3>Working with Different Spreadsheet Formats</h3>
        <ul>
          <li>
            <strong>Google Spreadsheets:</strong> Copy and paste directly from
            Google Sheets, or download as CSV/TSV and paste the contents.
          </li>
          <li>
            <strong>Excel:</strong> Copy data from Excel and paste directly, or
            save as CSV/Tab-delimited text and paste the file contents.
          </li>
          <li>
            <strong>CSV Files:</strong> Open CSV files in any text editor and copy
            the contents, or import into Google Spreadsheets/Excel first.
          </li>
        </ul>

        <h3>Understanding Different Loop Types</h3>
        <p>
          The loop features generate PostgreSQL DO blocks that iterate through your
          spreadsheet data row by row:
        </p>
        <ul>
          <li>
            <strong>UPDATE Loop:</strong> Updates existing records based on a WHERE
            condition. Perfect for bulk updates where records already exist.
          </li>
          <li>
            <strong>INSERT Loop:</strong> Inserts new records into the table.
            Useful when you need to add many new rows.
          </li>
          <li>
            <strong>UPSERT Loop:</strong> Uses PostgreSQL&apos;s INSERT ... ON CONFLICT
            to either insert new records or update existing ones. Ideal for data
            synchronization where some records may already exist. Supports composite
            keys for complex unique constraints.
          </li>
        </ul>

        <h3>Tips for Effective Data Conversion</h3>
        <ul>
          <li>
            <strong>Include Headers:</strong> For UPDATE loops, include column
            headers in your first row when copying from Google Spreadsheets,
            Excel, or CSV files to enable automatic column mapping.
          </li>
          <li>
            <strong>Check Data Types:</strong> Ensure your spreadsheet data types
            match what&apos;s expected in your database, especially for UUIDs and
            dates.
          </li>
          <li>
            <strong>Test First:</strong> Always test your generated SQL on a small
            dataset or test database before running it on production data.
          </li>
          <li>
            <strong>Backup:</strong> Create a database backup before executing
            large update operations from spreadsheet data.
          </li>
          <li>
            <strong>Format Consistency:</strong> When working with Google
            Spreadsheets or Excel, ensure consistent formatting before copying
            data.
          </li>
        </ul>

        <h3>Type Casting</h3>
        <p>
          When using SCRIPT output formats, you can apply PostgreSQL type
          casting to each column. Without casting, all values are inserted as
          text strings. Casting tells PostgreSQL to interpret and validate
          values as the correct type, catching errors early and ensuring data
          integrity. Common castings include:
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

        <h3>Security Considerations</h3>
        <p>
          This tool processes all spreadsheet data locally in your browser.
          Whether your data comes from CSV files, Google Spreadsheets, or Excel,
          it never leaves your device, ensuring complete privacy and security.
          However, always be cautious when executing generated SQL on sensitive
          databases and verify the SQL before execution.
        </p>
      </ToolExplanation>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolJsonLd(title, url, description)),
        }}
      />
    </>
  );
}
