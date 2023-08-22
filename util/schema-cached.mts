/**
 * Helper Script that imports the Graphql schema exported by the exporter helper and runs a query
 *
 * - Target database needs to be initialized with the seed data (yarn setup;)
 *
 * - Run with: yarn run from-cache
 *
 */

import { schema } from "../schema/exported-schema.mjs";
import { grafast } from "grafast";
import preset from "../config/graphile.config-export.mjs";
import { pgConnectionString } from "../config/postgres.config.mjs";

import pg from "pg";
const { Pool } = pg;

import { createWithPgClient } from "@dataplan/pg/adaptors/pg";

const pool = new Pool({
  connectionString: pgConnectionString,
});

const withPgClient = createWithPgClient({ pool });

const graphqlContext = { withPgClient };
console.log("Init done");
const args = {
  schema,
  preset,
  requestContext: {},
  contextValue: graphqlContext,
  source: /* GraphQL */ `
    query MyQuery {
      users(first: 3) {
        nodes {
          username
          authoredArticles {
            nodes {
              title
              url
            }
          }
        }
      }
    }
  `,
};
const result = await grafast(args);
console.log(JSON.stringify(result));
process.exit();
