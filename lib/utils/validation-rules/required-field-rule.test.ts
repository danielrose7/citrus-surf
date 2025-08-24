import { describe, it, expect, beforeEach } from "vitest";
import { RequiredFieldRule } from "./required-field-rule";
import {
  ValidationRuleType,
  ValidationSeverity,
  type ValidationContext,
} from "../../types/validation";
import type { TargetField } from "../../types/target-shapes";

describe("RequiredFieldRule", () => {
  let rule: RequiredFieldRule;

  beforeEach(() => {
    rule = new RequiredFieldRule();
  });

  const createMockField = (overrides?: Partial<TargetField>): TargetField => ({
    id: "test-field",
    name: "testField",
    type: "string",
    required: true,
    description: "Test field",
    validation: [],
    transformation: [],
    ...overrides,
  });

  const createMockContext = (overrides?: Partial<ValidationContext>): ValidationContext => ({
    rowData: { id: "1", testField: "test" },
    fieldDefinition: createMockField(),
    ...overrides,
  });

  describe("constructor", () => {
    it("should create rule with correct properties", () => {
      expect(rule.id).toBe("required-field");
      expect(rule.type).toBe(ValidationRuleType.REQUIRED);
      expect(rule.description).toBe("Required field validation");
      expect(rule.enabled).toBe(true);
    });
  });

  describe("shouldApplyToField", () => {
    it("should return true for required fields", () => {
      const field = createMockField({ required: true });
      expect(rule.shouldApplyToField(field)).toBe(true);
    });

    it("should return false for optional fields", () => {
      const field = createMockField({ required: false });
      expect(rule.shouldApplyToField(field)).toBe(false);
    });

    it("should return false when rule is disabled", () => {
      rule.enabled = false;
      const field = createMockField({ required: true });
      expect(rule.shouldApplyToField(field)).toBe(false);
    });
  });

  describe("validate - null and undefined values", () => {
    it("should return error for null values in required field", () => {
      const field = createMockField({ required: true });
      const context = createMockContext();
      
      const result = rule.validate(null, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].ruleId).toBe("required-field");
      expect(result.errors[0].ruleType).toBe(ValidationRuleType.REQUIRED);
      expect(result.errors[0].severity).toBe(ValidationSeverity.ERROR);
      expect(result.errors[0].fieldName).toBe("testField");
      expect(result.errors[0].currentValue).toBe(null);
    });

    it("should return error for undefined values in required field", () => {
      const field = createMockField({ required: true });
      const context = createMockContext();
      
      const result = rule.validate(undefined, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe("testField is required but is empty");
    });

    it("should return valid for null values in optional field", () => {
      const field = createMockField({ required: false });
      const context = createMockContext();
      
      const result = rule.validate(null, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validate - string values", () => {
    it("should return error for empty strings in required field", () => {
      const field = createMockField({ required: true });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe("testField is required but is empty");
    });

    it("should return error for whitespace-only strings in required field", () => {
      const field = createMockField({ required: true });
      const context = createMockContext();
      
      const result = rule.validate("   ", field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should return error for tab and newline whitespace", () => {
      const field = createMockField({ required: true });
      const context = createMockContext();
      
      const result = rule.validate("\t\n\r ", field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should return valid for non-empty strings", () => {
      const field = createMockField({ required: true });
      const context = createMockContext();
      
      const result = rule.validate("valid value", field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return valid for strings with content surrounded by whitespace", () => {
      const field = createMockField({ required: true });
      const context = createMockContext();
      
      const result = rule.validate("  valid  ", field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validate - number values", () => {
    it("should return error for NaN in required field", () => {
      const field = createMockField({ required: true, type: "number" });
      const context = createMockContext();
      
      const result = rule.validate(NaN, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should return valid for zero in required field", () => {
      const field = createMockField({ required: true, type: "number" });
      const context = createMockContext();
      
      const result = rule.validate(0, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return valid for negative numbers in required field", () => {
      const field = createMockField({ required: true, type: "number" });
      const context = createMockContext();
      
      const result = rule.validate(-42, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validate - boolean values", () => {
    it("should return valid for false in required field", () => {
      const field = createMockField({ required: true, type: "boolean" });
      const context = createMockContext();
      
      const result = rule.validate(false, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return valid for true in required field", () => {
      const field = createMockField({ required: true, type: "boolean" });
      const context = createMockContext();
      
      const result = rule.validate(true, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validate - array values", () => {
    it("should return error for empty arrays in required field", () => {
      const field = createMockField({ required: true, type: "enum" });
      const context = createMockContext();
      
      const result = rule.validate([], field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should return valid for non-empty arrays", () => {
      const field = createMockField({ required: true, type: "enum" });
      const context = createMockContext();
      
      const result = rule.validate(["item"], field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validate - object values", () => {
    it("should return valid for objects in required field", () => {
      const field = createMockField({ required: true });
      const context = createMockContext();
      
      const result = rule.validate({ key: "value" }, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return valid for empty objects in required field", () => {
      const field = createMockField({ required: true });
      const context = createMockContext();
      
      const result = rule.validate({}, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("error messages - contextual by field type", () => {
    it("should generate email-specific error message", () => {
      const field = createMockField({ required: true, type: "email", name: "email" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].message).toBe("Email address is required for email");
    });

    it("should generate phone-specific error message", () => {
      const field = createMockField({ required: true, type: "phone", name: "phone" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].message).toBe("Phone number is required for phone");
    });

    it("should generate URL-specific error message", () => {
      const field = createMockField({ required: true, type: "url", name: "website" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].message).toBe("URL is required for website");
    });

    it("should generate date-specific error message", () => {
      const field = createMockField({ required: true, type: "date", name: "birthDate" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].message).toBe("Date is required for birthDate");
    });

    it("should generate number-specific error message", () => {
      const field = createMockField({ required: true, type: "number", name: "age" });
      const context = createMockContext();
      
      const result = rule.validate(NaN, field, context);
      
      expect(result.errors[0].message).toBe("Number is required for age");
    });

    it("should generate currency-specific error message", () => {
      const field = createMockField({ required: true, type: "currency", name: "salary" });
      const context = createMockContext();
      
      const result = rule.validate(NaN, field, context);
      
      expect(result.errors[0].message).toBe("Number is required for salary");
    });

    it("should generate enum-specific error message", () => {
      const field = createMockField({ required: true, type: "enum", name: "status" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].message).toBe("Selection is required for status");
    });

    it("should generate boolean-specific error message", () => {
      const field = createMockField({ required: true, type: "boolean", name: "active" });
      const context = createMockContext();
      
      const result = rule.validate(null, field, context);
      
      expect(result.errors[0].message).toBe("Value is required for active");
    });

    it("should use display name when available", () => {
      const field = createMockField({ 
        required: true, 
        name: "firstName",
        displayName: "First Name"
      });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].message).toBe("First Name is required but is empty");
    });

    it("should fall back to field name when no display name", () => {
      const field = createMockField({ 
        required: true, 
        name: "firstName"
      });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].message).toBe("firstName is required but is empty");
    });
  });

  describe("suggested fixes", () => {
    it("should provide string field suggestion", () => {
      const field = createMockField({ required: true, type: "string", name: "name" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].suggestedFixes).toHaveLength(1);
      expect(result.errors[0].suggestedFixes[0].action).toBe("replace");
      expect(result.errors[0].suggestedFixes[0].description).toBe("Enter a value for name");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe("");
    });

    it("should provide email field suggestion", () => {
      const field = createMockField({ required: true, type: "email", name: "email" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Enter an email address for email");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe("user@example.com");
    });

    it("should provide phone field suggestion", () => {
      const field = createMockField({ required: true, type: "phone", name: "phone" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Enter a phone number for phone");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe("(555) 123-4567");
    });

    it("should provide URL field suggestion", () => {
      const field = createMockField({ required: true, type: "url", name: "website" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Enter a URL for website");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe("https://example.com");
    });

    it("should provide date field suggestion with today's date", () => {
      const field = createMockField({ required: true, type: "date", name: "birthDate" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Enter a date for birthDate");
      // Check that it's a valid date string in YYYY-MM-DD format
      expect(result.errors[0].suggestedFixes[0].newValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should provide number field suggestion with default 0", () => {
      const field = createMockField({ required: true, type: "number", name: "age" });
      const context = createMockContext();
      
      const result = rule.validate(NaN, field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Enter a number for age");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe(0);
    });

    it("should provide number field suggestion with minimum value when defined", () => {
      const field = createMockField({ 
        required: true, 
        type: "number", 
        name: "age",
        validation: [{ type: "min", value: 18, message: "Age must be at least 18", severity: "error" }]
      });
      const context = createMockContext();
      
      const result = rule.validate(NaN, field, context);
      
      expect(result.errors[0].suggestedFixes[0].newValue).toBe(18);
    });

    it("should provide currency field suggestion", () => {
      const field = createMockField({ required: true, type: "currency", name: "salary" });
      const context = createMockContext();
      
      const result = rule.validate(NaN, field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Enter an amount for salary");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe(0.00);
    });

    it("should provide enum field suggestion with first option", () => {
      const field = createMockField({ 
        required: true, 
        type: "enum", 
        name: "status",
        validation: [{ 
          type: "enum", 
          value: ["active", "inactive", "pending"], 
          message: "Invalid status",
          severity: "error"
        }]
      });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Select active for status");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe("active");
    });

    it("should provide generic enum field suggestion when no options defined", () => {
      const field = createMockField({ required: true, type: "enum", name: "status" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Select a value for status");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe(null);
    });

    it("should provide boolean field suggestion", () => {
      const field = createMockField({ required: true, type: "boolean", name: "active" });
      const context = createMockContext();
      
      const result = rule.validate(null, field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Select true or false for active");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe(false);
    });

    it("should use display name in suggestions when available", () => {
      const field = createMockField({ 
        required: true, 
        type: "string", 
        name: "firstName",
        displayName: "First Name"
      });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Enter a value for First Name");
    });

    it("should fall back to field name in suggestions when no display name", () => {
      const field = createMockField({ 
        required: true, 
        type: "string", 
        name: "firstName"
      });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.errors[0].suggestedFixes[0].description).toBe("Enter a value for firstName");
    });
  });

  describe("optional field handling", () => {
    it("should skip validation for optional fields", () => {
      const field = createMockField({ required: false });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should skip validation for optional fields with null values", () => {
      const field = createMockField({ required: false });
      const context = createMockContext();
      
      const result = rule.validate(null, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("performance", () => {
    it("should handle large number of validations efficiently", () => {
      const field = createMockField({ required: true });
      const context = createMockContext();
      
      const startTime = Date.now();
      
      // Run 1000 validations
      for (let i = 0; i < 1000; i++) {
        rule.validate(i % 2 === 0 ? "valid" : "", field, context);
      }
      
      const duration = Date.now() - startTime;
      
      // Should complete 1000 validations in under 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});