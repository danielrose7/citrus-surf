import fs from "fs";
import path from "path";
import matter from "gray-matter";

const prdDirectory = path.join(process.cwd(), "prd");

export type TicketStatus = "todo" | "in-progress" | "done";
export type TicketEffort = "S" | "M" | "L" | "XL";

export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  effort: TicketEffort;
  phase?: number;
  project: string;
  slug: string;
}

const PROJECT_DISPLAY_NAMES: Record<string, string> = {
  "lookup-fields": "Lookup Fields",
  "validation-system": "Validation System",
  "blog-content": "Blog Content",
};

function getProjectDirs(): string[] {
  return fs
    .readdirSync(prdDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

export function getAllTickets(): Ticket[] {
  const tickets: Ticket[] = [];

  for (const projectDir of getProjectDirs()) {
    const ticketsDir = path.join(prdDirectory, projectDir, "tickets");
    if (!fs.existsSync(ticketsDir)) continue;

    const files = fs
      .readdirSync(ticketsDir)
      .filter(file => file.endsWith(".md"));

    for (const file of files) {
      const fullPath = path.join(ticketsDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      if (!data.id || !data.title || !data.status) continue;

      tickets.push({
        id: data.id,
        title: data.title,
        status: data.status as TicketStatus,
        effort: data.effort as TicketEffort,
        phase: data.phase ?? undefined,
        project: PROJECT_DISPLAY_NAMES[projectDir] || projectDir,
        slug: file.replace(/\.md$/, ""),
      });
    }
  }

  return tickets.sort((a, b) => a.id.localeCompare(b.id));
}

export function getTicketsByStatus(): Record<TicketStatus, Ticket[]> {
  const tickets = getAllTickets();
  return {
    todo: tickets.filter(t => t.status === "todo"),
    "in-progress": tickets.filter(t => t.status === "in-progress"),
    done: tickets.filter(t => t.status === "done"),
  };
}

export function getProjects(): string[] {
  return getProjectDirs()
    .map(dir => PROJECT_DISPLAY_NAMES[dir] || dir)
    .sort();
}
