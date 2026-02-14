---
id: BLOG-003
title: "Loop Scripts — Upserts vs Inserts"
status: todo
effort: S
---

# BLOG-003: Loop Scripts — Upserts vs Inserts

## Context

The SQL tools support INSERT, UPDATE, and UPSERT script generation. A post explaining when to use each — especially how ON CONFLICT works with composite keys — would be practical for the target audience.

## Rough Outline

- The three script types and when you'd pick each
- INSERT: clean slate, new data
- UPDATE: modifying existing rows, the WHERE clause
- UPSERT: idempotent writes, ON CONFLICT with single and composite keys
- How the DO block loop pattern works and why it's useful
- The "HEY HUMAN!!" reminder on UPDATE scripts
- Link to both SQL tools

## Estimated Effort

**Small** (1-2 hours to draft)
