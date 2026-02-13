import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { ToolExplanation } from "@/components/tool-explanation";
import { SITE_URL, toolJsonLd } from "@/lib/constants/site";
import { CsvToJsonTool } from "./csv-to-json-tool";

const title = "CSV to JSON Converter Online";
const description =
  "Convert CSV to JSON instantly. Supports custom delimiters, header detection, and automatic type parsing. Free browser-based tool — your data never leaves your device.";
const url = `${SITE_URL}/tools/csv-to-json`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "CSV to JSON",
    "CSV converter",
    "JSON converter",
    "data transformation",
    "CSV parser",
  ],
  alternates: { canonical: url },
  openGraph: { title, description, url },
};

export default function CsvToJsonPage() {
  return (
    <>
      <NavBar />
      <CsvToJsonTool />
      <ToolExplanation
        title="About CSV to JSON Converter"
        description="Transform tabular data into structured JSON for modern applications"
      >
        <h3>What is CSV to JSON Conversion?</h3>
        <p>
          CSV to JSON conversion transforms tabular data from Comma-Separated
          Values (CSV) format into JavaScript Object Notation (JSON), a
          lightweight data interchange format. This process converts rows and
          columns into a structured, hierarchical format that&apos;s ideal for web
          applications, APIs, and modern data processing systems.
        </p>

        <h3>Why Convert CSV to JSON?</h3>
        <ul>
          <li>
            <strong>API Integration:</strong> Most modern APIs expect and return
            JSON data, making it the standard for data exchange on the web.
          </li>
          <li>
            <strong>JavaScript Compatibility:</strong> JSON is native to
            JavaScript, making it perfect for web applications and Node.js
            backends.
          </li>
          <li>
            <strong>Rich Data Structures:</strong> JSON supports complex, nested
            data structures that can better represent relationships than flat CSV
            files.
          </li>
          <li>
            <strong>Data Types:</strong> JSON preserves data types (numbers,
            booleans, strings) that would be lost in CSV format.
          </li>
          <li>
            <strong>Human Readability:</strong> With proper formatting, JSON is
            more readable and self-describing than CSV.
          </li>
        </ul>

        <h3>How Our CSV to JSON Converter Works</h3>
        <p>
          Our converter provides a powerful yet simple way to transform CSV data
          into JSON:
        </p>
        <ul>
          <li>
            <strong>Header Row Processing:</strong> Uses the first row as object
            keys when the option is enabled, creating meaningful property names.
          </li>
          <li>
            <strong>Data Type Detection:</strong> Automatically detects and
            converts numbers, booleans, and null values to their proper JSON
            types.
          </li>
          <li>
            <strong>Multiple Delimiter Support:</strong> Handles comma, tab, and
            semicolon delimiters to accommodate various CSV formats.
          </li>
          <li>
            <strong>Quoted Field Handling:</strong> Properly processes quoted
            fields that may contain delimiters or special characters.
          </li>
          <li>
            <strong>Pretty Printing:</strong> Formats the JSON output with proper
            indentation for readability when the option is enabled.
          </li>
        </ul>

        <h3>Common Use Cases</h3>
        <h4>Data Import for Web Applications</h4>
        <p>
          When building web applications, you often need to import data that
          exists in CSV format (like exported reports or spreadsheets). Converting
          this data to JSON makes it immediately usable in JavaScript
          applications.
        </p>

        <h4>API Development</h4>
        <p>
          When developing APIs that need to consume data that exists in CSV
          format, converting to JSON is often a necessary preprocessing step to
          make the data compatible with your API structure.
        </p>

        <h4>Data Transformation Pipelines</h4>
        <p>
          In data processing workflows, CSV to JSON conversion is often an early
          step in transforming legacy or exported data into formats suitable for
          modern data processing systems.
        </p>

        <h4>Configuration Management</h4>
        <p>
          Converting spreadsheet-based configurations to JSON format allows them
          to be easily consumed by applications that expect configuration in JSON
          format.
        </p>

        <h3>Tips for Effective CSV to JSON Conversion</h3>
        <ul>
          <li>
            <strong>Use Headers:</strong> Enable the &quot;First row as headers&quot; option
            to create meaningful property names in your JSON objects.
          </li>
          <li>
            <strong>Choose the Right Delimiter:</strong> Make sure to select the
            delimiter that matches your CSV data format (comma, tab, or
            semicolon).
          </li>
          <li>
            <strong>Check for Special Characters:</strong> If your CSV contains
            quotes, commas, or other special characters within fields, ensure
            they&apos;re properly quoted in the input.
          </li>
          <li>
            <strong>Validate the Output:</strong> Always verify that the generated
            JSON correctly represents your data and has the expected structure.
          </li>
          <li>
            <strong>Consider Data Types:</strong> Our converter attempts to detect
            numbers and booleans, but you may need to manually adjust some values
            after conversion.
          </li>
        </ul>

        <h3>Working with the Generated JSON</h3>
        <p>After converting your CSV to JSON, you can:</p>
        <ul>
          <li>
            <strong>Use it in Web Applications:</strong> The JSON can be directly
            loaded into JavaScript applications using
            <code>fetch()</code> or imported as a module.
          </li>
          <li>
            <strong>Store in NoSQL Databases:</strong> JSON is the native format
            for document databases like MongoDB or CouchDB.
          </li>
          <li>
            <strong>Process with Node.js:</strong> Use JavaScript/Node.js to
            further transform or analyze the data.
          </li>
          <li>
            <strong>Send to APIs:</strong> Use the JSON as the body of API
            requests when integrating with other systems.
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
