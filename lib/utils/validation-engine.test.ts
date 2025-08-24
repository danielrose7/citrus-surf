import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ValidationEngine,
  ValidationRuleRegistry,
  BaseValidationRule,
  defaultValidationEngine,
  type ValidationProgressCallback,
} from "./validation-engine";
import {
  ValidationRuleType,
  ValidationSeverity,
  ValidationStatus,
  createEmptyValidationResult,
  type ValidationResult,
  type ValidationContext,
} from "../types/validation";
import type { TargetField, TargetShape } from "../types/target-shapes";
import type { TableRow } from "../features/tableSlice";

// Mock validation rule for testing
class MockRequiredFieldRule extends BaseValidationRule {
  constructor() {
    super("mock-required", ValidationRuleType.REQUIRED, "Mock required field rule");
  }

  validate(value: any, field: TargetField, context: ValidationContext): ValidationResult {
    const result = createEmptyValidationResult();
    
    if (field.required && (value === null || value === undefined || value === "")) {
      result.isValid = false;
      result.errors.push({
        ruleId: this.id,
        ruleType: this.type,
        message: `${field.name} is required but is empty`,
        fieldName: field.name,
        currentValue: value,
        suggestedFixes: [{
          action: "replace",
          description: `Enter a value for ${field.name}`,
        }],
      });
    }

    return result;
  }

  shouldApplyToField(field: TargetField): boolean {
    return field.required === true;
  }
}

class MockTypeValidationRule extends BaseValidationRule {
  constructor() {
    super("mock-type", ValidationRuleType.TYPE, "Mock type validation rule");
  }

  validate(value: any, field: TargetField, context: ValidationContext): ValidationResult {
    const result = createEmptyValidationResult();

    if (value === null || value === undefined) {
      return result; // Skip type validation for null/undefined values
    }

    if (field.type === "number" && typeof value !== "number") {
      result.isValid = false;
      result.errors.push({
        ruleId: this.id,
        ruleType: this.type,
        message: `${field.name} must be a number, got ${typeof value}`,
        fieldName: field.name,
        currentValue: value,
        suggestedFixes: [{
          action: "convert",
          description: `Convert "${value}" to a number`,
          newValue: Number(value),
        }],
      });
    }

    return result;
  }
}

class FailingRule extends BaseValidationRule {
  constructor() {
    super("failing-rule", ValidationRuleType.FORMAT, "Rule that always throws");
  }

  validate(value: any, field: TargetField, context: ValidationContext): ValidationResult {
    throw new Error("This rule always fails");
  }
}

describe("BaseValidationRule", () => {
  it("should create a validation rule with correct properties", () => {
    const rule = new MockRequiredFieldRule();
    
    expect(rule.id).toBe("mock-required");
    expect(rule.type).toBe(ValidationRuleType.REQUIRED);
    expect(rule.description).toBe("Mock required field rule");
    expect(rule.enabled).toBe(true);
  });

  it("should have default shouldApplyToField behavior", () => {
    const rule = new MockTypeValidationRule();
    const field: TargetField = {
      id: "test-field",
      name: "test",
      type: "string",
      required: false,
      description: "Test field",
      validation: [],
      transformation: [],
    };

    expect(rule.shouldApplyToField(field)).toBe(true);
  });

  it("should have default createSuggestedFix behavior", () => {
    const rule = new MockRequiredFieldRule();
    const field: TargetField = {
      id: "test-field",
      name: "test",
      type: "string",
      required: false,
      description: "Test field",
      validation: [],
      transformation: [],
    };

    expect(rule.createSuggestedFix("test", field)).toBe(null);
  });
});

