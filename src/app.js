const fastify = require("fastify")();
const { databaseRoutes } = require("./setup/routes");
const { verifyRoutes } = require("./verify/routes");
const { wordRoutes } = require("./words/routes");

fastify.register(require("@fastify/postgres"), {
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:123456@localhost:5432/moderator",
  ssl: false,
  debug: true,
});

fastify.register(databaseRoutes, { prefix: "/api/database" });
fastify.register(verifyRoutes, { prefix: "/api/verify" });
fastify.register(wordRoutes, { prefix: "/api/words" });

module.exports = fastify;
