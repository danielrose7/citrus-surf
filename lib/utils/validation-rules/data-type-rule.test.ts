import { describe, it, expect, beforeEach } from "vitest";
import { DataTypeRule } from "./data-type-rule";
import {
  ValidationRuleType,
  ValidationSeverity,
  type ValidationContext,
} from "../../types/validation";
import type { TargetField } from "../../types/target-shapes";

describe("DataTypeRule", () => {
  let rule: DataTypeRule;

  beforeEach(() => {
    rule = new DataTypeRule();
  });

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

  const createMockContext = (overrides?: Partial<ValidationContext>): ValidationContext => ({
    rowData: { id: "1", testField: "test" },
    fieldDefinition: createMockField(),
    ...overrides,
  });

  describe("constructor", () => {
    it("should create rule with correct properties", () => {
      expect(rule.id).toBe("data-type");
      expect(rule.type).toBe(ValidationRuleType.TYPE);
      expect(rule.description).toBe("Data type validation with Zod");
      expect(rule.enabled).toBe(true);
    });
  });

  describe("shouldApplyToField", () => {
    it("should return true for all fields when enabled", () => {
      const field = createMockField();
      expect(rule.shouldApplyToField(field)).toBe(true);
    });

    it("should return false when rule is disabled", () => {
      rule.enabled = false;
      const field = createMockField();
      expect(rule.shouldApplyToField(field)).toBe(false);
    });
  });

  describe("null/undefined handling", () => {
    it("should skip validation for null values", () => {
      const field = createMockField({ type: "string" });
      const context = createMockContext();
      
      const result = rule.validate(null, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should skip validation for undefined values", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate(undefined, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("string type validation", () => {
    it("should accept string values", () => {
      const field = createMockField({ type: "string" });
      const context = createMockContext();
      
      const result = rule.validate("hello", field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should convert numbers to strings", () => {
      const field = createMockField({ type: "string" });
      const context = createMockContext();
      
      const result = rule.validate(123, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.typeConversion?.performed).toBe(true);
      expect(result.metadata?.typeConversion?.convertedValue).toBe("123");
    });

    it("should convert objects to strings", () => {
      const field = createMockField({ type: "string" });
      const context = createMockContext();
      
      const result = rule.validate({ key: "value" }, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.typeConversion?.performed).toBe(true);
    });
  });

  describe("number type validation", () => {
    it("should accept valid numbers", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate(123.45, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should convert numeric strings to numbers", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate("123.45", field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.typeConversion?.performed).toBe(true);
      expect(result.metadata?.typeConversion?.convertedValue).toBe(123.45);
    });

    it("should reject NaN values", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate(NaN, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain("expected number");
    });

    it("should reject Infinity values", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate(Infinity, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should reject non-numeric strings", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate("not a number", field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].suggestedFixes).toHaveLength(0); // No conversion available
    });

    it("should handle empty strings", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate("", field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("integer type validation", () => {
    it("should accept whole numbers", () => {
      const field = createMockField({ type: "integer" });
      const context = createMockContext();
      
      const result = rule.validate(42, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should convert integer strings", () => {
      const field = createMockField({ type: "integer" });
      const context = createMockContext();
      
      const result = rule.validate("42", field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.typeConversion?.performed).toBe(true);
    });

    it("should reject decimal numbers", () => {
      const field = createMockField({ type: "integer" });
      const context = createMockContext();
      
      const result = rule.validate(42.5, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].suggestedFixes[0].description).toContain("Round");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe(43);
    });

    it("should reject decimal strings", () => {
      const field = createMockField({ type: "integer" });
      const context = createMockContext();
      
      const result = rule.validate("42.5", field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("date type validation", () => {
    it("should accept Date objects", () => {
      const field = createMockField({ type: "date" });
      const context = createMockContext();
      const date = new Date("2023-12-25");
      
      const result = rule.validate(date, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should convert valid date strings", () => {
      const field = createMockField({ type: "date" });
      const context = createMockContext();
      
      const result = rule.validate("2023-12-25", field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.typeConversion?.performed).toBe(true);
      expect(result.metadata?.typeConversion?.convertedValue).toBeInstanceOf(Date);
    });

    it("should reject invalid Date objects", () => {
      const field = createMockField({ type: "date" });
      const context = createMockContext();
      const invalidDate = new Date("invalid");
      
      const result = rule.validate(invalidDate, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should reject invalid date strings", () => {
      const field = createMockField({ type: "date" });
      const context = createMockContext();
      
      const result = rule.validate("not a date", field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain("valid date");
    });

    it("should handle various date formats", () => {
      const field = createMockField({ type: "date" });
      const context = createMockContext();
      
      const validDates = [
        "2023-12-25",
        "12/25/2023",
        "Dec 25, 2023",
        "2023-12-25T10:30:00Z",
      ];

      for (const dateStr of validDates) {
        const result = rule.validate(dateStr, field, context);
        expect(result.isValid).toBe(true, `Should accept date: ${dateStr}`);
      }
    });
  });

  describe("boolean type validation", () => {
    it("should accept boolean values", () => {
      const field = createMockField({ type: "boolean" });
      const context = createMockContext();
      
      const resultTrue = rule.validate(true, field, context);
      const resultFalse = rule.validate(false, field, context);
      
      expect(resultTrue.isValid).toBe(true);
      expect(resultFalse.isValid).toBe(true);
    });

    it("should convert truthy strings", () => {
      const field = createMockField({ type: "boolean" });
      const context = createMockContext();
      
      const truthyValues = ["true", "TRUE", "yes", "YES", "1", "on", "ON"];
      
      for (const value of truthyValues) {
        const result = rule.validate(value, field, context);
        expect(result.isValid).toBe(true, `Should convert ${value} to true`);
        expect(result.metadata?.typeConversion?.convertedValue).toBe(true);
      }
    });

    it("should convert falsy strings", () => {
      const field = createMockField({ type: "boolean" });
      const context = createMockContext();
      
      const falsyValues = ["false", "FALSE", "no", "NO", "0", "off", "OFF"];
      
      for (const value of falsyValues) {
        const result = rule.validate(value, field, context);
        expect(result.isValid).toBe(true, `Should convert ${value} to false`);
        expect(result.metadata?.typeConversion?.convertedValue).toBe(false);
      }
    });

    it("should convert numeric values", () => {
      const field = createMockField({ type: "boolean" });
      const context = createMockContext();
      
      const result1 = rule.validate(1, field, context);
      const result0 = rule.validate(0, field, context);
      
      expect(result1.isValid).toBe(true);
      expect(result1.metadata?.typeConversion?.convertedValue).toBe(true);
      
      expect(result0.isValid).toBe(true);
      expect(result0.metadata?.typeConversion?.convertedValue).toBe(false);
    });

    it("should reject other numeric values", () => {
      const field = createMockField({ type: "boolean" });
      const context = createMockContext();
      
      const result = rule.validate(42, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should reject other string values", () => {
      const field = createMockField({ type: "boolean" });
      const context = createMockContext();
      
      const result = rule.validate("maybe", field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("email type validation", () => {
    it("should accept valid email addresses", () => {
      const field = createMockField({ type: "email" });
      const context = createMockContext();
      
      const validEmails = [
        "user@example.com",
        "test.email@domain.org",
        "user+tag@example.co.uk",
        "123@456.com",
      ];

      for (const email of validEmails) {
        const result = rule.validate(email, field, context);
        expect(result.isValid).toBe(true, `Should accept email: ${email}`);
      }
    });

    it("should normalize email addresses", () => {
      const field = createMockField({ type: "email" });
      const context = createMockContext();
      
      const result = rule.validate("  USER@EXAMPLE.COM  ", field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.metadata?.typeConversion?.convertedValue).toBe("user@example.com");
    });

    it("should reject invalid email addresses", () => {
      const field = createMockField({ type: "email" });
      const context = createMockContext();
      
      const invalidEmails = [
        "not-an-email",
        "@example.com",
        "user@",
        "user@@example.com",
        "user@.com",
        "",
      ];

      for (const email of invalidEmails) {
        const result = rule.validate(email, field, context);
        expect(result.isValid).toBe(false, `Should reject email: ${email}`);
        expect(result.errors[0].message).toContain("valid email");
      }
    });

    it("should reject non-string values", () => {
      const field = createMockField({ type: "email" });
      const context = createMockContext();
      
      const result = rule.validate(123, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("phone type validation", () => {
    it("should accept valid phone numbers", () => {
      const field = createMockField({ type: "phone" });
      const context = createMockContext();
      
      const validPhones = [
        "1234567890",
        "(555) 123-4567",
        "555-123-4567",
        "+1-555-123-4567",
        "555.123.4567",
      ];

      for (const phone of validPhones) {
        const result = rule.validate(phone, field, context);
        expect(result.isValid).toBe(true, `Should accept phone: ${phone}`);
      }
    });

    it("should normalize phone numbers", () => {
      const field = createMockField({ type: "phone" });
      const context = createMockContext();
      
      const result = rule.validate("(555) 123-4567", field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.metadata?.typeConversion?.convertedValue).toBe("5551234567");
    });

    it("should reject invalid phone numbers", () => {
      const field = createMockField({ type: "phone" });
      const context = createMockContext();
      
      const invalidPhones = [
        "123", // too short
        "12345678901234567890", // too long
        "abc-def-ghij",
        "",
        "phone number",
      ];

      for (const phone of invalidPhones) {
        const result = rule.validate(phone, field, context);
        expect(result.isValid).toBe(false, `Should reject phone: ${phone}`);
        expect(result.errors[0].message).toContain("valid phone");
      }
    });

    it("should reject non-string values", () => {
      const field = createMockField({ type: "phone" });
      const context = createMockContext();
      
      const result = rule.validate(1234567890, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("url type validation", () => {
    it("should accept valid URLs", () => {
      const field = createMockField({ type: "url" });
      const context = createMockContext();
      
      const validUrls = [
        "https://example.com",
        "http://www.example.org",
        "https://sub.domain.com/path?query=value",
        "ftp://files.example.com",
      ];

      for (const url of validUrls) {
        const result = rule.validate(url, field, context);
        expect(result.isValid).toBe(true, `Should accept URL: ${url}`);
      }
    });

    it("should add protocol to domain-like strings", () => {
      const field = createMockField({ type: "url" });
      const context = createMockContext();
      
      const result = rule.validate("example.com", field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.metadata?.typeConversion?.convertedValue).toBe("https://example.com");
    });

    it("should reject invalid URLs", () => {
      const field = createMockField({ type: "url" });
      const context = createMockContext();
      
      const invalidUrls = [
        "not-a-url",
        "://missing-protocol",
        "https://",
        "",
        "just text",
      ];

      for (const url of invalidUrls) {
        const result = rule.validate(url, field, context);
        expect(result.isValid).toBe(false, `Should reject URL: ${url}`);
        expect(result.errors[0].message).toContain("valid URL");
      }
    });

    it("should reject non-string values", () => {
      const field = createMockField({ type: "url" });
      const context = createMockContext();
      
      const result = rule.validate(123, field, context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("currency type validation", () => {
    it("should accept numeric values", () => {
      const field = createMockField({ type: "currency" });
      const context = createMockContext();
      
      const result = rule.validate(123.45, field, context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should parse currency strings", () => {
      const field = createMockField({ type: "currency" });
      const context = createMockContext();
      
      const currencyValues = [
        "$123.45",
        "£99.99",
        "€50.00",
        "¥1000",
        "$1,234.56",
        "123.45",
      ];

      for (const value of currencyValues) {
        const result = rule.validate(value, field, context);
        expect(result.isValid).toBe(true, `Should accept currency: ${value}`);
        expect(result.metadata?.typeConversion?.performed).toBe(true);
      }
    });

    it("should reject invalid currency values", () => {
      const field = createMockField({ type: "currency" });
      const context = createMockContext();
      
      const invalidCurrency = [
        "not a number",
        "$abc",
        "",
        "multiple$symbols$",
      ];

      for (const value of invalidCurrency) {
        const result = rule.validate(value, field, context);
        expect(result.isValid).toBe(false, `Should reject currency: ${value}`);
        expect(result.errors[0].message).toContain("valid currency");
      }
    });

    it("should reject NaN and Infinity", () => {
      const field = createMockField({ type: "currency" });
      const context = createMockContext();
      
      const nanResult = rule.validate(NaN, field, context);
      const infResult = rule.validate(Infinity, field, context);
      
      expect(nanResult.isValid).toBe(false);
      expect(infResult.isValid).toBe(false);
    });
  });

  describe("error messages", () => {
    it("should generate field-specific error messages", () => {
      const field = createMockField({ 
        type: "email", 
        name: "userEmail",
        displayName: "Email Address"
      });
      const context = createMockContext();
      
      const result = rule.validate("invalid-email", field, context);
      
      expect(result.errors[0].message).toContain("Email Address must be a valid email");
      expect(result.errors[0].message).toContain("invalid-email");
    });

    it("should include error metadata", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate("not-a-number", field, context);
      
      expect(result.errors[0].metadata?.expectedType).toBe("number");
      expect(result.errors[0].metadata?.actualType).toBe("string");
      expect(result.errors[0].metadata?.zodError).toBeDefined();
    });

    it("should include severity", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate("invalid", field, context);
      
      expect(result.errors[0].severity).toBe(ValidationSeverity.ERROR);
    });
  });

  describe("suggested fixes", () => {
    it("should suggest string conversion", () => {
      const field = createMockField({ type: "string" });
      const context = createMockContext();
      
      const result = rule.validate(123, field, context);
      
      // Should not error since string conversion always works
      expect(result.isValid).toBe(true);
    });

    it("should suggest number conversion for valid numeric strings", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate("123.45", field, context);
      
      // Valid numeric strings should convert successfully
      expect(result.isValid).toBe(true);
      expect(result.metadata?.typeConversion?.performed).toBe(true);
    });

    it("should not suggest conversion for invalid strings", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const result = rule.validate("not a number", field, context);
      
      expect(result.errors[0].suggestedFixes).toHaveLength(0); // No conversion available
    });

    it("should suggest integer rounding", () => {
      const field = createMockField({ type: "integer" });
      const context = createMockContext();
      
      const result = rule.validate(42.7, field, context);
      
      expect(result.errors[0].suggestedFixes[0].action).toBe("convert");
      expect(result.errors[0].suggestedFixes[0].description).toContain("Round");
      expect(result.errors[0].suggestedFixes[0].newValue).toBe(43);
    });

    it("should suggest format examples", () => {
      const field = createMockField({ type: "email", displayName: "Email" });
      const context = createMockContext();
      
      const result = rule.validate("invalid", field, context);
      
      expect(result.errors[0].suggestedFixes[0].action).toBe("format");
      expect(result.errors[0].suggestedFixes[0].description).toContain("user@domain.com");
    });
  });

  describe("performance", () => {
    it("should handle large number of validations efficiently", () => {
      const field = createMockField({ type: "number" });
      const context = createMockContext();
      
      const startTime = Date.now();
      
      // Run 1000 validations
      for (let i = 0; i < 1000; i++) {
        rule.validate(i % 2 === 0 ? 123 : "123", field, context);
      }
      
      const duration = Date.now() - startTime;
      
      // Should complete 1000 validations in under 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});