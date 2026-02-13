import { describe, expect, it } from "vitest";
import {
  escapeSqlString,
  valueToSqlString,
  valueToJsonbExpression,
  valueToSqlStringWithCasting,
  toSnakeCase,
  generateValues,
  generateInsertLoop,
  generateUpdateLoop,
  generateUpsertLoop,
} from "./sql-generator";

describe("escapeSqlString", () => {
  it("doubles single quotes", () => {
    expect(escapeSqlString("it's")).toBe("it''s");
  });

  it("handles multiple single quotes", () => {
    expect(escapeSqlString("it's a 'test'")).toBe("it''s a ''test''");
  });

  it("returns string unchanged when no quotes", () => {
    expect(escapeSqlString("hello")).toBe("hello");
  });
});

describe("valueToSqlString", () => {
  it("returns NULL for null", () => {
    expect(valueToSqlString(null)).toBe("NULL");
  });

  it("returns NULL for undefined", () => {
    expect(valueToSqlString(undefined)).toBe("NULL");
  });

  it("wraps strings in single quotes", () => {
    expect(valueToSqlString("hello")).toBe("'hello'");
  });

  it("escapes single quotes in strings", () => {
    expect(valueToSqlString("it's")).toBe("'it''s'");
  });

  it("stringifies objects", () => {
    expect(valueToSqlString({ a: 1 })).toBe("'{\"a\":1}'");
  });

  it("stringifies arrays", () => {
    expect(valueToSqlString([1, 2])).toBe("'[1,2]'");
  });

  it("wraps numbers in quotes", () => {
    expect(valueToSqlString(42)).toBe("'42'");
  });

  it("wraps booleans in quotes", () => {
    expect(valueToSqlString(true)).toBe("'true'");
  });
});

describe("valueToJsonbExpression", () => {
  it("returns NULL for null", () => {
    expect(valueToJsonbExpression(null)).toBe("NULL");
  });

  it("returns NULL for undefined", () => {
    expect(valueToJsonbExpression(undefined)).toBe("NULL");
  });

  it("builds jsonb_build_object for simple objects", () => {
    expect(valueToJsonbExpression({ city: "Portland", state: "OR" })).toBe(
      "jsonb_build_object('city', 'Portland', 'state', 'OR')"
    );
  });

  it("builds jsonb_build_array for arrays", () => {
    expect(valueToJsonbExpression([1, 2, 3])).toBe(
      "jsonb_build_array(1, 2, 3)"
    );
  });

  it("handles empty objects", () => {
    expect(valueToJsonbExpression({})).toBe("'{}'::jsonb");
  });

  it("handles empty arrays", () => {
    expect(valueToJsonbExpression([])).toBe("jsonb_build_array()");
  });

  it("handles nested objects", () => {
    const value = { address: { city: "Portland", zip: "97201" } };
    expect(valueToJsonbExpression(value)).toBe(
      "jsonb_build_object('address', jsonb_build_object('city', 'Portland', 'zip', '97201'))"
    );
  });

  it("handles nested arrays in objects", () => {
    const value = { tags: ["a", "b"] };
    expect(valueToJsonbExpression(value)).toBe(
      "jsonb_build_object('tags', jsonb_build_array('a', 'b'))"
    );
  });

  it("handles objects in arrays", () => {
    const value = [{ id: 1 }, { id: 2 }];
    expect(valueToJsonbExpression(value)).toBe(
      "jsonb_build_array(jsonb_build_object('id', 1), jsonb_build_object('id', 2))"
    );
  });

  it("handles boolean values", () => {
    expect(valueToJsonbExpression({ active: true, deleted: false })).toBe(
      "jsonb_build_object('active', true, 'deleted', false)"
    );
  });

  it("handles numeric values", () => {
    expect(valueToJsonbExpression({ count: 42, rate: 3.14 })).toBe(
      "jsonb_build_object('count', 42, 'rate', 3.14)"
    );
  });

  it("handles null values in objects", () => {
    expect(valueToJsonbExpression({ city: null, state: "OR" })).toBe(
      "jsonb_build_object('city', NULL, 'state', 'OR')"
    );
  });

  it("handles string values", () => {
    expect(valueToJsonbExpression("hello")).toBe("'hello'");
  });

  it("escapes single quotes in keys and values", () => {
    expect(valueToJsonbExpression({ "it's": "that's" })).toBe(
      "jsonb_build_object('it''s', 'that''s')"
    );
  });

  it("handles deeply nested structures", () => {
    const value = { a: { b: { c: "deep" } } };
    expect(valueToJsonbExpression(value)).toBe(
      "jsonb_build_object('a', jsonb_build_object('b', jsonb_build_object('c', 'deep')))"
    );
  });

  it("handles mixed arrays", () => {
    expect(valueToJsonbExpression([1, "two", true, null])).toBe(
      "jsonb_build_array(1, 'two', true, NULL)"
    );
  });
});

