import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/markdown-renderer";

type Props = {
  params: Promise<{ project: string; ticket: string }>;
};

function getProjectTickets(project: string): Record<string, { filename: string; title: string }> {
  const ticketsPath = path.join(process.cwd(), "prd", project, "tickets");
  
  try {
    const files = fs.readdirSync(ticketsPath);
    const tickets: Record<string, { filename: string; title: string }> = {};
    
    for (const file of files) {
      if (file.endsWith(".md")) {
        // Convert filename to slug (e.g., "VS-001-core-types.md" -> "vs-001")
        const slug = file
          .replace(/\.md$/, "")
          .toLowerCase()
          .replace(/^([a-z]+-\d+).*/, "$1");
        
        // Extract title from filename
        const titleMatch = file.match(/^([A-Z]+-\d+)(?:-(.+))?\.md$/);
        const ticketId = titleMatch?.[1] || file.replace(/\.md$/, "");
        const description = titleMatch?.[2]
          ?.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ') || "Implementation Ticket";
        
        const title = `${ticketId}: ${description}`;
        
        tickets[slug] = {
          filename: file,
          title,
        };
      }
    }
    
    return tickets;
  } catch {
    return {};
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project, ticket } = await params;
  const projectTickets = getProjectTickets(project);
  const ticketInfo = projectTickets[ticket];
  
  const projectName = project
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const title = ticketInfo?.title || "Ticket Not Found";

  return {
    title: `${title} - ${projectName} - Citrus Surf`,
    description: `Implementation ticket: ${title}`,
  };
}

function readMarkdownFile(filePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), "prd", filePath);
    return fs.readFileSync(fullPath, "utf8");
  } catch {
    return "";
  }
}

export default async function TicketPage({ params }: Props) {
  const { project, ticket } = await params;
  const projectTickets = getProjectTickets(project);
  const ticketInfo = projectTickets[ticket];

  if (!ticketInfo) {
    notFound();
  }

  const content = readMarkdownFile(`${project}/tickets/${ticketInfo.filename}`);

  if (!content) {
    notFound();
  }

  return <MarkdownRenderer content={content} />;
}

export async function generateStaticParams() {
  const prdPath = path.join(process.cwd(), "prd");
  const staticParams: { project: string; ticket: string }[] = [];
  
  try {
    const projects = fs.readdirSync(prdPath, { withFileTypes: true });
    
    for (const projectDir of projects) {
      if (projectDir.isDirectory()) {
        const projectTickets = getProjectTickets(projectDir.name);
        
        for (const ticket of Object.keys(projectTickets)) {
          staticParams.push({
            project: projectDir.name,
            ticket,
          });
        }
      }
    }
  } catch {
    // Return empty array if we can't read the directory
  }
  
  return staticParams;
}