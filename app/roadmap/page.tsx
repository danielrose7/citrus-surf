import type { Metadata } from "next";
import { getAllTickets, getProjects } from "@/lib/utils/tickets";
import { KanbanBoard } from "./kanban-board";

export const metadata: Metadata = {
  title: "Roadmap | Citrus Surf",
  description: "Project roadmap and ticket status for Citrus Surf",
};

export default function RoadmapPage() {
  const tickets = getAllTickets();
  const projects = getProjects();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Roadmap</h1>
      <KanbanBoard tickets={tickets} projects={projects} />
    </div>
  );
}
