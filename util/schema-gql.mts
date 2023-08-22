/**
 * Helper Script that generates an standard graphql schema output
 *
 * - Run with: yarn run gql-print;
 */

import { schema } from "../schema/exported-schema.mjs";
import { printSchema } from "graphql";
import * as fs from "fs";

//console.log(JSON.stringify(schema));
const definition = printSchema(schema);
fs.writeFileSync("./schema/schema.graphql", definition);
console.log(
  "Success - Graphql schema has been written to: ./schema/schema.graphql"
);

process.exit();
