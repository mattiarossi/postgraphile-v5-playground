/*
 * Postgraphile V5 plugin which forces `NOT NULL` column to be generated
 * as Nullable field in graphql schema. Required for Primary Keys that
 * use auto-generated default values from sequences when using AppSync and Lambdas
 */

import { GraphQLNonNull } from "graphql/type/index.js";

const forceNullablePlugin = {
  name: "forceNullablePlugin",
  version: "1.0.0",

  schema: {
    hooks: {
      GraphQLObjectType_fields(
        fields: { [x: string]: { type: any } },
        build: any,
        context: any
      ) {
        if (fields["id"]) {
          const field = fields["id"];
          if (field.type instanceof GraphQLNonNull) {
            fields["id"].type = field.type.ofType;
          }
        }
        return fields;
      },
    },
  },
};
export { forceNullablePlugin };
