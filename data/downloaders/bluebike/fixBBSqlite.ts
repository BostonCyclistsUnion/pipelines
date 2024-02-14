import { sql } from "kysely";
import db from "../../db";
import * as chrono from "chrono-node";

await db
  .updateTable("bluebikes")
  .set({ gender: "1" })
  .where("gender", "=", "Male")
  .execute();

console.log("Male -> 1");

await db
  .updateTable("bluebikes")
  .set({ gender: "2" })
  .where("gender", "=", "Female")
  .execute();

console.log("Female -> 2");

await db
  .updateTable("bluebikes")
  .set({ gender: null })
  .where("gender", "=", "")
  .execute();

console.log("'' -> null");

await db
  .updateTable("bluebikes")
  .set({ "birth year": null })
  //@ts-expect-error
  .where("birth year", "in", ["\\N", "NULL"])
  .execute();

console.log("remove bad birth years");

await db.transaction().execute(async (trx) => {
  await trx
    .updateTable("bluebikes")
    .set("start station name", null)
    .where("start station name", "=", "")
    .execute();

  await trx
    .updateTable("bluebikes")
    .set("end station name", null)
    .where("end station name", "=", "")
    .execute();
});

console.log("remove empty stations");

function* dateParser<T extends Record<string, any>>(rows: T[], key: keyof T) {
  for (let row of rows) {
    let d = chrono.parseDate(row[key]);
    if (d == null) continue;
    row[key] =
      d.getUTCFullYear() +
      "-" +
      ("0" + (d.getUTCMonth() + 1)).slice(-2) +
      "-" +
      ("0" + d.getUTCDate()).slice(-2) +
      " " +
      [
        ("0" + d.getUTCHours()).slice(-2),
        ("0" + d.getUTCMinutes()).slice(-2),
        ("0" + d.getUTCSeconds()).slice(-2),
      ].join(":");
    yield row;
  }
}

await db.transaction().execute(async (trx) => {
  let rows = await trx
    .selectFrom("bluebikes")
    .select(["started at", "id"])
    .where(sql`datetime([started at])`, "is", null)
    .execute();

  console.log("parsed", rows.length);

  let i = 0;
  for (const row of dateParser(rows, "started at")) {
    i++;
    await trx
      .updateTable("bluebikes")
      .set({
        "started at": row["started at"],
      })
      .where("id", "=", row.id)
      .execute();
    if (i % 10000 == 0) console.log(i / rows.length);
  }
});

console.log("/ -> -");

await db.transaction().execute(async (trx) => {
  let rows = await trx
    .selectFrom("bluebikes")
    .select(["ended at", "id"])
    .where(sql`datetime([ended at])`, "is", null)
    .execute();

  console.log("parsed", rows.length);

  let i = 0;
  for (const row of dateParser(rows, "ended at")) {
    i++;
    await trx
      .updateTable("bluebikes")
      .set({
        "ended at": row["ended at"],
      })
      .where("id", "=", row.id)
      .execute();
    if (i % 10000 == 0) console.log(i / rows.length);
  }
});
