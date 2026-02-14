# Copilot Instructions for Citrus Surf

This guide enables AI coding agents to be immediately productive in the Citrus Surf codebase. It summarizes architecture, workflows, conventions, and integration points unique to this project.

## Big Picture Architecture
- **Workflow-first CSV importer and data prep tool** for client-side use (no backend persistence).
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind, shadcn/ui, TanStack Table.
- **State Management:** Redux Toolkit (feature-based slices), Redux Saga, with persistence via SuperJSON and debounced localStorage.
- **Feature-based organization:** Related logic grouped in `lib/features/`, `lib/utils/`, `lib/types/`, `components/`, and `hooks/`.
- **Layered architecture:** UI, state, processing engines, and utilities are clearly separated. See `docs/patterns/lookup-architecture-patterns.md` for advanced patterns.

## Critical Developer Workflows
- **Development:**
  - Start dev server: `pnpm dev` (Turbopack)
  - Build: `pnpm build`
  - Lint: `pnpm lint`
  - Format: `pnpm format`
  - Typecheck: `pnpm typecheck`
- **Testing:**
  - Run all tests: `pnpm test`
  - Watch mode: `pnpm test:watch`
  - Vitest UI: `pnpm test:ui`
  - Test setup: see `test/README.md` and `test/setup.ts`
- **Debugging:**
  - Use floating error logger for one-click error copying (see `docs/recent-improvements.md`).
  - Browser console exposes `debugStorage` for localStorage and target shapes debugging (`lib/utils/debug-storage.ts`).

## Project-Specific Conventions
- **TypeScript everywhere.** Strict mode enabled (`tsconfig.json`).
- **Functional React components with hooks.**
- **Use shadcn/ui and Radix UI for new components.**
- **Responsive design is required.**
- **All data transformations must go through the target shapes system.** See `docs/target-shapes.md` and `claude-rules.md`.
- **Tests and documentation must evolve with code.** Never ship code without corresponding test and doc updates.
- **Never create new files unless necessary.** Prefer editing existing files and patterns.

## Integration Points & Patterns
- **Import/Export:** End-to-end workflows in `docs/import-system.md` and `docs/export-system.md`.
- **Editable Cells:** Inline editing patterns in `docs/editable-cells.md`.
- **Lookup Fields:** Advanced matching and fuzzy search in `docs/patterns/lookup-architecture-patterns.md`.
- **History System:** Time-travel and undo/redo in `docs/history-system.md`.
- **Redux Persistence:** See `docs/redux-persistence.md` and `lib/features/`.

## Key References
- `CONTEXT.md` — Product vision, architecture, and sprint goals
- `docs/` — System documentation and patterns
- `claude-rules.md` — Rules for target shapes and testing
- `test/README.md` — Testing setup and patterns
- `docs/patterns/README.md` — Architecture and development recipes

## Example: Adding a New Feature
1. Read `CONTEXT.md` and relevant docs in `docs/`.
2. Follow feature-based organization in `lib/` and `components/`.
3. Write tests in parallel with implementation.
4. Update documentation as you go.
5. Use existing patterns and avoid unnecessary new files.

---
For more details, see referenced documentation files. If any section is unclear or incomplete, please provide feedback for improvement.
