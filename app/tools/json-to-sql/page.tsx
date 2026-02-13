import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { ToolExplanation } from "@/components/tool-explanation";
import { SITE_URL, toolJsonLd } from "@/lib/constants/site";
import { JsonToSqlTool } from "./json-to-sql-tool";

const title = "JSON to SQL Converter — INSERT, UPDATE & UPSERT";
const description =
  "Convert JSON to SQL INSERT, UPDATE, or UPSERT statements. Generate PostgreSQL scripts with type casting and JSONB support. Free online tool.";
const url = `${SITE_URL}/tools/json-to-sql`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "JSON to SQL",
    "SQL generator",
    "INSERT statement generator",
    "UPDATE statement generator",
    "UPSERT generator",
    "PostgreSQL",
  ],
  alternates: { canonical: url },
  openGraph: { title, description, url },
};

export default function JsonToSqlPage() {
  return (
    <>
      <NavBar />
      <JsonToSqlTool />
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
            <strong>Testing &amp; Development:</strong> Create SQL statements from
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
          <li>Click &quot;Convert to SQL&quot; to generate the SQL statements</li>
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

        <h3>Security &amp; Privacy</h3>
        <p>
          All JSON processing happens locally in your browser. Your data never
          leaves your device, ensuring complete privacy and security. However,
          always verify generated SQL before executing it on sensitive databases.
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
