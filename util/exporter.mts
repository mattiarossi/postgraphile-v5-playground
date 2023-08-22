/**
 * Helper Script that exports the Graphql schema to a native javascript module
 *
 * @param  {exportFileLocation} - Location of the exported javascript schema file
 *
 * - Run with: yarn run exporter
 *
 */

import { makeSchema } from "postgraphile";
import preset from "../config/graphile.config.mjs";
import { exportSchema } from "graphile-export";
import AmberPreset from "postgraphile/presets/amber";
const { schema } = await makeSchema(preset);

const exportFileLocation = `./schema/exported-schema.mjs`;
await exportSchema(schema, exportFileLocation, {
  mode: "graphql-js",
  // or:
  // mode: "typeDefs",
  modules: {},
});

console.log("Done!");
process.exit();
