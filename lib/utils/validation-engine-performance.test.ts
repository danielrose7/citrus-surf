import { describe, it, expect, beforeEach } from "vitest";
import { ValidationEngine, BaseValidationRule } from "./validation-engine";
import {
  ValidationRuleType,
  ValidationSeverity,
  createEmptyValidationResult,
  type ValidationResult,
  type ValidationContext,
} from "../types/validation";
import type { TargetField, TargetShape } from "../types/target-shapes";
import type { TableRow } from "../features/tableSlice";

// Simple performance-oriented validation rules
class FastRequiredRule extends BaseValidationRule {
  constructor() {
    super("fast-required", ValidationRuleType.REQUIRED, "Fast required field rule");
  }

  validate(value: any, field: TargetField, context: ValidationContext): ValidationResult {
    const result = createEmptyValidationResult();
    
    if (field.required && (value === null || value === undefined || value === "")) {
      result.isValid = false;
      result.errors.push({
        ruleId: this.id,
        ruleType: this.type,
        severity: ValidationSeverity.ERROR,
        message: `${field.name} is required`,
        fieldName: field.name,
        currentValue: value,
        suggestedFixes: [],
      });
    }

    return result;
  }

  shouldApplyToField(field: TargetField): boolean {
    return field.required === true;
  }
}

class FastTypeRule extends BaseValidationRule {
  constructor() {
    super("fast-type", ValidationRuleType.TYPE, "Fast type validation rule");
  }

  validate(value: any, field: TargetField, context: ValidationContext): ValidationResult {
    const result = createEmptyValidationResult();

    if (value === null || value === undefined) {
      return result;
    }

    if (field.type === "number" && typeof value !== "number") {
      result.isValid = false;
      result.errors.push({
        ruleId: this.id,
        ruleType: this.type,
        severity: ValidationSeverity.ERROR,
        message: `Invalid type for ${field.name}`,
        fieldName: field.name,
        currentValue: value,
        suggestedFixes: [],
      });
    }

    return result;
  }
}

