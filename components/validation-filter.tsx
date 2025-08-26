/**
 * ValidationFilter Component
 * 
 * Provides filtering controls for validation states with accessibility support.
 * Allows users to filter table rows by validation status.
 */

import { useState } from "react";
import { ValidationStatus } from "@/lib/types/validation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ValidationIndicator } from "@/components/validation-indicator";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationFilterProps {
  onFilterChange: (statuses: ValidationStatus[]) => void;
  validationStats: {
    total: number;
    valid: number;
    errors: number;
    warnings: number;
    notValidated: number;
  };
  className?: string;
}

export function ValidationFilter({
  onFilterChange,
  validationStats,
  className,
}: ValidationFilterProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<ValidationStatus[]>([]);

  const handleStatusToggle = (status: ValidationStatus, checked: boolean) => {
    const newStatuses = checked
      ? [...selectedStatuses, status]
      : selectedStatuses.filter(s => s !== status);
    
    setSelectedStatuses(newStatuses);
    onFilterChange(newStatuses);
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    onFilterChange([]);
  };

  const hasActiveFilters = selectedStatuses.length > 0;

  const filterOptions = [
    {
      status: ValidationStatus.ERRORS,
      label: "Errors",
      count: validationStats.errors,
      enabled: validationStats.errors > 0,
    },
    {
      status: ValidationStatus.WARNINGS,
      label: "Warnings",
      count: validationStats.warnings,
      enabled: validationStats.warnings > 0,
    },
    {
      status: ValidationStatus.VALID,
      label: "Valid",
      count: validationStats.valid,
      enabled: validationStats.valid > 0,
    },
    {
      status: ValidationStatus.NOT_VALIDATED,
      label: "Not Validated",
      count: validationStats.notValidated,
      enabled: validationStats.notValidated > 0,
    },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 border-dashed",
              hasActiveFilters && "border-solid bg-primary/10 border-primary/20"
            )}
          >
            <Filter className="mr-2 h-3 w-3" />
            Validation Status
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 p-0 font-mono text-xs"
              >
                {selectedStatuses.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filterOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.status}
              checked={selectedStatuses.includes(option.status)}
              onCheckedChange={(checked) => handleStatusToggle(option.status, checked)}
              disabled={!option.enabled}
              className="flex items-center gap-2"
            >
              <ValidationIndicator
                status={option.status}
                size="sm"
                variant="icon"
                showTooltip={false}
              />
              <span className="flex-1">{option.label}</span>
              <Badge variant="outline" className="text-xs">
                {option.count}
              </Badge>
            </DropdownMenuCheckboxItem>
          ))}
          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 w-full justify-start text-xs"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear filters
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <div className="flex items-center gap-1">
          {selectedStatuses.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="gap-1 text-xs"
            >
              <ValidationIndicator
                status={status}
                size="sm"
                variant="icon"
                showTooltip={false}
              />
              {filterOptions.find(opt => opt.status === status)?.label}
              <button
                onClick={() => handleStatusToggle(status, false)}
                className="ml-1 hover:bg-muted rounded-sm p-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label={`Remove ${status} filter`}
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Validation Summary Component
 * Shows aggregate validation statistics
 */
interface ValidationSummaryProps {
  stats: {
    total: number;
    valid: number;
    errors: number;
    warnings: number;
    notValidated: number;
  };
  className?: string;
}

export function ValidationSummary({ stats, className }: ValidationSummaryProps) {
  const { total, valid, errors, warnings } = stats;
  
  if (total === 0) return null;

  const validPercentage = Math.round((valid / total) * 100);
  const hasIssues = errors > 0 || warnings > 0;

  return (
    <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", className)}>
      <div className="flex items-center gap-2">
        <span className="font-medium">Validation:</span>
        <div className="flex items-center gap-1">
          <ValidationIndicator
            status={ValidationStatus.VALID}
            size="sm"
            variant="icon"
            showTooltip={false}
          />
          <span>{validPercentage}% valid</span>
        </div>
      </div>
      
      {hasIssues && (
        <div className="flex items-center gap-3">
          {errors > 0 && (
            <div className="flex items-center gap-1">
              <ValidationIndicator
                status={ValidationStatus.ERRORS}
                errorCount={errors}
                size="sm"
                variant="icon"
                showTooltip={false}
              />
              <span>{errors} error{errors !== 1 ? 's' : ''}</span>
            </div>
          )}
          {warnings > 0 && (
            <div className="flex items-center gap-1">
              <ValidationIndicator
                status={ValidationStatus.WARNINGS}
                warningCount={warnings}
                size="sm"
                variant="icon"
                showTooltip={false}
              />
              <span>{warnings} warning{warnings !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
      
      <span className="text-xs">
        {total} row{total !== 1 ? 's' : ''} total
      </span>
    </div>
  );
}