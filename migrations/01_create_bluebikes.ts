import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("bluebikes")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("tripduration", "integer")
    .addColumn("started at", "integer")
    .addColumn("ended at", "integer")
    .addColumn("start id", "integer")
    .addColumn("start station name", "text")
    .addColumn("start lat", "real")
    .addColumn("start lng", "real")
    .addColumn("end id", "integer")
    .addColumn("end station name", "text")
    .addColumn("end lat", "real")
    .addColumn("end lng", "real")
    .addColumn("ride id", "integer")
    .addColumn("usertype", "text")
    .addColumn("birth year", "integer")
    .addColumn("gender", "text")
    .addColumn("postal code", "integer")
    .addColumn("rideable type", "text")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("bluebikes").execute();
}
