---
id: BLOG-001
title: UUID v4 vs v7 Comparison
status: todo
effort: S
---

# BLOG-001: UUID v4 vs v7 Comparison

## Context

The ID Generator tool supports UUID v4, UUID v7, and ULID. A comparison post explaining when to use v4 vs v7 would drive traffic to the tool and be genuinely useful.

## Rough Outline

- What UUID v4 is (random) vs v7 (timestamp-sortable)
- When sorting/indexing matters (database primary keys, event logs)
- Performance implications for B-tree indexes
- When v4 is still the right choice (privacy, no ordering needed)
- Link to the [ID Generator](/tools/id-generator) to try both

## Estimated Effort

**Small** (1-2 hours to draft)
