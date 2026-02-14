"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Ticket, TicketStatus } from "@/lib/utils/tickets";

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; color: string; countColor: string }
> = {
  todo: {
    label: "Todo",
    color: "text-muted-foreground",
    countColor: "bg-muted text-muted-foreground",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-blue-600 dark:text-blue-400",
    countColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  done: {
    label: "Done",
    color: "text-green-600 dark:text-green-400",
    countColor:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
};

const EFFORT_COLORS: Record<string, string> = {
  S: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  M: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  L: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  XL: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800",
};

const COLUMNS: TicketStatus[] = ["todo", "in-progress", "done"];

function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <code className="text-xs text-muted-foreground">{ticket.id}</code>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${EFFORT_COLORS[ticket.effort] || ""}`}
          >
            {ticket.effort}
          </Badge>
        </div>
        <p className="text-sm font-medium leading-snug">{ticket.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {ticket.project}
          {ticket.phase != null && ` · Phase ${ticket.phase}`}
        </p>
      </CardContent>
    </Card>
  );
}

function Column({
  status,
  tickets,
}: {
  status: TicketStatus;
  tickets: Ticket[];
}) {
  const config = STATUS_CONFIG[status];
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <h2 className={`text-sm font-semibold ${config.color}`}>
          {config.label}
        </h2>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.countColor}`}
        >
          {tickets.length}
        </span>
      </div>
      <div className="space-y-0">
        {tickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
        {tickets.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4 text-center">
            No tickets
          </p>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({
  tickets,
  projects,
}: {
  tickets: Ticket[];
  projects: string[];
}) {
  const [activeProject, setActiveProject] = useState("all");

  const filtered =
    activeProject === "all"
      ? tickets
      : tickets.filter(t => t.project === activeProject);

  const grouped = Object.fromEntries(
    COLUMNS.map(status => [status, filtered.filter(t => t.status === status)])
  ) as Record<TicketStatus, Ticket[]>;

  return (
    <div>
      <Tabs
        value={activeProject}
        onValueChange={setActiveProject}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {projects.map(project => (
            <TabsTrigger key={project} value={project}>
              {project}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(status => (
          <Column key={status} status={status} tickets={grouped[status]} />
        ))}
      </div>
    </div>
  );
}
