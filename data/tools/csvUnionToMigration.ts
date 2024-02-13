import { select, editor, input } from "@inquirer/prompts";

let stdin = await editor({
  message: "Enter a csv",
});
let cols = [
  ...new Set(stdin.replaceAll("\n", ",").replaceAll('"', "").split(",")),
];

let mappings = {
  integer: "number",
  text: "string",
  blob: "we'll cross this bridge when we come to it",
  real: "number",
  numeric: "number",
};

let cols2 = [];
for (const col of cols) {
  let map = await select({
    message: col,
    choices: Object.keys(mappings).map((type) => {
      return {
        value: type,
      };
    }),
  });
  cols2.push([col, map]);
}

let tablename = await input({ message: "What is the name of this table?" });

let ts = `interface ${
  tablename.charAt(0).toUpperCase() + tablename.slice(1)
}Table {\n
  id: Generated<number>;\n`;
ts += cols2.map(([col, map]) => `  ${col}: ${mappings[map]}`).join("\n");
ts += "}";

console.log(ts);

console.log(`
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('${tablename}')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    ${cols2.map(([col, map]) => `.addColumn('${col}', '${map}')`).join("\n")}
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('${tablename}').execute()
}
`);
