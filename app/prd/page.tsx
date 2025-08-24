import fs from "fs";
import path from "path";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Requirements Documents - Citrus Surf",
  description:
    "Product requirements and implementation guides for Citrus Surf features",
};

function readMarkdownFile(filePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), "prd", filePath);
    return fs.readFileSync(fullPath, "utf8");
  } catch {
    return "# File not found\n\nThe requested file could not be found.";
  }
}

function getAvailableProjects(): Array<{ name: string; displayName: string; description: string }> {
  const prdPath = path.join(process.cwd(), "prd");
  
  try {
    const items = fs.readdirSync(prdPath, { withFileTypes: true });
    const projects: Array<{ name: string; displayName: string; description: string }> = [];
    
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
          
          // Try to extract description from the PRD file
          let description = "Product requirements and implementation guide";
          try {
            const prdContent = fs.readFileSync(prdFile, "utf8");
            const descriptionMatch = prdContent.match(/^## Overview\s+(.+?)(?=\n\n|\n##|$)/ms);
            if (descriptionMatch) {
              description = descriptionMatch[1].trim().replace(/\n/g, ' ').substring(0, 150);
              if (description.length === 150) description += "...";
            }
          } catch {
            // Use default description if we can't read the file
          }
          
          projects.push({
            name: item.name,
            displayName,
            description,
          });
        }
      }
    }
    
    return projects.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch {
    return [];
  }
}

function formatMarkdown(content: string): string {
  // Simple markdown-to-HTML conversion for basic formatting
  return content
    .replace(
      /^# (.*$)/gm,
      '<h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">$1</h1>'
    )
    .replace(
      /^## (.*$)/gm,
      '<h2 class="text-2xl font-semibold mb-4 mt-8 text-gray-900 dark:text-gray-100">$1</h2>'
    )
    .replace(
      /^### (.*$)/gm,
      '<h3 class="text-xl font-medium mb-3 mt-6 text-gray-900 dark:text-gray-100">$1</h3>'
    )
    .replace(
      /^#### (.*$)/gm,
      '<h4 class="text-lg font-medium mb-2 mt-4 text-gray-900 dark:text-gray-100">$1</h4>'
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
    )
    .replace(
      /^```(\w*)\n([\s\S]*?)```/gm,
      '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4"><code class="text-sm font-mono">$2</code></pre>'
    )
    .replace(/^- (.*$)/gm, '<li class="mb-1">$1</li>')
    .replace(
      /(<li.*<\/li>)/s,
      '<ul class="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">$1</ul>'
    )
    .replace(/^\| (.*) \|$/gm, (match, content) => {
      const cells = content
        .split(" | ")
        .map(
          (cell: string) =>
            `<td class="border border-gray-300 dark:border-gray-600 px-3 py-2">${cell}</td>`
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .replace(
      /(\<tr\>.*\<\/tr\>)/gs,
      '<table class="w-full border-collapse border border-gray-300 dark:border-gray-600 mb-4">$1</table>'
    )
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 dark:text-gray-300">')
    .replace(
      /^(?!<[h1-6]|<ul|<pre|<table)(.+)$/gm,
      '<p class="mb-4 text-gray-700 dark:text-gray-300">$1</p>'
    );
}

export default function PRDOverview() {
  const content = readMarkdownFile("README.md");
  const projects = getAvailableProjects();

  return (
    <div className="prose prose-lg max-w-none">
      <div
        dangerouslySetInnerHTML={{
          __html: formatMarkdown(content),
        }}
      />
      
      {projects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Available Project PRDs
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.name}
                href={`/prd/${project.name}`}
                className="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">
                  {project.displayName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {project.description}
                </p>
                <div className="mt-3 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  View PRD →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
