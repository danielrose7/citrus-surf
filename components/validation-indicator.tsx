/**
 * ValidationIndicator Component
 * 
 * Provides visual indicators for validation status with accessibility compliance.
 * Supports row-level and cell-level validation states with proper theming.
 */

import { ValidationStatus, ValidationSeverity } from "@/lib/types/validation";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ValidationIndicatorProps {
  status: ValidationStatus;
  errorCount?: number;
  warningCount?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "badge" | "both";
  showTooltip?: boolean;
  tooltipContent?: string;
}

const statusConfig = {
  [ValidationStatus.VALID]: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    badgeVariant: "secondary" as const,
    label: "Valid",
    ariaLabel: "Validation passed",
  },
  [ValidationStatus.ERRORS]: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
    badgeVariant: "destructive" as const,
    label: "Errors",
    ariaLabel: "Has validation errors",
  },
  [ValidationStatus.WARNINGS]: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    badgeVariant: "secondary" as const,
    label: "Warnings",
    ariaLabel: "Has validation warnings",
  },
  [ValidationStatus.NOT_VALIDATED]: {
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-muted",
    badgeVariant: "outline" as const,
    label: "Not validated",
    ariaLabel: "Not validated",
  },
};

const sizeConfig = {
  sm: {
    icon: "h-3 w-3",
    badge: "text-xs px-1.5 py-0.5",
    container: "gap-1",
  },
  md: {
    icon: "h-4 w-4",
    badge: "text-sm px-2 py-1",
    container: "gap-1.5",
  },
  lg: {
    icon: "h-5 w-5",
    badge: "text-base px-3 py-1.5",
    container: "gap-2",
  },
};

export function ValidationIndicator({
  status,
  errorCount = 0,
  warningCount = 0,
  className,
  size = "md",
  variant = "icon",
  showTooltip = true,
  tooltipContent,
}: ValidationIndicatorProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  const getCountText = () => {
    if (status === ValidationStatus.ERRORS && errorCount > 0) {
      return errorCount.toString();
    }
    if (status === ValidationStatus.WARNINGS && warningCount > 0) {
      return warningCount.toString();
    }
    return null;
  };

  const getTooltipText = () => {
    if (tooltipContent) return tooltipContent;
    
    const counts = [];
    if (errorCount > 0) counts.push(`${errorCount} error${errorCount !== 1 ? 's' : ''}`);
    if (warningCount > 0) counts.push(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`);
    
    if (counts.length > 0) {
      return `${config.label}: ${counts.join(', ')}`;
    }
    
    return config.ariaLabel;
  };

  const renderContent = () => {
    const iconElement = (
      <Icon 
        className={cn(
          sizeStyles.icon,
          config.color,
          "flex-shrink-0"
        )}
        aria-hidden="true"
      />
    );

    const badgeElement = (
      <Badge 
        variant={config.badgeVariant}
        className={cn(
          sizeStyles.badge,
          config.bgColor,
          config.borderColor,
          "font-medium"
        )}
      >
        {config.label}
        {getCountText() && (
          <span className="ml-1 font-bold">
            {getCountText()}
          </span>
        )}
      </Badge>
    );

    switch (variant) {
      case "icon":
        return iconElement;
      case "badge":
        return badgeElement;
      case "both":
        return (
          <div className={cn("flex items-center", sizeStyles.container)}>
            {iconElement}
            {badgeElement}
          </div>
        );
      default:
        return iconElement;
    }
  };

  const content = (
    <div
      className={cn(
        "inline-flex items-center",
        sizeStyles.container,
        className
      )}
      role="status"
      aria-label={config.ariaLabel}
    >
      {renderContent()}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

/**
 * Row-level validation indicator for table rows
 */
interface RowValidationIndicatorProps {
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  className?: string;
}

export function RowValidationIndicator({
  hasErrors,
  hasWarnings,
  errorCount,
  warningCount,
  className,
}: RowValidationIndicatorProps) {
  const status = hasErrors 
    ? ValidationStatus.ERRORS
    : hasWarnings 
    ? ValidationStatus.WARNINGS 
    : ValidationStatus.VALID;

  return (
    <ValidationIndicator
      status={status}
      errorCount={errorCount}
      warningCount={warningCount}
      size="sm"
      variant="icon"
      className={className}
    />
  );
}

/**
 * Cell-level validation indicator for individual cells
 */
interface CellValidationIndicatorProps {
  severity?: ValidationSeverity;
  message?: string;
  className?: string;
}

export function CellValidationIndicator({
  severity,
  message,
  className,
}: CellValidationIndicatorProps) {
  if (!severity) return null;

  const status = severity === ValidationSeverity.ERROR 
    ? ValidationStatus.ERRORS 
    : ValidationStatus.WARNINGS;

  return (
    <ValidationIndicator
      status={status}
      size="sm"
      variant="icon"
      tooltipContent={message}
      className={cn("ml-1", className)}
    />
  );
}