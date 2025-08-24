/**
 * Required Field Validation Rule
 * 
 * Validates that required fields are not null, undefined, empty string, or whitespace-only.
 * This is the most fundamental validation rule for data quality assurance.
 * 
 * @module lib/utils/validation-rules/required-field-rule
 */

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
import type { TargetField } from "../../types/target-shapes";

/**
 * Required Field Validation Rule
 * 
 * Checks that required fields contain non-empty values.
 * Handles null, undefined, empty strings, and whitespace-only strings.
 */
export class RequiredFieldRule extends BaseValidationRule {
  constructor() {
    super("required-field", ValidationRuleType.REQUIRED, "Required field validation");
  }

  /**
   * Validates that a required field has a non-empty value
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

    // Skip validation if field is not required
    if (!field.required) {
      return result;
    }

    // Check for empty values
    if (this.isEmpty(value, field)) {
      result.isValid = false;
      result.errors.push({
        ruleId: this.id,
        ruleType: this.type,
        severity: ValidationSeverity.ERROR,
        message: this.generateErrorMessage(field),
        fieldName: field.name,
        currentValue: value,
        suggestedFixes: [this.createSuggestedFix(value, field, context)].filter(Boolean) as SuggestedFix[],
      });
    }

    return result;
  }

  /**
   * Determines if a value is considered empty for the given field type
   * 
   * @param value - The value to check
   * @param field - The target field definition
   * @returns true if the value is empty
   */
  private isEmpty(value: any, field: TargetField): boolean {
    // Handle null and undefined
    if (value === null || value === undefined) {
      return true;
    }

    // Handle strings (including empty and whitespace-only)
    if (typeof value === "string") {
      return value.trim() === "";
    }

    // Handle arrays (empty arrays are considered empty)
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    // Handle numbers (NaN is considered empty, but 0 is valid)
    if (typeof value === "number") {
      return isNaN(value);
    }

    // Handle booleans (false is a valid value for required fields)
    if (typeof value === "boolean") {
      return false;
    }

    // Handle objects (empty objects might be considered empty depending on field type)
    if (typeof value === "object") {
      // For objects, we generally consider them valid unless they're explicitly empty
      // This might need field-type specific logic in the future
      // For now, we use the field parameter for potential future enhancements
      if (field.type === "object" && Object.keys(value).length === 0) {
        // Could add field-specific empty object detection here
        return false; // For now, empty objects are valid
      }
      return false;
    }

    // For other types, consider non-empty
    return false;
  }

  /**
   * Generates a contextual error message based on field type and display name
   * 
   * @param field - The target field definition
   * @returns Descriptive error message
   */
  private generateErrorMessage(field: TargetField): string {
    const fieldDisplayName = field.displayName || field.name;
    
    // Contextual messages based on field type
    switch (field.type) {
      case "email":
        return `Email address is required for ${fieldDisplayName}`;
      case "phone":
        return `Phone number is required for ${fieldDisplayName}`;
      case "url":
        return `URL is required for ${fieldDisplayName}`;
      case "date":
        return `Date is required for ${fieldDisplayName}`;
      case "number":
      case "currency":
        return `Number is required for ${fieldDisplayName}`;
      case "enum":
        return `Selection is required for ${fieldDisplayName}`;
      case "boolean":
        return `Value is required for ${fieldDisplayName}`;
      default:
        return `${fieldDisplayName} is required but is empty`;
    }
  }

  /**
   * Creates a suggested fix for empty required fields
   * 
   * @param value - The invalid value
   * @param field - The target field definition
   * @param context - Additional validation context
   * @returns SuggestedFix or null if no fix is available
   */
  createSuggestedFix(
    value: any,
    field: TargetField,
    context?: ValidationContext
  ): SuggestedFix | null {
    const fieldDisplayName = field.displayName || field.name;

    // Generate type-specific suggestions
    switch (field.type) {
      case "string":
        return {
          action: "replace",
          description: `Enter a value for ${fieldDisplayName}`,
          newValue: "",
        };

      case "email":
        return {
          action: "replace",
          description: `Enter an email address for ${fieldDisplayName}`,
          newValue: "user@example.com",
        };

      case "phone":
        return {
          action: "replace",
          description: `Enter a phone number for ${fieldDisplayName}`,
          newValue: "(555) 123-4567",
        };

      case "url":
        return {
          action: "replace",
          description: `Enter a URL for ${fieldDisplayName}`,
          newValue: "https://example.com",
        };

      case "date":
        return {
          action: "replace",
          description: `Enter a date for ${fieldDisplayName}`,
          newValue: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
        };

      case "number":
        // Check if field has a minimum value defined
        const minRule = field.validation?.find(rule => rule.type === "min");
        const minValue = minRule ? minRule.value : undefined;
        return {
          action: "replace",
          description: `Enter a number for ${fieldDisplayName}`,
          newValue: minValue !== undefined ? minValue : 0,
        };

      case "currency":
        return {
          action: "replace",
          description: `Enter an amount for ${fieldDisplayName}`,
          newValue: 0.00,
        };

      case "enum":
        // Suggest the first available option if enum values are defined
        const enumRule = field.validation?.find(rule => rule.type === "enum");
        if (enumRule && enumRule.value && Array.isArray(enumRule.value) && enumRule.value.length > 0) {
          return {
            action: "replace",
            description: `Select ${enumRule.value[0]} for ${fieldDisplayName}`,
            newValue: enumRule.value[0],
          };
        }
        
        // Use context to potentially suggest values from other rows
        if (context?.rowData) {
          // Future enhancement: could analyze other rows to suggest common values
          // For now, we acknowledge the context parameter is available for future use
        }
        
        return {
          action: "replace",
          description: `Select a value for ${fieldDisplayName}`,
          newValue: null,
        };

      case "boolean":
        return {
          action: "replace",
          description: `Select true or false for ${fieldDisplayName}`,
          newValue: false,
        };

      default:
        return {
          action: "replace",
          description: `Enter a value for ${fieldDisplayName}`,
          newValue: "",
        };
    }
  }

  /**
   * Determines if this rule should be applied to a given field
   * 
   * @param field - The target field to check
   * @returns true if the field is required
   */
  shouldApplyToField(field: TargetField): boolean {
    return this.enabled && field.required === true;
  }
}