/**
 * Data Type Validation Rule
 * 
 * Validates that values match the expected field types using Zod schemas
 * with intelligent type conversion and format validation.
 * 
 * @module lib/utils/validation-rules/data-type-rule
 */

import { z } from "zod";
import {
  BaseValidationRule,
} from "../validation-engine";
import {
  ValidationRuleType,
  ValidationSeverity,
  createEmptyValidationResult,
  type ValidationResult,
  type ValidationContext,
  type SuggestedFix,
} from "../../types/validation";
import type { TargetField, FieldType } from "../../types/target-shapes";

/**
 * Zod schema factory for field types
 */
class ZodSchemaFactory {
  /**
   * Creates a Zod schema for the given field type
   */
  static createSchema(fieldType: FieldType): z.ZodSchema {
    switch (fieldType) {
      case "string":
        return z.preprocess(
          (val) => val != null ? String(val) : val,
          z.string()
        );

      case "number":
        return z.preprocess(
          (val) => {
            if (typeof val === "string") {
              const trimmed = val.trim();
              if (trimmed === "") return val; // Keep empty strings as-is for error
              const num = Number(trimmed);
              return isNaN(num) || !isFinite(num) ? val : num;
            }
            return val;
          },
          z.number().finite()
        );

      case "integer":
        return z.preprocess(
          (val) => {
            if (typeof val === "string") {
              const trimmed = val.trim();
              if (trimmed === "") return val;
              const num = Number(trimmed);
              return isNaN(num) || !isFinite(num) ? val : num;
            }
            return val;
          },
          z.number().int()
        );

      case "date":
        return z.preprocess(
          (val) => {
            if (val instanceof Date) return val;
            if (typeof val === "string") {
              const date = new Date(val);
              return isNaN(date.getTime()) ? val : date;
            }
            return val;
          },
          z.date()
        );

      case "boolean":
        return z.preprocess(
          (val) => {
            if (typeof val === "boolean") return val;
            if (typeof val === "string") {
              const lower = val.toLowerCase().trim();
              if (["true", "yes", "1", "on"].includes(lower)) return true;
              if (["false", "no", "0", "off"].includes(lower)) return false;
            }
            if (typeof val === "number") {
              if (val === 1) return true;
              if (val === 0) return false;
            }
            return val;
          },
          z.boolean()
        );

      case "email":
        return z.preprocess(
          (val) => typeof val === "string" ? val.trim().toLowerCase() : val,
          z.string().email()
        );

      case "phone":
        return z.preprocess(
          (val) => {
            if (typeof val === "string") {
              const cleaned = val.replace(/[\s\-\(\)\+\.]/g, "");
              return /^\d{7,15}$/.test(cleaned) ? cleaned : val;
            }
            return val;
          },
          z.string().regex(/^\d{7,15}$/, "Must be a valid phone number")
        );

      case "url":
        return z.preprocess(
          (val) => {
            if (typeof val === "string") {
              const trimmed = val.trim();
              // Try as-is first
              try {
                new URL(trimmed);
                return trimmed;
              } catch {
                // Try adding https:// if it looks like a domain
                if (!trimmed.includes("://") && trimmed.includes(".")) {
                  try {
                    new URL(`https://${trimmed}`);
                    return `https://${trimmed}`;
                  } catch {
                    return val;
                  }
                }
              }
            }
            return val;
          },
          z.string().url()
        );

      case "currency":
        return z.preprocess(
          (val) => {
            if (typeof val === "number") {
              return isNaN(val) || !isFinite(val) ? val : val;
            }
            if (typeof val === "string") {
              const cleaned = val.replace(/[$£€¥₹,\s]/g, "");
              if (cleaned === "") return val;
              const num = Number(cleaned);
              return isNaN(num) || !isFinite(num) ? val : num;
            }
            return val;
          },
          z.number().finite()
        );

      default:
        return z.any();
    }
  }
}

/**
 * Data Type Validation Rule using Zod schemas
 * 
 * Validates field values match expected types with intelligent conversion and robust error handling.
 */
export class DataTypeRule extends BaseValidationRule {
  constructor() {
    super("data-type", ValidationRuleType.TYPE, "Data type validation with Zod");
  }