describe("ValidationRuleRegistry", () => {
  let registry: ValidationRuleRegistry;
  let mockRule: MockRequiredFieldRule;
  let typeRule: MockTypeValidationRule;

  beforeEach(() => {
    registry = new ValidationRuleRegistry();
    mockRule = new MockRequiredFieldRule();
    typeRule = new MockTypeValidationRule();
  });

  describe("registerRule", () => {
    it("should register a validation rule", () => {
      registry.registerRule(mockRule);
      
      expect(registry.getRule("mock-required")).toBe(mockRule);
      expect(registry.getRulesByType(ValidationRuleType.REQUIRED)).toContain(mockRule);
    });

    it("should register multiple rules of the same type", () => {
      const anotherRequiredRule = new MockRequiredFieldRule();
      anotherRequiredRule.id = "another-required"; // Hack for testing
      
      registry.registerRule(mockRule);
      registry.registerRule(anotherRequiredRule);
      
      const requiredRules = registry.getRulesByType(ValidationRuleType.REQUIRED);
      expect(requiredRules).toHaveLength(2);
      expect(requiredRules).toContain(mockRule);
      expect(requiredRules).toContain(anotherRequiredRule);
    });
  });

  describe("getRule", () => {
    it("should return undefined for non-existent rule", () => {
      expect(registry.getRule("non-existent")).toBeUndefined();
    });

    it("should return the correct rule", () => {
      registry.registerRule(mockRule);
      expect(registry.getRule("mock-required")).toBe(mockRule);
    });
  });

  describe("getRulesForField", () => {
    beforeEach(() => {
      registry.registerRule(mockRule);
      registry.registerRule(typeRule);
    });

    it("should return applicable rules for required field", () => {
      const field: TargetField = {
        id: "test-field",
        name: "test",
        type: "string",
        required: true,
        description: "Test field",
        validation: [],
        transformation: [],
      };

      const rules = registry.getRulesForField(field);
      expect(rules).toContain(mockRule); // Required rule applies
      expect(rules).toContain(typeRule); // Type rule applies to all fields
    });

    it("should not return non-applicable rules", () => {
      const field: TargetField = {
        id: "test-field",
        name: "test",
        type: "string",
        required: false,
        description: "Test field",
        validation: [],
        transformation: [],
      };

      const rules = registry.getRulesForField(field);
      expect(rules).not.toContain(mockRule); // Required rule doesn't apply
      expect(rules).toContain(typeRule); // Type rule applies to all fields
    });
  });

  describe("getRulesByType", () => {
    it("should return empty array for non-existent type", () => {
      expect(registry.getRulesByType(ValidationRuleType.ENUM)).toHaveLength(0);
    });

    it("should return rules of specific type", () => {
      registry.registerRule(mockRule);
      registry.registerRule(typeRule);

      expect(registry.getRulesByType(ValidationRuleType.REQUIRED)).toEqual([mockRule]);
      expect(registry.getRulesByType(ValidationRuleType.TYPE)).toEqual([typeRule]);
    });
  });

  describe("getAllRules", () => {
    it("should return empty array when no rules registered", () => {
      expect(registry.getAllRules()).toHaveLength(0);
    });

    it("should return all registered rules", () => {
      registry.registerRule(mockRule);
      registry.registerRule(typeRule);

      const allRules = registry.getAllRules();
      expect(allRules).toHaveLength(2);
      expect(allRules).toContain(mockRule);
      expect(allRules).toContain(typeRule);
    });
  });

  describe("unregisterRule", () => {
    beforeEach(() => {
      registry.registerRule(mockRule);
      registry.registerRule(typeRule);
    });

    it("should return false for non-existent rule", () => {
      expect(registry.unregisterRule("non-existent")).toBe(false);
    });

    it("should unregister existing rule", () => {
      expect(registry.unregisterRule("mock-required")).toBe(true);
      expect(registry.getRule("mock-required")).toBeUndefined();
      expect(registry.getRulesByType(ValidationRuleType.REQUIRED)).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("should clear all rules", () => {
      registry.registerRule(mockRule);
      registry.registerRule(typeRule);
      
      registry.clear();
      
      expect(registry.getAllRules()).toHaveLength(0);
      expect(registry.getRulesByType(ValidationRuleType.REQUIRED)).toHaveLength(0);
      expect(registry.getRulesByType(ValidationRuleType.TYPE)).toHaveLength(0);
    });
  });
});

describe("ValidationEngine", () => {
  let engine: ValidationEngine;
  let mockRule: MockRequiredFieldRule;
  let typeRule: MockTypeValidationRule;

  const createMockField = (overrides?: Partial<TargetField>): TargetField => ({
    id: "test-field",
    name: "testField",
    type: "string",
    required: false,
    description: "Test field",
    validation: [],
    transformation: [],
    ...overrides,
  });

  const createMockTargetShape = (fields: TargetField[]): TargetShape => ({
    id: "test-shape",
    name: "Test Shape",
    description: "Test target shape",
    fields,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  beforeEach(() => {
    engine = new ValidationEngine();
    mockRule = new MockRequiredFieldRule();
    typeRule = new MockTypeValidationRule();
    
    engine.getRuleRegistry().registerRule(mockRule);
    engine.getRuleRegistry().registerRule(typeRule);
  });

  describe("constructor", () => {
    it("should create engine with default registry", () => {
      const newEngine = new ValidationEngine();
      expect(newEngine.getRuleRegistry()).toBeInstanceOf(ValidationRuleRegistry);
    });

    it("should create engine with provided registry", () => {
      const customRegistry = new ValidationRuleRegistry();
      const newEngine = new ValidationEngine(customRegistry);
      expect(newEngine.getRuleRegistry()).toBe(customRegistry);
    });
  });

  describe("validateCell", () => {
    it("should validate a cell with no errors", () => {
      const field = createMockField({ required: false });
      const row: TableRow = { id: "1", testField: "valid value" };

      const result = engine.validateCell("valid value", field, row);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.metadata.rulesApplied).toBe(1); // Only type rule applies
    });

    it("should validate a required field with error", () => {
      const field = createMockField({ required: true });
      const row: TableRow = { id: "1", testField: "" };

      const result = engine.validateCell("", field, row);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].ruleId).toBe("mock-required");
      expect(result.errors[0].message).toBe("testField is required but is empty");
      expect(result.metadata.rulesApplied).toBe(2); // Both rules apply
    });

    it("should validate type mismatch", () => {
      const field = createMockField({ type: "number" });
      const row: TableRow = { id: "1", testField: "not a number" };

      const result = engine.validateCell("not a number", field, row);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].ruleId).toBe("mock-type");
      expect(result.errors[0].message).toContain("must be a number");
    });

    it("should handle rule execution errors gracefully", () => {
      const failingRule = new FailingRule();
      engine.getRuleRegistry().registerRule(failingRule);

      const field = createMockField();
      const row: TableRow = { id: "1", testField: "test" };

      const result = engine.validateCell("test", field, row);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].ruleId).toBe("failing-rule");
      expect(result.errors[0].message).toContain("Validation rule failed");
    });
  });

  describe("validateRow", () => {
    it("should validate a row with multiple fields", () => {
      const fields = [
        createMockField({ name: "name", required: true }),
        createMockField({ name: "age", type: "number", required: false }),
      ];
      const targetShape = createMockTargetShape(fields);
      const row: TableRow = { id: "1", name: "John", age: 25 };

      const result = engine.validateRow(row, targetShape);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.rulesApplied).toBeGreaterThan(0);
    });

    it("should validate a row with errors in multiple fields", () => {
      const fields = [
        createMockField({ name: "name", required: true }),
        createMockField({ name: "age", type: "number", required: false }),
      ];
      const targetShape = createMockTargetShape(fields);
      const row: TableRow = { id: "1", name: "", age: "not a number" };

      const result = engine.validateRow(row, targetShape);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2); // Required error + type error
    });
  });

  describe("validateTable", () => {
    it("should validate a table with all valid rows", () => {
      const fields = [createMockField({ name: "name", required: true })];
      const targetShape = createMockTargetShape(fields);
      const data: TableRow[] = [
        { id: "1", name: "John" },
        { id: "2", name: "Jane" },
        { id: "3", name: "Bob" },
      ];

      const state = engine.validateTable(data, targetShape);

      expect(state.isValidating).toBe(false);
      expect(state.totalRows).toBe(3);
      expect(state.validatedRows).toBe(3);
      expect(state.totalErrors).toBe(0);
      expect(state.progress).toBe(1.0);
      expect(state.summary?.validRowPercentage).toBe(100);

      // Check that validation metadata was added to rows
      expect(data[0]._validationMetadata?.status).toBe(ValidationStatus.VALID);
      expect(data[1]._validationMetadata?.status).toBe(ValidationStatus.VALID);
      expect(data[2]._validationMetadata?.status).toBe(ValidationStatus.VALID);
    });

    it("should validate a table with errors", () => {
      const fields = [createMockField({ name: "name", required: true })];
      const targetShape = createMockTargetShape(fields);
      const data: TableRow[] = [
        { id: "1", name: "John" },
        { id: "2", name: "" }, // Error: required field empty
        { id: "3", name: "Bob" },
      ];

      const state = engine.validateTable(data, targetShape);

      expect(state.totalErrors).toBe(1);
      expect(state.errorsByType[ValidationRuleType.REQUIRED]).toBe(1);
      expect(state.errorsByField["name"]).toBe(1);
      expect(state.summary?.validRowPercentage).toBeCloseTo(66.67, 2); // 2 out of 3 rows valid

      // Check validation metadata on rows
      expect(data[0]._validationMetadata?.status).toBe(ValidationStatus.VALID);
      expect(data[1]._validationMetadata?.status).toBe(ValidationStatus.ERRORS);
      expect(data[2]._validationMetadata?.status).toBe(ValidationStatus.VALID);
    });

    it("should generate summary statistics", () => {
      const fields = [
        createMockField({ name: "name", required: true }),
        createMockField({ name: "age", type: "number" }),
      ];
      const targetShape = createMockTargetShape(fields);
      const data: TableRow[] = [
        { id: "1", name: "", age: "not a number" }, // 2 errors
        { id: "2", name: "Jane", age: 25 },
      ];

      const state = engine.validateTable(data, targetShape);

      expect(state.summary?.topErrorTypes).toHaveLength(2);
      expect(state.summary?.topErrorTypes[0].count).toBe(1);
      expect(state.summary?.problematicFields).toHaveLength(2);
    });
  });

  describe("validateTableAsync", () => {
    it("should validate table asynchronously with progress", async () => {
      const fields = [createMockField({ name: "name", required: true })];
      const targetShape = createMockTargetShape(fields);
      const data: TableRow[] = Array.from({ length: 250 }, (_, i) => ({
        id: String(i + 1),
        name: `User ${i + 1}`,
      }));

      const progressCallback: ValidationProgressCallback = vi.fn();

      const state = await engine.validateTableAsync(data, targetShape, progressCallback);

      expect(state.totalRows).toBe(250);
      expect(state.validatedRows).toBe(250);
      expect(state.progress).toBe(1.0);
      expect(progressCallback).toHaveBeenCalled();

      // Check that last call was completion
      const lastCall = progressCallback.mock.calls[progressCallback.mock.calls.length - 1];
      expect(lastCall[0]).toBe(1.0); // progress
      expect(lastCall[3]).toBe("Validation complete"); // message
    });

    it("should handle async validation without progress callback", async () => {
      const fields = [createMockField({ name: "name", required: true })];
      const targetShape = createMockTargetShape(fields);
      const data: TableRow[] = [
        { id: "1", name: "John" },
        { id: "2", name: "Jane" },
      ];

      const state = await engine.validateTableAsync(data, targetShape);

      expect(state.totalRows).toBe(2);
      expect(state.validatedRows).toBe(2);
      expect(state.isValidating).toBe(false);
    });
  });
});

describe("defaultValidationEngine", () => {
  it("should provide a default validation engine instance", () => {
    expect(defaultValidationEngine).toBeInstanceOf(ValidationEngine);
    expect(defaultValidationEngine.getRuleRegistry()).toBeInstanceOf(ValidationRuleRegistry);
  });
});