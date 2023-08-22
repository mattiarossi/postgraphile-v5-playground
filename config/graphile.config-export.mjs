/**
 * Custom Postgraphile config used by the amplify-schema-gql method
 * that requires a different set of params
 * connectivity to postgres can be configured in the postgres.config.mjs file or overridden using
 * DATABASE_URL and DATABASE_SCHEMAS env variables
 */

// @ts-check
import { makePgService } from "@dataplan/pg/adaptors/pg";
import AmberPreset from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import { forceNullablePlugin } from "../plugins/forcenullable.mjs";
import { removeNestedQueryFieldPlugin } from "../plugins/removenestedquery.mjs";
import {
  pgConnectionString,
  postgraphileSchemas,
} from "../config/postgres.config.mjs";

/** @satisfies {GraphileConfig.Preset} */
const preset = {
  extends: [
    AmberPreset.default ?? AmberPreset,
    makeV4Preset({
      /* Enter your V4 options here */
      graphiql: false,
      ignoreRBAC: false,
      simpleCollections: "only",
    }),
    PostGraphileConnectionFilterPreset,
    PgAggregatesPreset,
    PgSimplifyInflectionPreset,
  ],
  plugins: [forceNullablePlugin, removeNestedQueryFieldPlugin],
  disablePlugins: ["NodePlugin", "MutationPayloadQueryPlugin"],
  pgServices: [
    makePgService({
      // Database connection string:
      connectionString: pgConnectionString,
      // List of schemas to expose:
      schemas: postgraphileSchemas,
      // Disable LISTEN/NOTIFY:
      pubsub: false,
    }),
  ],
  schema: {
    defaultBehavior: "-interface:node",
    pgOmitListSuffix: true,
    pgShortPk: true,
    pgSimplifyAllRows: true,
  },
};

export default preset;
