---
id: BLOG-004
title: Slugify Modes and Strategies
status: todo
effort: M
---

# BLOG-004: Slugify Modes and Strategies

## Context

The slugify tool currently has a single mode. Planning to add new strategies/modes (strict, loose, transliteration, custom separator, etc.). This post would ship alongside the feature update.

## Rough Outline

- What slugification is and why it matters (URLs, filenames, IDs)
- Different strategies: strict (ASCII only), loose (more permissive), transliteration (accented chars)
- Custom separators (hyphens vs underscores vs dots)
- Edge cases: emoji, CJK characters, mixed scripts
- Demo the new modes in the [Slugify tool](/tools/slugify)

## Dependencies

- Ship new slugify modes/strategies first, then write the post

## Estimated Effort

**Medium** (feature work + post)
