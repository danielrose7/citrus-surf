---
id: BLOG-002
title: ULID Background
status: todo
effort: S
---

# BLOG-002: ULID Background

## Context

ULIDs are less well-known than UUIDs but have interesting properties. A short explainer would complement the UUID comparison post and highlight that the ID Generator supports all three formats.

## Rough Outline

- What a ULID is (timestamp + randomness, Crockford base32)
- How it compares to UUID v7 (similar goals, different encoding)
- Lexicographic sortability — why that matters
- Monotonic ordering within the same millisecond
- Tradeoffs vs UUID (less ecosystem support, string format differences)
- Link to the [ID Generator](/tools/id-generator)

## Estimated Effort

**Small** (1-2 hours to draft)