describe("valueToSqlStringWithCasting", () => {
  describe("non-json castings delegate to valueToSqlString", () => {
    it("handles ::uuid casting", () => {
      expect(valueToSqlStringWithCasting("abc-123", "::uuid")).toBe(
        "'abc-123'"
      );
    });

    it("handles empty casting", () => {
      expect(valueToSqlStringWithCasting("hello", "")).toBe("'hello'");
    });

    it("handles ::timestamp casting", () => {
      expect(
        valueToSqlStringWithCasting("2024-01-01", "::timestamp")
      ).toBe("'2024-01-01'");
    });
  });

  describe("::jsonb casting", () => {
    it("uses builder for object values", () => {
      expect(
        valueToSqlStringWithCasting({ city: "Portland" }, "::jsonb")
      ).toBe("jsonb_build_object('city', 'Portland')");
    });

    it("uses builder for array values", () => {
      expect(valueToSqlStringWithCasting([1, 2, 3], "::jsonb")).toBe(
        "jsonb_build_array(1, 2, 3)"
      );
    });

    it("returns NULL for null", () => {
      expect(valueToSqlStringWithCasting(null, "::jsonb")).toBe("NULL");
    });

    it("returns NULL for undefined", () => {
      expect(valueToSqlStringWithCasting(undefined, "::jsonb")).toBe("NULL");
    });

    it("parses JSON strings and uses builder", () => {
      expect(
        valueToSqlStringWithCasting('{"city": "Portland"}', "::jsonb")
      ).toBe("jsonb_build_object('city', 'Portland')");
    });

    it("parses JSON array strings and uses builder", () => {
      expect(
        valueToSqlStringWithCasting("[1, 2, 3]", "::jsonb")
      ).toBe("jsonb_build_array(1, 2, 3)");
    });

    it("falls back to string literal for non-JSON strings", () => {
      expect(
        valueToSqlStringWithCasting("not json", "::jsonb")
      ).toBe("'not json'");
    });

    it("falls back for JSON strings that parse to primitives", () => {
      expect(valueToSqlStringWithCasting("42", "::jsonb")).toBe("'42'");
      expect(valueToSqlStringWithCasting("true", "::jsonb")).toBe("'true'");
      expect(valueToSqlStringWithCasting('"hello"', "::jsonb")).toBe(
        "'\"hello\"'"
      );
    });
  });

  describe("::json casting", () => {
    it("uses builder for object values", () => {
      expect(
        valueToSqlStringWithCasting({ key: "val" }, "::json")
      ).toBe("jsonb_build_object('key', 'val')");
    });

    it("parses JSON strings and uses builder", () => {
      expect(
        valueToSqlStringWithCasting('{"key": "val"}', "::json")
      ).toBe("jsonb_build_object('key', 'val')");
    });
  });
});

describe("toSnakeCase", () => {
  it("converts camelCase", () => {
    expect(toSnakeCase("firstName")).toBe("firstname");
  });

  it("converts spaces and special chars to underscores", () => {
    expect(toSnakeCase("First Name!")).toBe("first_name");
  });

  it("strips leading/trailing underscores", () => {
    expect(toSnakeCase("__hello__")).toBe("hello");
  });
});

describe("generateValues", () => {
  it("joins rows with commas and adds semicolon", () => {
    const rows = ["('a', 'b')", "('c', 'd')"];
    expect(generateValues(rows)).toBe("('a', 'b'),\n('c', 'd');");
  });

  it("handles single row", () => {
    expect(generateValues(["('x')"])).toBe("('x');");
  });
});

describe("generateInsertLoop", () => {
  it("generates a DO block with INSERT", () => {
    const sql = generateInsertLoop({
      tableName: "users",
      mappedHeaders: ["id", "name"],
      valueRows: ["('1', 'Alice')"],
      columnCastings: ["::uuid", ""],
    });

    expect(sql).toContain("INSERT INTO users (id, name)");
    expect(sql).toContain("row_data.id::uuid");
    expect(sql).toContain("row_data.name)");
    expect(sql).not.toContain("row_data.name::");
  });
});

describe("generateUpdateLoop", () => {
  it("generates a DO block with UPDATE and WHERE", () => {
    const sql = generateUpdateLoop({
      tableName: "users",
      mappedHeaders: ["id", "name", "email"],
      valueRows: ["('1', 'Alice', 'a@b.com')"],
      columnCastings: ["::uuid", "", ""],
      whereColumn: "id",
    });

    expect(sql).toContain("UPDATE users");
    expect(sql).toContain("SET name = row_data.name, email = row_data.email");
    expect(sql).toContain("WHERE id = row_data.id::uuid");
  });
});

describe("generateUpsertLoop", () => {
  it("generates a DO block with ON CONFLICT", () => {
    const sql = generateUpsertLoop({
      tableName: "users",
      mappedHeaders: ["id", "name"],
      valueRows: ["('1', 'Alice')"],
      columnCastings: ["::uuid", ""],
      conflictColumns: "id",
    });

    expect(sql).toContain("INSERT INTO users (id, name)");
    expect(sql).toContain("ON CONFLICT (id) DO UPDATE SET");
    expect(sql).toContain("name = EXCLUDED.name");
  });

  it("supports composite conflict columns", () => {
    const sql = generateUpsertLoop({
      tableName: "orders",
      mappedHeaders: ["user_id", "product_id", "quantity"],
      valueRows: ["('u1', 'p1', '5')"],
      columnCastings: ["", "", ""],
      conflictColumns: "user_id, product_id",
    });

    expect(sql).toContain("ON CONFLICT (user_id, product_id) DO UPDATE SET");
    expect(sql).toContain("quantity = EXCLUDED.quantity");
    expect(sql).not.toContain("user_id = EXCLUDED");
    expect(sql).not.toContain("product_id = EXCLUDED");
  });
});
