/**
 * Validation Rules Barrel Export
 * 
 * Central export point for all validation rules in the validation system.
 * Import validation rules from this file to ensure consistent access.
 * 
 * @module lib/utils/validation-rules
 */

// Core validation rules
export { RequiredFieldRule } from "./required-field-rule";

// Re-export validation engine components for convenience
export {
  BaseValidationRule,
  ValidationEngine,
  ValidationRuleRegistry,
  defaultValidationEngine,
  type ValidationProgressCallback,
} from "../validation-engine";

// Re-export validation types for convenience
export * from "../../types/validation";