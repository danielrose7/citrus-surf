/**
 * Core validation engine for the validation system
 * 
 * This module provides the main validation engine that orchestrates validation
 * rules, manages rule registry, and processes validation results for tables, rows, and cells.
 * 
 * @module lib/utils/validation-engine
 */

import type {
  ValidationRuleType,
  ValidationSeverity,
  ValidationResult,
  ValidationState,
  ValidationContext,
  SuggestedFix,
} from "../types/validation";
import type { TargetField, TargetShape } from "../types/target-shapes";
import type { TableRow } from "../features/tableSlice";
import {
  createEmptyValidationResult,
  createEmptyValidationState,
  createRowMetadata,
} from "../types/validation";

/**
 * Abstract base class for validation rules
 */
export abstract class BaseValidationRule {
  /** Unique identifier for this rule */
  public readonly id: string;
  /** Type of validation rule */
  public readonly type: ValidationRuleType;
  /** Human-readable description of what this rule validates */
  public readonly description: string;
  /** Whether this rule is enabled */
  public enabled: boolean;

  constructor(id: string, type: ValidationRuleType, description: string) {
    this.id = id;
    this.type = type;
    this.description = description;
    this.enabled = true;
  }

  /**
   * Validates a value against this rule
   * @param value - The value to validate
   * @param field - The target field definition
   * @param context - Additional validation context
   * @returns ValidationResult with any errors or warnings
   */
  abstract validate(
    value: any,
    field: TargetField,
    context: ValidationContext
  ): ValidationResult;

  /**
   * Creates a suggested fix for a validation error
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
    // Default implementation - rules can override this
    return null;
  }

  /**
   * Checks if this rule should be applied to a given field
   * @param field - The target field to check
   * @returns true if the rule should be applied
   */
  shouldApplyToField(field: TargetField): boolean {
    // Default implementation - apply to all fields
    // Individual rules can override this for more specific logic
    return this.enabled;
  }
}

/**
 * Registry for managing validation rules
 */
export class ValidationRuleRegistry {
  private rules: Map<string, BaseValidationRule> = new Map();
  private rulesByType: Map<ValidationRuleType, BaseValidationRule[]> = new Map();

  /**
   * Registers a validation rule
   * @param rule - The validation rule to register
   */
  registerRule(rule: BaseValidationRule): void {
    this.rules.set(rule.id, rule);

    // Add to type-based index
    if (!this.rulesByType.has(rule.type)) {
      this.rulesByType.set(rule.type, []);
    }
    this.rulesByType.get(rule.type)!.push(rule);
  }

  /**
   * Gets a validation rule by ID
   * @param ruleId - The rule ID to retrieve
   * @returns The validation rule or undefined if not found
   */
  getRule(ruleId: string): BaseValidationRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Gets all validation rules that should be applied to a field
   * @param field - The target field
   * @returns Array of applicable validation rules
   */
  getRulesForField(field: TargetField): BaseValidationRule[] {
    const applicableRules: BaseValidationRule[] = [];

    for (const rule of this.rules.values()) {
      if (rule.shouldApplyToField(field)) {
        applicableRules.push(rule);
      }
    }

    return applicableRules;
  }

  /**
   * Gets all rules of a specific type
   * @param ruleType - The type of rules to retrieve
   * @returns Array of rules of the specified type
   */
  getRulesByType(ruleType: ValidationRuleType): BaseValidationRule[] {
    return this.rulesByType.get(ruleType) || [];
  }

  /**
   * Gets all registered rules
   * @returns Array of all registered validation rules
   */
  getAllRules(): BaseValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Unregisters a validation rule
   * @param ruleId - The rule ID to unregister
   * @returns true if the rule was found and removed
   */
  unregisterRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    this.rules.delete(ruleId);

    // Remove from type-based index
    const typeRules = this.rulesByType.get(rule.type);
    if (typeRules) {
      const index = typeRules.indexOf(rule);
      if (index >= 0) {
        typeRules.splice(index, 1);
      }
    }

    return true;
  }

  /**
   * Clears all registered rules
   */
  clear(): void {
    this.rules.clear();
    this.rulesByType.clear();
  }
}

/**
 * Progress callback for async validation operations
 */
export type ValidationProgressCallback = (
  progress: number,
  current: number,
  total: number,
  message?: string
) => void;

/**
 * Core validation engine that orchestrates validation rules and processes results
 */
export class ValidationEngine {
  private ruleRegistry: ValidationRuleRegistry;

  constructor(ruleRegistry?: ValidationRuleRegistry) {
    this.ruleRegistry = ruleRegistry || new ValidationRuleRegistry();
  }

