/**
 * Postgres connection string config file,
 * connectivity to postgres can be overridden here or set through the
 * DATABASE_URL - DATABASE_SCHEMAS env variables
 */

const pgConnectionString =
  process.env.DATABASE_URL ?? "postgres://postgres@127.0.0.1";

const postgraphileSchemas = process.env.DATABASE_SCHEMAS?.split(",")["public"];

export { pgConnectionString, postgraphileSchemas };
