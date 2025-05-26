const fastify = require("fastify")();
const { setupRoutes } = require("./setup/routes");
const { verifyRoutes } = require("./verify/routes");
const { wordRoutes } = require("./words/routes");

fastify.register(require("@fastify/postgres"), {
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:123456@localhost:5432/moderator",
  ssl: false,
  debug: true,
});

fastify.register(verifyRoutes, {
  prefix: "/api/verify",
});

fastify.register(setupRoutes, {
  prefix: "/api/setup",
});

fastify.register(wordRoutes, { prefix: "/api/words" });

module.exports = fastify;
