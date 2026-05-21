import { describe, expect, it } from "vitest";

import { InMemoryDriver } from "@/services/database/InMemoryDriver";

describe("InMemoryDriver", () => {
  it("executes SQL statements and returns selected rows", async () => {
    const db = await InMemoryDriver.connect();

    await db.execute(
      "CREATE TABLE tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)",
    );

    const insertResult = await db.execute(
      "INSERT INTO tags (name) VALUES (?)",
      ["urgent"],
    );

    expect(insertResult.rowsAffected).toBe(1);
    expect(insertResult.lastInsertId).toBeTypeOf("number");

    const rows = await db.select<{ id: number; name: string }>(
      "SELECT id, name FROM tags ORDER BY id",
    );

    expect(rows).toEqual([{ id: 1, name: "urgent" }]);
  });

  it("rolls back transaction when callback throws", async () => {
    const db = await InMemoryDriver.connect();

    await db.execute(
      "CREATE TABLE tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)",
    );

    await expect(
      db.transaction(async (tx) => {
        await tx.execute("INSERT INTO tags (name) VALUES (?)", ["alpha"]);
        throw new Error("force rollback");
      }),
    ).rejects.toThrow("force rollback");

    const rows = await db.select<{ count: number }>(
      "SELECT COUNT(*) AS count FROM tags",
    );

    expect(rows[0]?.count ?? 0).toBe(0);
  });
});
