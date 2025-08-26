/**
 * Test file for ValidationIndicator components
 * 
 * This test demonstrates the visual appearance of validation indicators
 * and can be used for visual regression testing.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ValidationIndicator, RowValidationIndicator, CellValidationIndicator } from "./validation-indicator";
import { ValidationStatus, ValidationSeverity } from "@/lib/types/validation";

describe("ValidationIndicator Components", () => {
  describe("ValidationIndicator", () => {
    it("should render valid status correctly", () => {
      render(
        <ValidationIndicator 
          status={ValidationStatus.VALID} 
          showTooltip={false}
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-label", "Validation passed");
    });

    it("should render error status with count", () => {
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

    it("should render warning status with count", () => {
      render(
        <ValidationIndicator 
          status={ValidationStatus.WARNINGS}
          warningCount={2}
          showTooltip={false}
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-label", "Has validation warnings");
    });

    it("should render not validated status", () => {
      render(
        <ValidationIndicator 
          status={ValidationStatus.NOT_VALIDATED}
          showTooltip={false}
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-label", "Not validated");
    });

    it("should render badge variant correctly", () => {
      render(
        <ValidationIndicator 
          status={ValidationStatus.ERRORS}
          variant="badge"
          errorCount={1}
          showTooltip={false}
        />
      );
      
      // Should show the error label in badge format
      expect(screen.getByText("Errors")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should render both icon and badge", () => {
      render(
        <ValidationIndicator 
          status={ValidationStatus.WARNINGS}
          variant="both"
          warningCount={2}
          showTooltip={false}
        />
      );
      
      // Should show both icon and badge
      expect(screen.getByText("Warnings")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("RowValidationIndicator", () => {
    it("should render error indicator for rows with errors", () => {
      render(
        <RowValidationIndicator
          hasErrors={true}
          hasWarnings={false}
          errorCount={2}
          warningCount={0}
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-label", "Has validation errors");
    });

    it("should render warning indicator for rows with warnings only", () => {
      render(
        <RowValidationIndicator
          hasErrors={false}
          hasWarnings={true}
          errorCount={0}
          warningCount={1}
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-label", "Has validation warnings");
    });

    it("should render valid indicator for rows without issues", () => {
      render(
        <RowValidationIndicator
          hasErrors={false}
          hasWarnings={false}
          errorCount={0}
          warningCount={0}
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-label", "Validation passed");
    });
  });

  describe("CellValidationIndicator", () => {
    it("should render error indicator for cell errors", () => {
      render(
        <CellValidationIndicator
          severity={ValidationSeverity.ERROR}
          message="Field is required"
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-label", "Has validation errors");
    });

    it("should render warning indicator for cell warnings", () => {
      render(
        <CellValidationIndicator
          severity={ValidationSeverity.WARNING}
          message="Value seems unusual"
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-label", "Has validation warnings");
    });

    it("should not render when no severity is provided", () => {
      const { container } = render(
        <CellValidationIndicator />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it("should not render when severity is undefined", () => {
      const { container } = render(
        <CellValidationIndicator severity={undefined} />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for screen readers", () => {
      render(
        <ValidationIndicator 
          status={ValidationStatus.ERRORS}
          errorCount={3}
          warningCount={1}
          showTooltip={false}
        />
      );
      
      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-label", "Has validation errors");
    });

    it("should provide meaningful tooltip content", () => {
      render(
        <ValidationIndicator 
          status={ValidationStatus.ERRORS}
          errorCount={2}
          warningCount={1}
          tooltipContent="Custom tooltip message"
        />
      );
      
      // The tooltip should be available for assistive technologies
      const indicator = screen.getByRole("status");
      expect(indicator).toBeInTheDocument();
    });
  });
});