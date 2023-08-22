/**
 * Helper Script that creates the Graphql schema through introspection and runs a query
 *
 * - Target database needs to be initialized with the seed data (yarn setup;)
 *
 * - Run with: yarn run resolver
 *
 */

import { grafast } from "grafast";
import { makeSchema } from "postgraphile";
import preset from "../config/graphile.config.mjs";
const { schema, resolvedPreset } = await makeSchema(preset);

const args = {
  schema,
  resolvedPreset,
  requestContext: {},
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
