/**
 * Integration tests for validation functionality in tableSlice
 */

import { configureStore } from "@reduxjs/toolkit";
import tableReducer, {
  validateTableData,
  validateCell,
  setData,
  updateCell,
  clearValidation,
  type TableRow,
} from "./tableSlice";
import { TargetShape } from "../types/target-shapes";
import { ValidationSeverity } from "../types/validation";

describe("TableSlice Validation Integration", () => {
  let store: ReturnType<typeof configureStore>;

  const sampleTargetShape: TargetShape = {
    id: "test-shape",
    name: "Test Shape",
    version: "1.0.0",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    fields: [
      {
        id: "field1",
        name: "name",
        type: "string",
        required: true,
        validationRules: [],
        transformationRules: [],
      },
      {
        id: "field2", 
        name: "age",
        type: "integer",
        required: false,
        validationRules: [],
        transformationRules: [],
      },
    ],
  };

  const sampleData: TableRow[] = [
    { id: "1", name: "John", age: 30 },
    { id: "2", name: "", age: "invalid" }, // Has validation errors
    { id: "3", name: "Jane", age: 25 },
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        table: tableReducer,
      },
    });
  });

  describe("Table Validation", () => {
    it("should handle validateTableData async thunk", async () => {
      // Set initial data
      store.dispatch(setData(sampleData));

      // Validate the table
      const result = await store.dispatch(
        validateTableData({
          data: sampleData,
          targetShape: sampleTargetShape,
        })
      );

      const state = store.getState().table;
      
      // Should complete validation
      expect(state.validation.isValidating).toBe(false);
      
      // Async thunk should have been fulfilled
      if (result.type === 'table/validateTableData/rejected') {
        console.error('Validation failed:', result.error);
      }
      expect(result.type).toBe('table/validateTableData/fulfilled');
      
      // Basic validation structure should be maintained
      expect(typeof state.validation.totalRows).toBe('number');
      expect(typeof state.validation.validatedRows).toBe('number');
      expect(typeof state.validation.progress).toBe('number');
    });

    it("should handle validation progress updates", async () => {
      store.dispatch(setData(sampleData));

      let progressUpdates: number[] = [];
      
      const unsubscribe = store.subscribe(() => {
        const state = store.getState().table;
        if (state.validation.isValidating) {
          progressUpdates.push(state.validation.progress);
        }
      });

      await store.dispatch(
        validateTableData({
          data: sampleData,
          targetShape: sampleTargetShape,
        })
      );

      unsubscribe();
      
      // Should have received progress updates
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0]).toBe(0); // Started at 0
    });
  });

  describe("Cell Validation", () => {
    it("should handle validateCell async thunk", async () => {
      store.dispatch(setData(sampleData));

      // Validate a specific cell
      await store.dispatch(
        validateCell({
          rowId: "1",
          columnId: "name",
          value: "John",
          targetShape: sampleTargetShape,
        })
      );

      const state = store.getState().table;
      const row = state.data.find(r => r.id === "1");
      
      // Should have validation metadata for the cell
      expect(row?._validationMetadata).toBeDefined();
      expect(row?._validationMetadata?.cellValidations["name"]).toBeDefined();
    });

    it("should clear cell validation when cell is updated", () => {
      // Set up initial data with validation metadata
      const dataWithValidation: TableRow[] = [{
        id: "1",
        name: "John",
        age: 30,
        _validationMetadata: {
          hasErrors: true,
          hasWarnings: false,
          errorCount: 1,
          warningCount: 0,
          lastValidated: new Date().toISOString(),
          cellValidations: {
            name: {
              isValid: false,
              severity: ValidationSeverity.ERROR,
              message: "Test error",
              suggestedFixes: [],
            },
          },
        },
      }];

      store.dispatch(setData(dataWithValidation));

      // Update the cell
      store.dispatch(updateCell({
        rowId: "1",
        columnId: "name",
        value: "Updated Name",
      }));

      const state = store.getState().table;
      const row = state.data.find(r => r.id === "1");
      
      // Should clear validation for the updated cell
      expect(row?._validationMetadata?.cellValidations["name"]).toBeUndefined();
      expect(row?._validationMetadata?.hasErrors).toBe(false);
      expect(row?._validationMetadata?.errorCount).toBe(0);
    });
  });

  describe("Validation State Management", () => {
    it("should clear all validation data", () => {
      // Set up data with validation
      const dataWithValidation: TableRow[] = [{
        id: "1",
        name: "John",
        _validationMetadata: {
          hasErrors: true,
          hasWarnings: false,
          errorCount: 1,
          warningCount: 0,
          lastValidated: new Date().toISOString(),
          cellValidations: {},
        },
      }];

      store.dispatch(setData(dataWithValidation));

      // Clear validation
      store.dispatch(clearValidation());

      const state = store.getState().table;
      const row = state.data.find(r => r.id === "1");
      
      // Should clear all validation data
      expect(state.validation.totalRows).toBe(0);
      expect(state.validation.validatedRows).toBe(0);
      expect(row?._validationMetadata).toBeUndefined();
    });

    it("should maintain validation state structure", () => {
      const state = store.getState().table;
      
      // Should have proper validation state structure
      expect(state.validation).toBeDefined();
      expect(typeof state.validation.isValidating).toBe("boolean");
      expect(typeof state.validation.progress).toBe("number");
      expect(typeof state.validation.totalRows).toBe("number");
      expect(typeof state.validation.validatedRows).toBe("number");
    });
  });
});