  /**
   * Validates that a value matches the expected field type using Zod
   * 
   * @param value - The value to validate
   * @param field - The target field definition
   * @param context - Additional validation context
   * @returns ValidationResult with any errors
   */
  validate(
    value: any,
    field: TargetField,
    context: ValidationContext
  ): ValidationResult {
    const result = createEmptyValidationResult();

    // Skip validation for null/undefined values (handled by required validation)
    if (value === null || value === undefined) {
      return result;
    }

    const schema = ZodSchemaFactory.createSchema(field.type);
    const originalValue = value;
    
    try {
      const validatedValue = schema.parse(value);
      
      // Check if conversion occurred
      const conversionOccurred = validatedValue !== originalValue;
      if (conversionOccurred) {
        result.metadata = {
          validatedAt: new Date().toISOString(),
          validationVersion: "1.0.0",
          typeConversion: {
            performed: true,
            originalValue,
            convertedValue: validatedValue,
            method: "zod-preprocessing",
          },
        };
      }
      
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const currentType = this.getValueType(value);
        
        result.isValid = false;
        result.errors.push({
          ruleId: this.id,
          ruleType: this.type,
          severity: ValidationSeverity.ERROR,
          message: this.generateErrorMessage(field.type, currentType, value, field, error),
          fieldName: field.name,
          currentValue: value,
          suggestedFixes: this.createTypeSuggestedFixes(value, field, context),
          metadata: {
            expectedType: field.type,
            actualType: currentType,
            zodError: error.issues?.[0] || error.message,
          },
        });
      }
      
      return result;
    }
  }

  /**
   * Gets a human-readable type name for a value
   */
  private getValueType(value: any): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (Array.isArray(value)) return "array";
    if (value instanceof Date) return "Date";
    
    const type = typeof value;
    if (type === "object") return "object";
    return type;
  }

  /**
   * Generates a descriptive error message for type mismatches using Zod errors
   */
  private generateErrorMessage(
    expectedType: FieldType,
    actualType: string,
    value: any,
    field: TargetField,
    zodError?: z.ZodError
  ): string {
    const fieldDisplayName = field.displayName || field.name;
    
    // Special messages for common type mismatches
    switch (expectedType) {
      case "email":
        return `${fieldDisplayName} must be a valid email address, got ${actualType}: "${value}"`;
      case "phone":
        return `${fieldDisplayName} must be a valid phone number, got ${actualType}: "${value}"`;
      case "url":
        return `${fieldDisplayName} must be a valid URL, got ${actualType}: "${value}"`;
      case "date":
        return `${fieldDisplayName} must be a valid date, got ${actualType}: "${value}"`;
      case "currency":
        return `${fieldDisplayName} must be a valid currency amount, got ${actualType}: "${value}"`;
      case "integer":
        return `${fieldDisplayName} must be a whole number, got ${actualType}: "${value}"`;
      default:
        return `${fieldDisplayName} expected ${expectedType}, got ${actualType}: "${value}"`;
    }
  }

  /**
   * Creates suggested fixes for type conversion errors
   */
  private createTypeSuggestedFixes(
    value: any,
    field: TargetField,
    context: ValidationContext
  ): SuggestedFix[] {
    const fixes: SuggestedFix[] = [];
    const fieldDisplayName = field.displayName || field.name;

    switch (field.type) {
      case "string":
        fixes.push({
          action: "convert",
          description: `Convert to text: "${String(value)}"`,
          newValue: String(value),
        });
        break;

      case "number":
        if (typeof value === "string" && value.trim() !== "") {
          const converted = Number(value.trim());
          if (!isNaN(converted) && isFinite(converted)) {
            fixes.push({
              action: "convert",
              description: `Convert "${value}" to number`,
              newValue: converted,
            });
          }
        }
        break;

      case "integer":
        if (typeof value === "number" && !Number.isInteger(value)) {
          fixes.push({
            action: "convert",
            description: `Round ${value} to whole number: ${Math.round(value)}`,
            newValue: Math.round(value),
          });
        }
        break;

      case "date":
        fixes.push({
          action: "format",
          description: `Use date format YYYY-MM-DD for ${fieldDisplayName}`,
          newValue: new Date().toISOString().split("T")[0],
        });
        break;

      case "boolean":
        fixes.push({
          action: "convert",
          description: `Convert to true/false for ${fieldDisplayName}`,
          newValue: Boolean(value),
        });
        break;

      case "email":
        fixes.push({
          action: "format",
          description: `Use format: user@domain.com for ${fieldDisplayName}`,
          newValue: "user@example.com",
        });
        break;

      case "phone":
        fixes.push({
          action: "format",
          description: `Use format: (555) 123-4567 for ${fieldDisplayName}`,
          newValue: "(555) 123-4567",
        });
        break;

      case "url":
        fixes.push({
          action: "format",
          description: `Use format: https://example.com for ${fieldDisplayName}`,
          newValue: "https://example.com",
        });
        break;

      case "currency":
        fixes.push({
          action: "convert",
          description: `Use numeric format for ${fieldDisplayName}`,
          newValue: 0.00,
        });
        break;
    }

    // Context could be used in the future for more intelligent suggestions
    // such as analyzing other rows for common patterns or values
    if (context.rowData) {
      // Future enhancement: analyze context for smarter suggestions
    }

    return fixes;
  }

  /**
   * Determines if this rule should be applied to a given field
   * 
   * @param field - The target field to check
   * @returns true if the rule should be applied (always, since all fields have types)
   */
  shouldApplyToField(field: TargetField): boolean {
    // All fields have types, so this rule applies to all enabled fields
    // Field parameter available for future field-specific logic
    return this.enabled && field.type !== undefined;
  }
}