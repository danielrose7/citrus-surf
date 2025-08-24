import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

interface ProjectData {
  name: string;
  displayName: string;
  hasRoadmap: boolean;
  tickets: Array<{
    slug: string;
    title: string;
  }>;
}

function getProjectTickets(projectPath: string): Array<{ slug: string; title: string }> {
  const ticketsPath = path.join(projectPath, "tickets");
  
  try {
    const files = fs.readdirSync(ticketsPath);
    const tickets: Array<{ slug: string; title: string }> = [];
    
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
        
        tickets.push({ slug, title });
      }
    }
    
    // Sort tickets by slug (which should be in order)
    return tickets.sort((a, b) => a.slug.localeCompare(b.slug));
  } catch {
    return [];
  }
}

export async function GET() {
  const prdPath = path.join(process.cwd(), "prd");
  
  try {
    const items = fs.readdirSync(prdPath, { withFileTypes: true });
    const projects: ProjectData[] = [];
    
    for (const item of items) {
      if (item.isDirectory()) {
        const projectPath = path.join(prdPath, item.name);
        const prdFile = path.join(projectPath, "prd.md");
        
        // Only include projects that have a prd.md file
        if (fs.existsSync(prdFile)) {
          const displayName = item.name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Check if roadmap exists
          const roadmapFile = path.join(projectPath, "roadmap.md");
          const hasRoadmap = fs.existsSync(roadmapFile);
          
          // Get tickets
          const tickets = getProjectTickets(projectPath);
          
          projects.push({
            name: item.name,
            displayName,
            hasRoadmap,
            tickets,
          });
        }
      }
    }
    
    // Sort projects alphabetically by display name
    projects.sort((a, b) => a.displayName.localeCompare(b.displayName));
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error reading PRD projects:", error);
    return NextResponse.json([], { status: 500 });
  }
}