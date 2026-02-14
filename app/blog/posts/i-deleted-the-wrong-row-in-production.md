---
title: Deleted the Wrong Row in Production. It was fine!
date: "2026-02-13"
description: A careful DELETE turned into an incident. Time travel and a JSON-to-SQL converter got me out of it quickly. Didn't leave the browser.
tags: [json-to-sql, frontlines]
author: Daniel Rose w/ Claude
---

I had an [inngest workflow](https://www.inngest.com/uses/durable-workflows) fail midway through yesterday. It's a neat one that 1) takes a raw email, 2) extracts its contents and 3) converts it into a sales order in the [Plantiful](https://tryplantiful.com) system I work on. In short, it got hung up due to a bug and some bad data. I fixed the bad data and opened a PR to resolve the bug for the future. I thought I'd be able to restart the workflow from the top and be fine. Unfortunately, though, it hit a unique constraint — the first attempt had left a partial artifact behind.

The textbook fix would have been to refactor the code to find the previous attempt's result rather than create a new row (upsert). This was a one-off though. I just needed to remove the bad row and retry and wanted a quick fix rather than waiting on a PR process + re-deploy.

I carefully wrote a `DELETE FROM` against the table and its children. Double-checked the ID and my syntax. Took a breath. Said some Hail Marys. Hit enter.

Restarted workflow. Didn't work.

I had deleted the wrong ID. 😱. Made a hole in the production database. Impacted a different user entirely.

But thankfully we live in the future. This project uses [Neon](https://neon.com) for Postgres, and Neon has [Time Travel Assist](https://neon.com/docs/guides/time-travel-assist). You can query your database at any point in its recent history.

I toggled to time travel mode, set the timestamp to just before my mistake, and ran:

```sql
SELECT * FROM the_table WHERE id = 'the-id-i-shouldnt-have-deleted';
```

There it was. The row. I was able to do a very similar query to get its children. All of it. Exactly as it existed before I touched it.

Now I needed to turn that data back into INSERT statements. I copied the results to JSON, pasted them into the [JSON to SQL Converter](/tools/json-to-sql), picked "script" mode, added the table name, and added a number of type casts.

Then I had my INSERT statements. Ran them. Data restored.

No downloading backup files from a remote server. No log grepping. Just a couple of UIs, time travel, and data restoration.

For all the doom and gloom about the state of things, this felt like the future in the good way.

Definitely check out our [json to sql tool](/tools/json-to-sql) if you aren't familiar with it.

I wrote the tool to help myself out as getting data from coworkers and users into the database should be an easy well paved path.
