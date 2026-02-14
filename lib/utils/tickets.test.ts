import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Ticket } from "./tickets";

const ticketFiles: Record<string, Record<string, string>> = {
  "lookup-fields": {
    "LOOKUP-001-core-types.md": [
      "---",
      "id: LOOKUP-001",
      "title: Core Type Definitions",
      "status: done",
      "effort: S",
      "phase: 1",
      "---",
      "# LOOKUP-001: Core Type Definitions",
    ].join("\n"),
    "LOOKUP-008-reference-data-viewer.md": [
      "---",
      "id: LOOKUP-008",
      "title: Reference Data Viewer & Editor",
      "status: todo",
      "effort: L",
      "phase: 3",
      "---",
      "# LOOKUP-008: Reference Data Viewer",
    ].join("\n"),
  },
  "validation-system": {
    "VS-001-core-types.md": [
      "---",
      "id: VS-001",
      "title: Core Validation Types",
      "status: done",
      "effort: M",
      "phase: 1",
      "---",
      "# VS-001: Core Validation Types",
    ].join("\n"),
    "VS-009-inline-resolution.md": [
      "---",
      "id: VS-009",
      "title: Inline Error Resolution",
      "status: in-progress",
      "effort: M",
      "phase: 3",
      "---",
      "# VS-009: Inline Error Resolution",
    ].join("\n"),
    "addendum.md": ["# Not a ticket", "Just notes"].join("\n"),
  },
  "blog-content": {
    "BLOG-001-uuid-comparison.md": [
      "---",
      "id: BLOG-001",
      "title: UUID v4 vs v7 Comparison",
      "status: todo",
      "effort: S",
      "---",
      "# BLOG-001: UUID Comparison",
    ].join("\n"),
  },
};

vi.mock("fs", () => ({
  default: {
    readdirSync: (dir: string, opts?: { withFileTypes: boolean }) => {
      if (dir.endsWith("prd")) {
        const dirs = Object.keys(ticketFiles);
        if (opts?.withFileTypes) {
          return dirs.map(name => ({ name, isDirectory: () => true }));
        }
        return dirs;
      }
      // tickets subdirectory
      for (const proj of Object.keys(ticketFiles)) {
        if (dir.includes(proj)) {
          return Object.keys(ticketFiles[proj]);
        }
      }
      return [];
    },
    existsSync: (p: string) => {
      for (const proj of Object.keys(ticketFiles)) {
        if (p.includes(proj) && p.endsWith("tickets")) return true;
      }
      return false;
    },
    readFileSync: (p: string) => {
      for (const proj of Object.keys(ticketFiles)) {
        for (const [file, content] of Object.entries(ticketFiles[proj])) {
          if (p.endsWith(file)) return content;
        }
      }
      return "";
    },
  },
}));

vi.mock("path", () => ({
  default: {
    join: (...parts: string[]) => parts.join("/"),
  },
}));

describe("ticket utilities", () => {
  let tickets: typeof import("./tickets");

  beforeEach(async () => {
    vi.resetModules();
    tickets = await import("./tickets");
  });

  describe("getAllTickets", () => {
    it("returns all tickets with valid frontmatter", () => {
      const all = tickets.getAllTickets();
      expect(all).toHaveLength(5);
    });

    it("skips files without valid frontmatter", () => {
      const all = tickets.getAllTickets();
      const ids = all.map((t: Ticket) => t.id);
      expect(ids).not.toContain("addendum");
    });

    it("sorts tickets by ID", () => {
      const all = tickets.getAllTickets();
      const ids = all.map((t: Ticket) => t.id);
      expect(ids).toEqual([
        "BLOG-001",
        "LOOKUP-001",
        "LOOKUP-008",
        "VS-001",
        "VS-009",
      ]);
    });

    it("derives project name from directory", () => {
      const all = tickets.getAllTickets();
      const blog = all.find((t: Ticket) => t.id === "BLOG-001");
      expect(blog?.project).toBe("Blog Content");
      const lookup = all.find((t: Ticket) => t.id === "LOOKUP-001");
      expect(lookup?.project).toBe("Lookup Fields");
      const vs = all.find((t: Ticket) => t.id === "VS-001");
      expect(vs?.project).toBe("Validation System");
    });

    it("parses all required fields correctly", () => {
      const all = tickets.getAllTickets();
      const t = all.find((t: Ticket) => t.id === "LOOKUP-001");
      expect(t).toEqual({
        id: "LOOKUP-001",
        title: "Core Type Definitions",
        status: "done",
        effort: "S",
        phase: 1,
        project: "Lookup Fields",
        slug: "LOOKUP-001-core-types",
      });
    });

    it("handles tickets without phase", () => {
      const all = tickets.getAllTickets();
      const blog = all.find((t: Ticket) => t.id === "BLOG-001");
      expect(blog?.phase).toBeUndefined();
    });
  });

  describe("getTicketsByStatus", () => {
    it("groups tickets into status buckets", () => {
      const grouped = tickets.getTicketsByStatus();
      expect(grouped.todo).toHaveLength(2);
      expect(grouped["in-progress"]).toHaveLength(1);
      expect(grouped.done).toHaveLength(2);
    });

    it("puts correct tickets in each bucket", () => {
      const grouped = tickets.getTicketsByStatus();
      expect(grouped.done.map((t: Ticket) => t.id)).toContain("LOOKUP-001");
      expect(grouped.todo.map((t: Ticket) => t.id)).toContain("LOOKUP-008");
      expect(grouped["in-progress"].map((t: Ticket) => t.id)).toContain(
        "VS-009"
      );
    });
  });

  describe("getProjects", () => {
    it("returns sorted project display names", () => {
      const projects = tickets.getProjects();
      expect(projects).toEqual([
        "Blog Content",
        "Lookup Fields",
        "Validation System",
      ]);
    });
  });
});
