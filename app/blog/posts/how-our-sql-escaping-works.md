---
title: How Our SQL Escaping Works
date: "2026-02-14"
description: A look at how our SQL tools escape strings, handle JSONB, and generate scripts you can paste into a terminal.
tags: [json-to-sql, spreadsheet-to-sql, deep-dive]
author: Daniel Rose w/ Claude
---

The [JSON to SQL Converter](/tools/json-to-sql) and [Spreadsheet to SQL Converter](/tools/spreadsheet-to-sql-values) both turn your data into SQL you can paste straight into a database client. They share the same escaping engine under the hood. The escaping has to be right or you'll get syntax errors — or worse, broken data.

Before these tools existed I did all of this by hand. I had a set of quick keys committed to muscle memory for navigating a spreadsheet — jump to end of column, select down, wrap each cell in quotes, add commas. Do that across 100 rows a few times a week and it stops being a minor annoyance and starts being a real time sink. And one missed apostrophe in row 73 means your whole INSERT blows up.

Here's how the escaping works under the hood.

## String escaping

SQL strings are wrapped in single quotes. So the main job is handling single quotes *inside* your data. The standard SQL escape is to double them:

```
it's  →  it''s
```

That's it. The function is one line:

```ts
value.replace(/'/g, "''")
```

Then the escaped string gets wrapped in single quotes to produce `'it''s'`.

I tend to use Postgres, but doubling single quotes is standard SQL and works across MySQL, SQLite, SQL Server, and pretty much anything that accepts SQL.

## Null handling

Missing values become `NULL` — no quotes, no empty string. If a JSON field is `null` or `undefined`, or a spreadsheet cell is empty, the output is just `NULL`.

## The JSONB builder

This is where it gets interesting. If you have a JSON column in Postgres, you *could* just stringify the object and insert it as a string literal:

```sql
'{"city":"Portland","state":"OR"}'::jsonb
```

That works, but it gets messy fast with nested objects, escaped quotes inside escaped quotes, etc. Instead, the tool generates PostgreSQL builder expressions:

```sql
jsonb_build_object('city', 'Portland', 'state', 'OR')
```

The builder approach handles nesting naturally. An object with a nested address:

```json
{ "address": { "city": "Portland", "zip": "97201" } }
```

becomes:

```sql
jsonb_build_object('address', jsonb_build_object('city', 'Portland', 'zip', '97201'))
```

Arrays work too:

```json
{ "tags": ["a", "b"] }
```

becomes:

```sql
jsonb_build_object('tags', jsonb_build_array('a', 'b'))
```

The builder handles all the type distinctions Postgres cares about — strings get quoted, numbers and booleans don't, nulls become `NULL`:

```sql
jsonb_build_array(1, 'two', true, NULL)
```

Quote escaping carries through into the builder too. If your keys or values contain single quotes:

```json
{ "it's": "that's" }
```

becomes:

```sql
jsonb_build_object('it''s', 'that''s')
```

## When does it use the builder?

The JSONB builder is only available in **Script** mode (not VALUES). You'll need to pick "Script" as the output format, then set the column's type casting to `::jsonb` or `::json`. In VALUES mode, objects just get stringified — which works, but you lose the benefits of the builder for nested structures. For all other castings (or no casting), values get the simpler string treatment.

It's also smart enough to handle JSON that arrives as a string rather than an object. If a field's value is `"{\"city\": \"Portland\"}"` and the column is cast to `::jsonb`, the tool will parse it and produce the builder expression rather than a double-escaped string literal.

## The generated scripts

The tool generates PostgreSQL `DO` blocks that loop over your data. Here's a simplified example of what an INSERT script looks like:

```sql
DO $$
DECLARE
    row_data RECORD;
BEGIN
    FOR row_data IN
        SELECT * FROM (VALUES
            ('1', 'Alice'),
            ('2', 'Bob')
        ) AS row_data(id, name)
    LOOP
        INSERT INTO users (id, name)
        VALUES (row_data.id::bigint, row_data.name);
    END LOOP;
END $$;
```

Type castings (like `::bigint` above) are applied at the point of use in the loop body, not in the VALUES block. This means the VALUES block stays simple strings while the INSERT statement handles the type conversion.

The same pattern works for UPDATE (with a WHERE clause) and UPSERT (with ON CONFLICT).

## Try it

Paste some JSON into the [JSON to SQL Converter](/tools/json-to-sql) or copy some rows from a spreadsheet into the [Spreadsheet to SQL Converter](/tools/spreadsheet-to-sql-values) and see what comes out. Everything runs in your browser — nothing gets sent anywhere.
