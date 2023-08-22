/**
 * Helper Script that generates an AWS Appsync-Amplify compatible graphql schema
 * Requires deploying a lambda function that imports and executes the same schem exported through the exporter helper
 * @param  {amplifyLambdaResolverFunction} - Name of the Amplify lambda function that will implement the resolver for the postgraphile related calls from AppSync
 *
 * - Run with: yarn run gql-amplify-print
 *
 */

import { GraphQLSchema } from "graphql";
import { makeSchema } from "postgraphile";
import { printSchema } from "../lib/printSchema.js";
import * as fs from "fs";
import preset from "../config/graphile.config-export.mjs";

const { schema } = await makeSchema(preset);

const amplifyLambdaResolverFunction = "myAmplifyLambda-${env}";

function toAppSyncSchema(schema: GraphQLSchema) {
  const str = printSchema(schema, {
    commentDescriptions: true,
    postfix: `@function(name: ${amplifyLambdaResolverFunction})`,
  });
  const printed = str
    .replace(/(\s|\[)UUID/g, "$1ID")
    .replace(/scalar .*\n/g, "")
    .replace(/\n *\n/g, "\n");
  return printed;
}

//console.log(JSON.stringify(schema));
const definition = toAppSyncSchema(schema);
fs.writeFileSync("./schema/amplify-schema.graphql", definition);
console.log(
  "Success - Amplify - Appsync compatible Graphql schema has been written to: ./schema/amplify-schema.graphql"
);

process.exit();
