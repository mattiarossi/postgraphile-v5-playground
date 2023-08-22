/*
  Custom version of the printSchema methods from the Graphql module to allow outputting an AWS AppSync/Amplify compatible gql schema
*/

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.printIntrospectionSchema = printIntrospectionSchema;
exports.printSchema = printSchema;
exports.printType = printType;

var _inspect = require("graphql/jsutils/inspect.js");

var _invariant = require("graphql/jsutils/invariant.js");

var _blockString = require("graphql/language/blockString.js");

var _kinds = require("graphql/language/kinds.js");

var _printer = require("graphql/language/printer.js");

var _definition = require("graphql/type/definition.js");

var _directives = require("graphql/type/directives.js");

var _introspection = require("graphql/type/introspection.js");

var _scalars = require("graphql/type/scalars.js");

var _astFromValue = require("graphql/utilities/astFromValue.js");

function printSchema(schema, options) {
  return printFilteredSchema(
    schema,
    (n) => !(0, _directives.isSpecifiedDirective)(n),
    isDefinedType,
    options
  );
}

function printIntrospectionSchema(schema, options) {
  return printFilteredSchema(
    schema,
    _directives.isSpecifiedDirective,
    _introspection.isIntrospectionType,
    options
  );
}

function isDefinedType(type) {
  return (
    !(0, _scalars.isSpecifiedScalarType)(type) &&
    !(0, _introspection.isIntrospectionType)(type)
  );
}

