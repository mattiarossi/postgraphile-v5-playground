# postgraphile-v5-playground

**BLEEDING EDGE SOFTWARE** - be sure to read the production caveats at
https://grafast.org/caveats/ and wear appropriate personal protective equipment
to protect your fingers from the sharp edges!

## Introduction

This repository is meant to be a playground for demonstrating Postgraphile V5 capabilities, it currently provides:

- a means of running postgraphile v5 directly using the postgraphile node module
- a server module that will run locally and provide a graphql/ruru interface
- a resolver module that will connect to a database schema and run a single GraphQl query
- an exporter module that will connect to a database schema and export it to an executable module
- an importer module that will load a previously exported schema and run a query against it without the need to repeat the introspection step
- a gql exporter module that will print/export a standard graphql dump of the schema
- a gql-appsync exporter module that will print export an AWS Appsync compatible version of the schema
- two example custom plugins

## Quickstart

Install dependencies:

```
yarn
```

## Database connectivity

All scripts in the repo honor two env variables:
- DATABASE_URL: Standard postgres url in the format postgres://<user>:<password>/my_db:<port>/<database>
- DATABASE_SCHEMAS: Array of schema names to be introspected, by default limited to ["public"]

This config can be ovevridden in ./config/postgres.config.mjs 


## Postgraphile default config

The configuration is in `config/graphile.config.mjs`, details on the configuration file can be read about here:

https://postgraphile.org/postgraphile/next/config


### Postgraphile Node module

Run PostGraphile CLI and pass the connection string and schemas:

```
yarn postgraphile -c postgres:///my_db -s app_public -c ./config/graphile.config.mjs

```

(Replace `postgres:///my_db` with your connection string, and `app_public` with
your database schema name.) or set the DATABASE_URL
and DATABASE_SCHEMA env variables

### Database Seed Setup

You can seed some test data (details in sql/sampledb.sql) with the command

```
yarn setup

```


## Helpers

### Server

 Helper Script that runs a local server providing graphql and graphiql endpoints.
 It can be customized with config/plugins

 Run with: 

```
 yarn run local-server

```

### Resolver

Helper Script that creates the Graphql schema through introspection and runs a
sample query The target database needs to be initialized with the seed data
(yarn setup;)

Run with:

```
 yarn run resolver

```

### Exporter

Helper Script that exports the Graphql schema to a native javascript module (default output to ./schema/exported-schema.mjs
)

Run with:

```
 yarn run exporter

```

### Cached Schema Resolver

Helper Script that imports the Graphql schema exported by the exporter helper
and runs a sample query

Run with:

```
 yarn run from-cache

```

### GraphQl Schema Output

Helper Script that generates an standard graphql schema output


Run with:

```
 yarn run gql-print

```

### GraphQl Schema Output

Helper Script that generates an AWS Appsync-Amplify compatible graphql schema

Requires deploying a lambda function that imports and executes the same schema exported through the exporter helper (the exporter needs to be modified by using the graphile-config-export.mjs file)


Run with:

```
 yarn run gql-amplify-print

```

## Example Plugins 
- TODO: Add plugin that can demonstrate proper use of the eslint-plugin-graphile-export / EXPORTABLE functionality

### forceNullablePlugin

Postgraphile V5 plugin which forces `NOT NULL` column to be generated as Nullable field in graphql schema.
Required for Primary Keys that use auto-generated default values from sequences when using AppSync and Lambdas


### removeNestedQueryFieldPlugin

Postgraphile V5 plugin Needed when generating AWS Appsync compatible graphql
Schemas: it removes nested query from Query type (Appsync cannot handle this functionality)