describe("ValidationEngine Performance Tests", () => {
  let engine: ValidationEngine;

  const createLargeDataset = (size: number): TableRow[] => {
    return Array.from({ length: size }, (_, i) => ({
      id: String(i + 1),
      name: i % 10 === 0 ? "" : `User ${i + 1}`, // 10% empty names for required field errors
      email: `user${i + 1}@example.com`,
      age: i % 5 === 0 ? "invalid" : i + 20, // 20% invalid ages for type errors
      score: Math.random() * 100,
    }));
  };

  const createTargetShape = (): TargetShape => ({
    id: "perf-test-shape",
    name: "Performance Test Shape",
    description: "Target shape for performance testing",
    fields: [
      {
        id: "name-field",
        name: "name",
        type: "string",
        required: true,
        description: "User name",
        validation: [],
        transformation: [],
      },
      {
        id: "email-field",
        name: "email",
        type: "string",
        required: false,
        description: "Email address",
        validation: [],
        transformation: [],
      },
      {
        id: "age-field",
        name: "age",
        type: "number",
        required: false,
        description: "User age",
        validation: [],
        transformation: [],
      },
      {
        id: "score-field",
        name: "score",
        type: "number",
        required: false,
        description: "User score",
        validation: [],
        transformation: [],
      },
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  beforeEach(() => {
    engine = new ValidationEngine();
    engine.getRuleRegistry().registerRule(new FastRequiredRule());
    engine.getRuleRegistry().registerRule(new FastTypeRule());
  });

  it("should validate 1000 rows in under 1 second", () => {
    const data = createLargeDataset(1000);
    const targetShape = createTargetShape();

    const startTime = Date.now();
    const result = engine.validateTable(data, targetShape);
    const duration = Date.now() - startTime;

    console.log(`Validated 1000 rows in ${duration}ms`);

    expect(duration).toBeLessThan(1000); // Less than 1 second
    expect(result.totalRows).toBe(1000);
    expect(result.validatedRows).toBe(1000);
    expect(result.progress).toBe(1.0);

    // Should have some errors (10% missing names + 20% invalid ages)
    expect(result.totalErrors).toBeGreaterThan(0);
  }, 5000); // 5 second timeout

  it("should validate 10,000 rows in under 5 seconds", () => {
    const data = createLargeDataset(10000);
    const targetShape = createTargetShape();

    const startTime = Date.now();
    const result = engine.validateTable(data, targetShape);
    const duration = Date.now() - startTime;

    console.log(`Validated 10,000 rows in ${duration}ms`);

    expect(duration).toBeLessThan(5000); // Less than 5 seconds (requirement)
    expect(result.totalRows).toBe(10000);
    expect(result.validatedRows).toBe(10000);
    expect(result.progress).toBe(1.0);

    // Verify statistical accuracy
    expect(result.totalErrors).toBeGreaterThan(2500); // At least 30% error rate
    expect(result.errorsByType[ValidationRuleType.REQUIRED]).toBeGreaterThan(900); // ~10% required errors
    expect(result.errorsByType[ValidationRuleType.TYPE]).toBeGreaterThan(1900); // ~20% type errors
  }, 10000); // 10 second timeout

  it("should validate 10,000 rows asynchronously in under 5 seconds with progress", async () => {
    const data = createLargeDataset(10000);
    const targetShape = createTargetShape();

    let progressCount = 0;
    const progressCallback = (progress: number, current: number, total: number, message?: string) => {
      progressCount++;
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
      expect(current).toBeLessThanOrEqual(total);
    };

    const startTime = Date.now();
    const result = await engine.validateTableAsync(data, targetShape, progressCallback);
    const duration = Date.now() - startTime;

    console.log(`Async validated 10,000 rows in ${duration}ms with ${progressCount} progress updates`);

    expect(duration).toBeLessThan(5000); // Less than 5 seconds
    expect(result.totalRows).toBe(10000);
    expect(result.validatedRows).toBe(10000);
    expect(result.isValidating).toBe(false);
    expect(progressCount).toBeGreaterThan(0); // Should have at least one progress update
  }, 10000); // 10 second timeout

  it("should handle memory efficiently with large datasets", () => {
    const data = createLargeDataset(5000);
    const targetShape = createTargetShape();

    // Monitor memory usage (basic check)
    const memBefore = process.memoryUsage();
    const result = engine.validateTable(data, targetShape);
    const memAfter = process.memoryUsage();

    const memDiff = memAfter.heapUsed - memBefore.heapUsed;
    const memDiffMB = memDiff / (1024 * 1024);

    console.log(`Memory usage increased by ${memDiffMB.toFixed(2)}MB for 5000 rows`);

    expect(result.totalRows).toBe(5000);
    expect(memDiffMB).toBeLessThan(100); // Should not use more than 100MB additional memory
  });

  it("should scale linearly with data size", () => {
    const sizes = [100, 500, 1000];
    const times: number[] = [];

    for (const size of sizes) {
      const data = createLargeDataset(size);
      const targetShape = createTargetShape();

      const startTime = Date.now();
      engine.validateTable(data, targetShape);
      const duration = Date.now() - startTime;

      times.push(duration);
      console.log(`${size} rows: ${duration}ms`);
    }

    // Check that validation time scales roughly linearly
    // (allowing for some variance due to overhead)
    const ratio1 = times[1] / times[0]; // 500 vs 100
    const ratio2 = times[2] / times[1]; // 1000 vs 500

    expect(ratio1).toBeGreaterThan(2); // Should take more time for more data
    expect(ratio1).toBeLessThan(10); // But not excessively more
    expect(ratio2).toBeGreaterThanOrEqual(1.4); // Should scale with data size
    expect(ratio2).toBeLessThan(15); // But remain roughly linear (increased threshold for CI variability)
  });

  it("should validate single row quickly", () => {
    const targetShape = createTargetShape();
    const row: TableRow = { id: "1", name: "John", email: "john@example.com", age: 25, score: 85.5 };

    const iterations = 1000;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      engine.validateRow(row, targetShape);
    }

    const duration = Date.now() - startTime;
    const avgTimePerRow = duration / iterations;

    console.log(`Average single row validation: ${avgTimePerRow.toFixed(3)}ms`);

    expect(avgTimePerRow).toBeLessThan(1); // Should be less than 1ms per row on average
  });

  it("should validate single cell quickly", () => {
    const field: TargetField = {
      id: "test-field",
      name: "name",
      type: "string",
      required: true,
      description: "Test field",
      validation: [],
      transformation: [],
    };
    const row: TableRow = { id: "1", name: "John" };

    const iterations = 10000;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      engine.validateCell("John", field, row);
    }

    const duration = Date.now() - startTime;
    const avgTimePerCell = duration / iterations;

    console.log(`Average single cell validation: ${avgTimePerCell.toFixed(4)}ms`);

    expect(avgTimePerCell).toBeLessThan(0.1); // Should be less than 0.1ms per cell on average
  });
});