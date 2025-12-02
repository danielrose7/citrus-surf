/**
 * Shared SQL type casting datalist options for PostgreSQL
 * Used in both Spreadsheet to SQL and JSON to SQL tools
 */

export function SqlTypeCastingOptions({ id }: { id: string }) {
  return (
    <datalist id={id}>
      <option value=""></option>
      <option value="::bigint"></option>
      <option value="::integer"></option>
      <option value="::numeric"></option>
      <option value="::text"></option>
      <option value="::uuid"></option>
      <option value="::boolean"></option>
      <option value="::timestamp"></option>
      <option value="::timestamptz"></option>
      <option value="::date"></option>
      <option value="::jsonb"></option>
      <option value="::json"></option>
    </datalist>
  );
}
