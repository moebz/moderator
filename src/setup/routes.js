const { testConnection, getDatabases, getTables } = require("./service");

const { dbHandler } = require("../utils/dbHandler");

async function databaseRoutes(fastify) {
  fastify.get("/test-connection", async (request, reply) => {
    await dbHandler(fastify, testConnection, reply);
  });

  fastify.get("/databases", async (request, reply) => {
    await dbHandler(fastify, getDatabases, reply);
  });

  fastify.get("/tables", async (request, reply) => {
    await dbHandler(fastify, getTables, reply);
  });
}

module.exports = { databaseRoutes };
