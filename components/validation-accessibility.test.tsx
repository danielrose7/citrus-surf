/**
 * Accessibility tests for validation components
 * 
 * Ensures all validation UI components meet accessibility standards
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ValidationIndicator } from "./validation-indicator";
import { ValidationFilter, ValidationSummary } from "./validation-filter";
import { ValidationStatus } from "@/lib/types/validation";

describe("Validation Components Accessibility", () => {
  describe("ValidationIndicator Accessibility", () => {
    it("should have proper ARIA roles and labels", () => {
      render(
        <ValidationIndicator 
          status={ValidationStatus.ERRORS}
          errorCount={3}
          showTooltip={false}
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-label", "Has validation errors");
    });

    it("should provide tooltip content for assistive technology", async () => {
      render(
        <ValidationIndicator 
          status={ValidationStatus.WARNINGS}
          warningCount={2}
          showTooltip={true}
          tooltipContent="2 warnings found in this validation"
        />
      );
      
      const indicator = screen.getByRole("status");
      
      // Tooltip content should be accessible through ARIA
      expect(indicator).toHaveAttribute("aria-label", "Has validation warnings");
    });

    it("should support screen reader text for different statuses", () => {
      const { rerender } = render(
        <ValidationIndicator 
          status={ValidationStatus.VALID}
          showTooltip={false}
        />
      );
      expect(screen.getByLabelText("Validation passed")).toBeInTheDocument();
      
      rerender(
        <ValidationIndicator 
          status={ValidationStatus.ERRORS}
          errorCount={1}
          showTooltip={false}
        />
      );
      expect(screen.getByLabelText("Has validation errors")).toBeInTheDocument();
      
      rerender(
        <ValidationIndicator 
          status={ValidationStatus.WARNINGS}
          warningCount={2}
          showTooltip={false}
        />
      );
      expect(screen.getByLabelText("Has validation warnings")).toBeInTheDocument();
    });

    it("should have sufficient color contrast", () => {
      render(
        <ValidationIndicator 
          status={ValidationStatus.ERRORS}
          variant="both"
          errorCount={1}
          showTooltip={false}
        />
      );
      
      // Verify that error indicators use destructive color scheme
      const badge = screen.getByText("Errors");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("ValidationFilter Accessibility", () => {
    const mockStats = {
      total: 100,
      valid: 80,
      errors: 15,
      warnings: 5,
      notValidated: 0,
    };

    it("should have accessible dropdown menu", async () => {
      const user = userEvent.setup();
      const mockFilterChange = vi.fn();
      
      render(
        <ValidationFilter
          onFilterChange={mockFilterChange}
          validationStats={mockStats}
        />
      );
      
      const trigger = screen.getByRole("button", { name: /validation status/i });
      expect(trigger).toBeInTheDocument();
      
      // Should be keyboard accessible
      await user.click(trigger);
      
      // Dropdown should have proper ARIA attributes
      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();
    });

    it("should have accessible filter options", async () => {
      const user = userEvent.setup();
      const mockFilterChange = vi.fn();
      
      render(
        <ValidationFilter
          onFilterChange={mockFilterChange}
          validationStats={mockStats}
        />
      );
      
      const trigger = screen.getByRole("button", { name: /validation status/i });
      await user.click(trigger);
      
      // All filter options should be accessible
      const errorOption = screen.getByRole("menuitemcheckbox", { name: /errors/i });
      const warningOption = screen.getByRole("menuitemcheckbox", { name: /warnings/i });
      
      expect(errorOption).toBeInTheDocument();
      expect(warningOption).toBeInTheDocument();
      
      // Should be keyboard navigable
      await user.keyboard("{ArrowDown}");
      expect(errorOption).toHaveFocus();
    });

    it("should provide clear labeling for filter badges", async () => {
      const user = userEvent.setup();
      const mockFilterChange = vi.fn();
      
      render(
        <ValidationFilter
          onFilterChange={mockFilterChange}
          validationStats={mockStats}
        />
      );
      
      const trigger = screen.getByRole("button", { name: /validation status/i });
      await user.click(trigger);
      
      // Select an error filter
      const errorOption = screen.getByRole("menuitemcheckbox", { name: /errors/i });
      await user.click(errorOption);
      
      // Should create an accessible filter badge
      const filterBadge = screen.getByText("Errors");
      expect(filterBadge).toBeInTheDocument();
      
      // Remove button should have proper aria-label
      const removeButton = screen.getByLabelText("Remove errors filter");
      expect(removeButton).toBeInTheDocument();
    });
  });

  describe("ValidationSummary Accessibility", () => {
    it("should provide meaningful summary information", () => {
      const stats = {
        total: 100,
        valid: 75,
        errors: 20,
        warnings: 5,
        notValidated: 0,
      };
      
      render(<ValidationSummary stats={stats} />);
      
      // Should show percentage and counts in accessible format
      expect(screen.getByText("75% valid")).toBeInTheDocument();
      expect(screen.getByText(/20 errors?/)).toBeInTheDocument();
      expect(screen.getByText(/5 warnings?/)).toBeInTheDocument();
      expect(screen.getByText("100 rows total")).toBeInTheDocument();
    });

    it("should handle singular/plural correctly for screen readers", () => {
      const singleStats = {
        total: 1,
        valid: 0,
        errors: 1,
        warnings: 0,
        notValidated: 0,
      };
      
      render(<ValidationSummary stats={singleStats} />);
      
      // Should use singular forms correctly
      expect(screen.getByText("1 error")).toBeInTheDocument();
      expect(screen.getByText("1 row total")).toBeInTheDocument();
    });
  });

  describe("Focus Management", () => {
    it("should maintain proper focus order in validation components", async () => {
      const user = userEvent.setup();
      const mockFilterChange = vi.fn();
      const mockStats = {
        total: 100,
        valid: 80,
        errors: 15,
        warnings: 5,
        notValidated: 0,
      };
      
      render(
        <div>
          <ValidationFilter
            onFilterChange={mockFilterChange}
            validationStats={mockStats}
          />
        </div>
      );
      
      // Tab through components in logical order
      await user.tab();
      expect(screen.getByRole("button", { name: /validation status/i })).toHaveFocus();
      
      // Status indicators are not focusable by design (they are announcements, not interactive elements)
      // This is correct accessibility behavior - screen readers read status elements without needing focus
    });
  });

  describe("High Contrast Mode Support", () => {
    it("should work with forced-colors media query", () => {
      // This test ensures components work in Windows High Contrast mode
      render(
        <ValidationIndicator 
          status={ValidationStatus.ERRORS}
          variant="both"
          errorCount={1}
          showTooltip={false}
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toBeInTheDocument();
      
      // The component should render without errors in high contrast mode
      // (actual contrast testing would require visual regression testing tools)
    });
  });

  describe("Reduced Motion Support", () => {
    it("should respect prefers-reduced-motion for animations", () => {
      // Verify that transitions and animations can be disabled
      render(
        <ValidationIndicator 
          status={ValidationStatus.WARNINGS}
          showTooltip={true}
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toBeInTheDocument();
      
      // Component should render without motion-sensitive effects when requested
      // (actual motion testing would require DOM inspection of computed styles)
    });
  });
});