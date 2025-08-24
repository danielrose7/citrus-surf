"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, FileText, Folder } from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  children?: NavItem[];
}

interface ProjectData {
  name: string;
  displayName: string;
  hasRoadmap: boolean;
  tickets: Array<{
    slug: string;
    title: string;
  }>;
}

async function fetchProjectData(): Promise<NavItem[]> {
  try {
    const response = await fetch('/api/prd/projects');
    const projects: ProjectData[] = await response.json();
    
    const navigationItems: NavItem[] = [
      {
        title: "PRD Overview",
        href: "/prd",
      },
    ];

    for (const project of projects) {
      const projectChildren: NavItem[] = [
        {
          title: "PRD Document",
          href: `/prd/${project.name}`,
        },
      ];

      if (project.hasRoadmap) {
        projectChildren.push({
          title: "Implementation Roadmap",
          href: `/prd/${project.name}/roadmap`,
        });
      }

      if (project.tickets.length > 0) {
        projectChildren.push({
          title: "Tickets",
          children: project.tickets.map(ticket => ({
            title: ticket.title,
            href: `/prd/${project.name}/tickets/${ticket.slug}`,
          })),
        });
      }

      navigationItems.push({
        title: project.displayName,
        children: projectChildren,
      });
    }

    return navigationItems;
  } catch (error) {
    console.error('Failed to fetch project data:', error);
    // Fallback to static navigation
    return [
      {
        title: "PRD Overview",
        href: "/prd",
      },
      {
        title: "Lookup Fields",
        children: [
          {
            title: "PRD Document",
            href: "/prd/lookup-fields",
          },
          {
            title: "Implementation Roadmap",
            href: "/prd/lookup-fields/roadmap",
          },
        ],
      },
      {
        title: "Validation System",
        children: [
          {
            title: "PRD Document",
            href: "/prd/validation-system",
          },
          {
            title: "Implementation Roadmap",
            href: "/prd/validation-system/roadmap",
          },
        ],
      },
    ];
  }
}

function NavItemComponent({
  item,
  level = 0,
}: {
  item: NavItem;
  level?: number;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(
    item.children?.some(
      child =>
        child.href === pathname ||
        child.children?.some(grandchild => grandchild.href === pathname)
    ) || false
  );

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === pathname;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center w-full px-2 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md",
            level > 0 && "ml-4"
          )}
        >
          <Folder className="h-4 w-4 mr-2 text-gray-500" />
          <span className="flex-1">{item.title}</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>
        {isOpen && (
          <div className="ml-2">
            {item.children.map((child, index) => (
              <NavItemComponent key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md",
        level > 0 && "ml-4",
        isActive &&
          "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
      )}
    >
      <FileText className="h-4 w-4 mr-2 text-gray-500" />
      {item.title}
    </Link>
  );
}

export default function PRDLayout({ children }: { children: React.ReactNode }) {
  const [navigationItems, setNavigationItems] = useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectData().then(items => {
      setNavigationItems(items);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Product Requirements
          </h2>
          <nav className="space-y-1">
            {isLoading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Loading projects...
              </div>
            ) : (
              navigationItems.map((item, index) => (
                <NavItemComponent key={index} item={item} />
              ))
            )}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">{children}</div>
      </div>
    </div>
  );
}
