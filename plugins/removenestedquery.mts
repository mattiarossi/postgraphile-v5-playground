/**
 * Postgraphile V5 plugin  - Needed when generating AWS Appsync compatible graphql Schemas
 * make sure we remove nested query from Query type
 */

import "graphile-config";
import {
  GraphQLNonNull,
  isScalarType,
  GraphQLID,
  GraphQLFloat,
  GraphQLScalarType,
  GraphQLString,
  GraphQLInt,
  GraphQLNullableType,
  isNonNullType,
} from "graphql/type/index.js";

const AWSID = GraphQLID;
const NonNullAWSID = new GraphQLNonNull(AWSID);
const AWSFloat = GraphQLFloat;
const NonNullFloat = new GraphQLNonNull(AWSFloat);
const AWSInt = GraphQLInt;
const NonNullInt = new GraphQLNonNull(AWSInt);
const AWSString = GraphQLString;
const NonNullString = new GraphQLNonNull(AWSString);
const AWSDate = new GraphQLScalarType({ name: "AWSDate" });
const NonNullAWSDate = new GraphQLNonNull(AWSDate);
const AWSDateTime = new GraphQLScalarType({ name: "AWSDateTime" });
const NonNullAWSDateTime = new GraphQLNonNull(AWSDateTime);
const AWSTime = new GraphQLScalarType({ name: "AWSDateTime" });
const NonNullAWSTime = new GraphQLNonNull(AWSTime);
const AWSJson = new GraphQLScalarType({ name: "AWSJSON" });
const NonNullAWSJson = new GraphQLNonNull(AWSJson);

const removeNestedQueryFieldPlugin = {
  name: "removeNestedQueryFieldPlugin",
  version: "1.0.0",

  schema: {
    hooks: {
      GraphQLObjectType_fields(fields: any, build: any, context: any) {
        if (fields["query"]) {
          delete fields["query"];
        }
        if (fields["clientMutationId"]) {
          delete fields["clientMutationId"];
        }
        const names = Object.keys(fields);
        for (const name of names) {
          if (name.match(/deleted\w+NodeId/)) {
            delete fields[name];
          }
        }
        updateObjectTypes(fields);
        return fields;
      },
      GraphQLInputObjectType_fields(fields: any, build: any, context: any) {
        if (fields["clientMutationId"]) {
          delete fields["clientMutationId"];
        }
        updateInputTypes(fields);
        return fields;
      },
    },
  },
};

interface GenericField {
  type: GraphQLScalarType;
}
interface NonNullGenericField {
  type: GraphQLNonNull<GraphQLNullableType>;
}

const replacer = (field: GenericField) => {
  const things = [
    {
      name: "UUID",
      check: (val: String) => val === "UUID",
      update: () => AWSID,
    },
    {
      name: "Cursor",
      check: (val: String) => val === "Cursor",
      update: () => AWSString,
    },
    {
      name: "Int",
      check: (val: String) => val === "BigInt",
      update: () => AWSInt,
    },
    {
      name: "Float",
      check: (val: String) => val === "BigFloat",
      update: () => AWSFloat,
    },
    {
      name: "AWSDate",
      check: (val: String) => val === "Date",
      update: () => AWSDate,
    },
    {
      name: "AWSDateTime",
      check: (val: String) => val === "Datetime",
      update: () => AWSDateTime,
    },
    {
      name: "AwsDateTime",
      check: (val: String) => val === "AwsDateTime",
      update: () => AWSDateTime,
    },
    {
      name: "AWSTime",
      check: (val: String) => val === "Time",
      update: () => AWSTime,
    },
    {
      name: "AWSJson",
      check: (val: String) => val === "JSON",
      update: () => AWSJson,
    },
  ];
  things.forEach((rule) => {
    if (rule.check(field.type.name)) {
      field.type = rule.update();
    }
  });
};

const nonNullReplacer = (field: NonNullGenericField) => {
  const things = [
    {
      name: "UUID",
      check: (val: String) => val === "UUID!",
      update: () => NonNullAWSID,
    },
    {
      name: "Cursor",
      check: (val: String) => val === "Cursor!",
      update: () => NonNullString,
    },
    {
      name: "Int",
      check: (val: String) => val === "BigInt!",
      update: () => NonNullInt,
    },
    {
      name: "Float",
      check: (val: String) => val === "BigFloat!",
      update: () => NonNullFloat,
    },
    {
      name: "NonNullAWSDate",
      check: (val: String) => val === "Date!",
      update: () => NonNullAWSDate,
    },
    {
      name: "NonNullAWSDateTime",
      check: (val: String) => val === "Datetime!",
      update: () => NonNullAWSDateTime,
    },
    {
      name: "AWSTime",
      check: (val: String) => val === "Time!",
      update: () => NonNullAWSTime,
    },
    {
      name: "NonNullAWSJson",
      check: (val: String) => val === "JSON!",
      update: () => NonNullAWSJson,
    },
  ];
  if (isScalarType(field.type.ofType)) {
    // console.log('>>> found non null scalar', field.type.ofType)
    things.forEach((rule) => {
      if (rule.check(field.type.toString())) {
        field.type = rule.update();
      }
    });
  }
};

function updateObjectTypes(fields: NonNullGenericField) {
  Object.entries(fields).forEach(([k, field]) => {
    if (isScalarType(field.type)) {
      replacer(field as GenericField);
    }
    if (isNonNullType(field.type)) {
      nonNullReplacer(field as NonNullGenericField);
    }
    if (field.args) {
      Object.entries(field.args).forEach(([k, arg]) => {
        if (isScalarType((arg as any).type)) {
          replacer(arg as GenericField);
        }
        if (isNonNullType((arg as any).type)) {
          nonNullReplacer(arg as NonNullGenericField);
        }
      });
    }
  });
}
function updateInputTypes(fields: NonNullGenericField) {
  Object.entries(fields).forEach(([k, field]) => {
    if (isScalarType(field.type)) {
      replacer(field as GenericField);
    }
    if (isNonNullType(field.type)) {
      nonNullReplacer(field as NonNullGenericField);
    }
  });
}

export { removeNestedQueryFieldPlugin };