  /**
   * Gets the rule registry for managing validation rules
   */
  getRuleRegistry(): ValidationRuleRegistry {
    return this.ruleRegistry;
  }

  /**
   * Validates a single cell value
   * @param value - The value to validate
   * @param field - The target field definition
   * @param rowData - The complete row data for context
   * @returns ValidationResult with any errors or warnings
   */
  validateCell(
    value: any,
    field: TargetField,
    rowData: TableRow
  ): ValidationResult {
    const startTime = Date.now();
    const result = createEmptyValidationResult();
    const context: ValidationContext = {
      rowData,
      fieldDefinition: field,
    };

    const applicableRules = this.ruleRegistry.getRulesForField(field);

    for (const rule of applicableRules) {
      try {
        const ruleResult = rule.validate(value, field, context);
        
        // Merge errors and warnings
        result.errors.push(...ruleResult.errors);
        result.warnings.push(...ruleResult.warnings);

        // If any errors are found, mark as invalid
        if (ruleResult.errors.length > 0) {
          result.isValid = false;
        }
      } catch (error) {
        // Handle rule execution errors gracefully
        console.error(`Validation rule ${rule.id} failed:`, error);
        
        result.isValid = false;
        result.errors.push({
          ruleId: rule.id,
          ruleType: rule.type,
          severity: ValidationSeverity.ERROR,
          message: `Validation rule failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          fieldName: field.name,
          currentValue: value,
          suggestedFixes: [],
        });
      }
    }

    // Update metadata
    const duration = Date.now() - startTime;
    result.metadata = {
      validatedAt: new Date().toISOString(),
      validationVersion: "1.0.0",
      duration,
      rulesApplied: applicableRules.length,
    };

    return result;
  }

  /**
   * Validates a complete row
   * @param row - The table row to validate
   * @param targetShape - The target shape defining validation rules
   * @returns ValidationResult with any errors or warnings across all fields
   */
  validateRow(row: TableRow, targetShape: TargetShape): ValidationResult {
    const startTime = Date.now();
    const result = createEmptyValidationResult();
    let totalRulesApplied = 0;

    // Validate each field in the target shape
    for (const field of targetShape.fields) {
      const value = row[field.name];
      const cellResult = this.validateCell(value, field, row);

      // Merge cell results into row result
      result.errors.push(...cellResult.errors);
      result.warnings.push(...cellResult.warnings);

      if (cellResult.errors.length > 0) {
        result.isValid = false;
      }

      totalRulesApplied += cellResult.metadata.rulesApplied || 0;
    }

    // Update metadata
    const duration = Date.now() - startTime;
    result.metadata = {
      validatedAt: new Date().toISOString(),
      validationVersion: "1.0.0",
      duration,
      rulesApplied: totalRulesApplied,
    };

    return result;
  }

  /**
   * Validates an entire table synchronously
   * @param data - The table data to validate
   * @param targetShape - The target shape defining validation rules
   * @returns ValidationState with aggregated validation results
   */
  validateTable(data: TableRow[], targetShape: TargetShape): ValidationState {
    const startTime = Date.now();
    const state = createEmptyValidationState();
    
    state.isValidating = true;
    state.totalRows = data.length;

    // Validate each row
    for (const row of data) {
      const rowResult = this.validateRow(row, targetShape);
      const rowId = String(row.id || row._rowId || 'unknown');

      // Update validation metadata on the row
      row._validationMetadata = createRowMetadata(rowId, rowResult);

      // Aggregate statistics
      state.totalErrors += rowResult.errors.length;
      state.totalWarnings += rowResult.warnings.length;
      state.validatedRows++;

      // Update error/warning counts by type and field
      for (const error of rowResult.errors) {
        state.errorsByType[error.ruleType] = (state.errorsByType[error.ruleType] || 0) + 1;
        state.errorsByField[error.fieldName] = (state.errorsByField[error.fieldName] || 0) + 1;
      }

      for (const warning of rowResult.warnings) {
        state.warningsByType[warning.ruleType] = (state.warningsByType[warning.ruleType] || 0) + 1;
        state.warningsByField[warning.fieldName] = (state.warningsByField[warning.fieldName] || 0) + 1;
      }
    }

    // Finalize state
    state.isValidating = false;
    state.lastValidated = new Date().toISOString();
    state.progress = 1.0;

    // Generate summary statistics
    const validRows = data.filter(row => 
      row._validationMetadata?.status === 'valid'
    ).length;

    state.summary = {
      score: validRows / data.length,
      validRowPercentage: (validRows / data.length) * 100,
      topErrorTypes: this.getTopErrorTypes(state),
      problematicFields: this.getProblematicFields(state),
    };

    const duration = Date.now() - startTime;
    console.log(`Validation completed in ${duration}ms for ${data.length} rows`);

    return state;
  }

  /**
   * Validates an entire table asynchronously with progress callbacks
   * @param data - The table data to validate
   * @param targetShape - The target shape defining validation rules
   * @param progressCallback - Optional callback for progress updates
   * @returns Promise resolving to ValidationState
   */
  async validateTableAsync(
    data: TableRow[],
    targetShape: TargetShape,
    progressCallback?: ValidationProgressCallback
  ): Promise<ValidationState> {
    const startTime = Date.now();
    const state = createEmptyValidationState();
    
    state.isValidating = true;
    state.totalRows = data.length;

    // Process in chunks for better performance and progress reporting
    const chunkSize = Math.max(1, Math.min(100, Math.floor(data.length / 10)));

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, Math.min(i + chunkSize, data.length));

      // Validate chunk
      for (const row of chunk) {
        const rowResult = this.validateRow(row, targetShape);
        const rowId = String(row.id || row._rowId || 'unknown');

        // Update validation metadata on the row
        row._validationMetadata = createRowMetadata(rowId, rowResult);

        // Aggregate statistics
        state.totalErrors += rowResult.errors.length;
        state.totalWarnings += rowResult.warnings.length;
        state.validatedRows++;

        // Update error/warning counts by type and field
        for (const error of rowResult.errors) {
          state.errorsByType[error.ruleType] = (state.errorsByType[error.ruleType] || 0) + 1;
          state.errorsByField[error.fieldName] = (state.errorsByField[error.fieldName] || 0) + 1;
        }

        for (const warning of rowResult.warnings) {
          state.warningsByType[warning.ruleType] = (state.warningsByType[warning.ruleType] || 0) + 1;
          state.warningsByField[warning.fieldName] = (state.warningsByField[warning.fieldName] || 0) + 1;
        }
      }

      // Update progress
      state.progress = Math.min(1.0, (i + chunkSize) / data.length);

      // Call progress callback if provided
      if (progressCallback) {
        progressCallback(
          state.progress,
          state.validatedRows,
          data.length,
          `Validated ${state.validatedRows} of ${data.length} rows`
        );
      }

      // Yield control to prevent blocking the UI thread
      if (i + chunkSize < data.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Finalize state
    state.isValidating = false;
    state.lastValidated = new Date().toISOString();
    state.progress = 1.0;

    // Generate summary statistics
    const validRows = data.filter(row => 
      row._validationMetadata?.status === 'valid'
    ).length;

    state.summary = {
      score: validRows / data.length,
      validRowPercentage: (validRows / data.length) * 100,
      topErrorTypes: this.getTopErrorTypes(state),
      problematicFields: this.getProblematicFields(state),
    };

    const duration = Date.now() - startTime;
    console.log(`Async validation completed in ${duration}ms for ${data.length} rows`);

    if (progressCallback) {
      progressCallback(1.0, data.length, data.length, "Validation complete");
    }

    return state;
  }

  /**
   * Gets the most common error types from validation state
   * @param state - The validation state
   * @returns Array of top error types with counts and percentages
   */
  private getTopErrorTypes(state: ValidationState) {
    const errorTypes = Object.entries(state.errorsByType)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        type: type as ValidationRuleType,
        count,
        percentage: (count / state.totalErrors) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    return errorTypes;
  }

  /**
   * Gets the fields with the most validation issues
   * @param state - The validation state
   * @returns Array of problematic fields with error and warning counts
   */
  private getProblematicFields(state: ValidationState) {
    const allFields = new Set([
      ...Object.keys(state.errorsByField),
      ...Object.keys(state.warningsByField),
    ]);

    const problematicFields = Array.from(allFields)
      .map(fieldName => ({
        fieldName,
        errorCount: state.errorsByField[fieldName] || 0,
        warningCount: state.warningsByField[fieldName] || 0,
      }))
      .filter(field => field.errorCount > 0 || field.warningCount > 0)
      .sort((a, b) => {
        // Sort by total issues (errors weighted more heavily)
        const aTotal = a.errorCount * 2 + a.warningCount;
        const bTotal = b.errorCount * 2 + b.warningCount;
        return bTotal - aTotal;
      })
      .slice(0, 10); // Top 10

    return problematicFields;
  }
}

/**
 * Default validation engine instance
 */
export const defaultValidationEngine = new ValidationEngine();