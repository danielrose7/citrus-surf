import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { ToolExplanation } from "@/components/tool-explanation";
import { SITE_URL, toolJsonLd } from "@/lib/constants/site";
import { JsonToCsvTool } from "./json-to-csv-tool";

const title = "JSON to CSV Converter Online";
const description =
  "Convert JSON arrays to CSV format with nested object flattening. Supports custom delimiters and proper field escaping. Free, private, runs in your browser.";
const url = `${SITE_URL}/tools/json-to-csv`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "JSON to CSV",
    "JSON converter",
    "CSV converter",
    "data export",
    "JSON flattener",
  ],
  alternates: { canonical: url },
  openGraph: { title, description, url },
};

export default function JsonToCsvPage() {
  return (
    <>
      <NavBar />
      <JsonToCsvTool />
      <ToolExplanation
        title="About JSON to CSV Converter"
        description="Transform complex JSON data into structured CSV format"
      >
        <h3>What is JSON to CSV Conversion?</h3>
        <p>
          JSON to CSV conversion is the process of transforming data from
          JavaScript Object Notation (JSON) format, which is hierarchical and
          flexible, into Comma-Separated Values (CSV) format, which is tabular and
          flat. This conversion makes JSON data accessible for spreadsheet
          applications, data analysis tools, and legacy systems that work with CSV
          files.
        </p>

        <h3>Why Convert JSON to CSV?</h3>
        <ul>
          <li>
            <strong>Spreadsheet Compatibility:</strong> CSV files can be easily
            opened and edited in Excel, Google Sheets, and other spreadsheet
            applications.
          </li>
          <li>
            <strong>Data Analysis:</strong> Many data analysis tools work better
            with tabular data formats like CSV.
          </li>
          <li>
            <strong>Legacy System Integration:</strong> Older systems often
            require CSV format for data imports.
          </li>
          <li>
            <strong>Simplified Viewing:</strong> CSV provides a simpler, tabular
            view of data that can be easier to scan and understand.
          </li>
          <li>
            <strong>Size Reduction:</strong> CSV files are often smaller than
            equivalent JSON files, making them more efficient for storage and
            transfer.
          </li>
        </ul>

        <h3>Challenges in JSON to CSV Conversion</h3>
        <p>
          Converting JSON to CSV presents several challenges due to the
          fundamental differences between these formats:
        </p>
        <ul>
          <li>
            <strong>Nested Structures:</strong> JSON supports deeply nested
            objects and arrays, while CSV is flat and tabular.
          </li>
          <li>
            <strong>Data Types:</strong> JSON supports various data types
            (strings, numbers, booleans, null, objects, arrays), while CSV treats
            everything as text.
          </li>
          <li>
            <strong>Schema Variability:</strong> Objects in a JSON array might
            have different properties, making it difficult to determine CSV
            headers.
          </li>
          <li>
            <strong>Special Characters:</strong> CSV has special handling
            requirements for fields containing delimiters, quotes, or newlines.
          </li>
        </ul>

        <h3>How Our JSON to CSV Converter Works</h3>
        <p>Our converter addresses these challenges with several key features:</p>
        <ul>
          <li>
            <strong>Nested Object Flattening:</strong> Converts nested objects
            into flattened properties using dot notation (e.g.,{" "}
            <code>user.address.city</code>).
          </li>
          <li>
            <strong>Comprehensive Header Detection:</strong> Scans all objects to
            identify all possible properties for column headers.
          </li>
          <li>
            <strong>Proper Escaping:</strong> Automatically handles special
            characters by properly escaping and quoting fields as needed.
          </li>
          <li>
            <strong>Multiple Delimiter Options:</strong> Supports comma, tab, and
            semicolon delimiters to accommodate different needs.
          </li>
          <li>
            <strong>Array Handling:</strong> Converts JSON arrays into CSV rows,
            with each object becoming a row in the output.
          </li>
        </ul>

        <h3>Common Use Cases</h3>
        <h4>API Response Processing</h4>
        <p>
          Many APIs return data in JSON format. Converting this data to CSV makes
          it accessible for analysis in spreadsheet applications or for import
          into databases that prefer tabular formats.
        </p>

        <h4>Data Export for Non-Technical Users</h4>
        <p>
          Technical teams often work with JSON, but business users typically
          prefer Excel or Google Sheets. Converting JSON to CSV bridges this gap,
          making data accessible to non-technical stakeholders.
        </p>

        <h4>Data Migration</h4>
        <p>
          When migrating data between systems, converting from JSON to CSV can be
          an essential intermediate step, especially when the target system
          requires CSV imports.
        </p>

        <h3>Tips for Effective JSON to CSV Conversion</h3>
        <ul>
          <li>
            <strong>Check Your JSON Structure:</strong> Understand the structure
            of your JSON data before conversion to anticipate how nested objects
            will be flattened.
          </li>
          <li>
            <strong>Consider Column Headers:</strong> Enable the &quot;Include column
            headers&quot; option to make your CSV more readable and self-documenting.
          </li>
          <li>
            <strong>Handle Nested Objects:</strong> Use the &quot;Flatten nested
            objects&quot; option to convert nested structures into a flat format with
            dot notation.
          </li>
          <li>
            <strong>Choose the Right Delimiter:</strong> Select a delimiter that
            doesn&apos;t appear in your data to avoid parsing issues.
          </li>
          <li>
            <strong>Validate the Output:</strong> Always check the converted CSV
            to ensure it contains all the expected data in the correct format.
          </li>
        </ul>
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
