/**
 * Standard Postgraphile config used by all utils except the amplify-schema-gql method
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
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";
import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
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
      graphiql: true,
      graphiqlRoute: "/",
      ignoreRBAC: false,
    }),
    PostGraphileConnectionFilterPreset,
    //PgManyToManyPreset,
    PgAggregatesPreset,
    PgSimplifyInflectionPreset,
  ],
  plugins: [],
  disablePlugins: [],
  pgServices: [
    makePgService({
      // Database connection string:
      connectionString: pgConnectionString,
      // List of schemas to expose:
      schemas: postgraphileSchemas,
      // Enable LISTEN/NOTIFY:
      pubsub: true,
    }),
  ],
  grafserv: {
    port: 5678,
    websockets: true,
  },
  grafast: {
    explain: false,
  },
};

export default preset;