function printFilteredSchema(schema, directiveFilter, typeFilter, options) {
  const directives = schema.getDirectives().filter(directiveFilter);
  const types = Object.values(schema.getTypeMap()).filter(typeFilter);
  return [
    printSchemaDefinition(schema),
    ...directives.map((directive) => printDirective(directive, options)),
    ...types.map((type) => printType(type, options)),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function printSchemaDefinition(schema) {
  if (schema.description == null && isSchemaOfCommonNames(schema)) {
    return;
  }

  const operationTypes = [];
  const queryType = schema.getQueryType();

  if (queryType) {
    operationTypes.push(`  query: ${queryType.name}`);
  }

  const mutationType = schema.getMutationType();

  if (mutationType) {
    operationTypes.push(`  mutation: ${mutationType.name}`);
  }

  const subscriptionType = schema.getSubscriptionType();

  if (subscriptionType) {
    operationTypes.push(`  subscription: ${subscriptionType.name}`);
  }

  return printDescription(schema) + `schema {\n${operationTypes.join("\n")}\n}`;
}
/**
 * GraphQL schema define root types for each type of operation. These types are
 * the same as any other type and can be named in any manner, however there is
 * a common naming convention:
 *
 * ```graphql
 *   schema {
 *     query: Query
 *     mutation: Mutation
 *     subscription: Subscription
 *   }
 * ```
 *
 * When using this naming convention, the schema description can be omitted.
 */

function isSchemaOfCommonNames(schema) {
  const queryType = schema.getQueryType();

  if (queryType && queryType.name !== "Query") {
    return false;
  }

  const mutationType = schema.getMutationType();

  if (mutationType && mutationType.name !== "Mutation") {
    return false;
  }

  const subscriptionType = schema.getSubscriptionType();

  if (subscriptionType && subscriptionType.name !== "Subscription") {
    return false;
  }

  return true;
}

function printType(type, options) {
  if ((0, _definition.isScalarType)(type)) {
    return printScalar(type, options);
  }

  if ((0, _definition.isObjectType)(type)) {
    return printObject(type, options);
  }

  if ((0, _definition.isInterfaceType)(type)) {
    return printInterface(type, options);
  }

  if ((0, _definition.isUnionType)(type)) {
    return printUnion(type, options);
  }

  if ((0, _definition.isEnumType)(type)) {
    return printEnum(type, options);
  }

  if ((0, _definition.isInputObjectType)(type)) {
    return printInputObject(type, options);
  }
  /* c8 ignore next 3 */
  // Not reachable, all possible types have been considered.

  false ||
    (0, _invariant.invariant)(
      false,
      "Unexpected type: " + (0, _inspect.inspect)(type)
    );
}

function printScalar(type, options) {
  return (
    printDescription(options, type) +
    `scalar ${type.name}` +
    printSpecifiedByURL(type)
  );
}

function printImplementedInterfaces(type) {
  const interfaces = type.getInterfaces();
  return interfaces.length
    ? " implements " + interfaces.map((i) => i.name).join(" & ")
    : "";
}

function printObject(type, options) {
  return (
    printDescription(options, type) +
    `type ${type.name}` +
    printImplementedInterfaces(type) +
    printFields(options, type)
  );
}

function printInterface(type, options) {
  return (
    printDescription(options, type) +
    `interface ${type.name}` +
    printImplementedInterfaces(type) +
    printFields(options, type)
  );
}

function printUnion(type, options) {
  const types = type.getTypes();
  const possibleTypes = types.length ? " = " + types.join(" | ") : "";
  return printDescription(options, type) + "union " + type.name + possibleTypes;
}

function printEnum(type, options) {
  const values = type
    .getValues()
    .map(
      (value, i) =>
        printDescription(options, value, "  ", !i) +
        "  " +
        value.name +
        printDeprecated(value.deprecationReason)
    );
  return (
    printDescription(options, type) + `enum ${type.name}` + printBlock(values)
  );
}

function printInputObject(type, options) {
  const fields = Object.values(type.getFields()).map(
    (f, i) => printDescription(options, f, "  ", !i) + "  " + printInputValue(f)
  );
  return (
    printDescription(options, type) + `input ${type.name}` + printBlock(fields)
  );
}

function printFields(options, type) {
  let postfix = "";
  if (options.postfix) {
    if (String(type) === "Mutation" || String(type) === "Query") {
      postfix = " " + options.postfix;
      console.log("POSTFIX CHANGE: " + postfix);
    }
  }

  const fields = Object.values(type.getFields()).map(
    (f, i) =>
      printDescription(options, f, "  ", !i) +
      "  " +
      f.name +
      printArgs(options, f.args, "  ") +
      ": " +
      String(f.type) +
      printDeprecated(f.deprecationReason) +
      postfix
  );
  return printBlock(fields);
}

function printBlock(items) {
  return items.length !== 0 ? " {\n" + items.join("\n") + "\n}" : "";
}

function printArgs(options, args, indentation = "") {
  if (args.length === 0) {
    return "";
  } // If every arg does not have a description, print them on one line.

  if (args.every((arg) => !arg.description)) {
    return "(" + args.map(printInputValue).join(", ") + ")";
  }

  return (
    "(\n" +
    args
      .map(
        (arg, i) =>
          printDescription(options, arg, "  " + indentation, !i) +
          "  " +
          indentation +
          printInputValue(arg)
      )
      .join("\n") +
    "\n" +
    indentation +
    ")"
  );
}

function printInputValue(arg) {
  const defaultAST = (0, _astFromValue.astFromValue)(
    arg.defaultValue,
    arg.type
  );
  let argDecl = arg.name + ": " + String(arg.type);

  if (defaultAST) {
    argDecl += ` = ${(0, _printer.print)(defaultAST)}`;
  }

  return argDecl + printDeprecated(arg.deprecationReason);
}

function printDirective(directive, options) {
  return (
    printDescription(options, directive) +
    "directive @" +
    directive.name +
    printArgs(directive.args) +
    (directive.isRepeatable ? " repeatable" : "") +
    " on " +
    directive.locations.join(" | ")
  );
}

function printDeprecated(reason) {
  if (reason == null) {
    return "";
  }

  if (reason !== _directives.DEFAULT_DEPRECATION_REASON) {
    const astValue = (0, _printer.print)({
      kind: _kinds.Kind.STRING,
      value: reason,
    });
    return ` @deprecated(reason: ${astValue})`;
  }

  return " @deprecated";
}

function printSpecifiedByURL(scalar) {
  if (scalar.specifiedByURL == null) {
    return "";
  }

  const astValue = (0, _printer.print)({
    kind: _kinds.Kind.STRING,
    value: scalar.specifiedByURL,
  });
  return ` @specifiedBy(url: ${astValue})`;
}

function printDescription(options, def, indentation = "", firstInBlock = true) {
  const { description } = def;

  if (description == null) {
    return "";
  }
  if (
    (options === null || options === void 0
      ? void 0
      : options.commentDescriptions) === true
  ) {
    return printDescriptionWithComments(description, indentation, firstInBlock);
  }
  const blockString = (0, _printer.print)({
    kind: _kinds.Kind.STRING,
    value: description,
    block: (0, _blockString.isPrintableAsBlockString)(description),
  });
  const prefix =
    indentation && !firstInBlock ? "\n" + indentation : indentation;
  return prefix + blockString.replace(/\n/g, "\n" + indentation) + "\n";
}
function printDescriptionWithComments(description, indentation, firstInBlock) {
  var prefix = indentation && !firstInBlock ? "\n" : "";
  var comment = description
    .split("\n")
    .map(function (line) {
      return indentation + (line !== "" ? "# " + line : "#");
    })
    .join("\n");
  return prefix + comment + "\n";
}
