/**
 * Helper Script that runs a local server providing graphql and graphiql endpoints, can be customized with config/plugins
 *
 * - Run with: yarn run local-server
 */

// Run this with `npx ts-node --esm postgraphile-express-typescript-example.mts`
import preset from "../config/graphile.config.mjs";
import { postgraphile } from "postgraphile";

// Our PostGraphile instance:
export const pgl = postgraphile(preset);

import { createServer } from "node:http";
import { grafserv } from "grafserv/node";

const serv = pgl.createServ(grafserv);

const server = createServer();
server.on("error", () => {});
serv.addTo(server).catch((e) => {
  console.error(e);
  process.exit(1);
});
server.listen(5678);

console.log("Server listening at http://localhost:5678");
