const {
  testConnection,
  getDatabases,
  getTables,
  createClientTable,
  insertTestClient,
} = require("./service");

const { dbHandler } = require("../utils/dbHandler");
const { adminAuth } = require("../middleware/adminAuth");

async function setupRoutes(fastify) {
  fastify.get(
    "/test-connection",
    { preHandler: adminAuth },
    async (request, reply) => {
      await dbHandler(fastify, testConnection, reply);
    }
  );

  fastify.get(
    "/databases",
    { preHandler: adminAuth },
    async (request, reply) => {
      await dbHandler(fastify, getDatabases, reply);
    }
  );

  fastify.get("/tables", { preHandler: adminAuth }, async (request, reply) => {
    await dbHandler(fastify, getTables, reply);
  });

  fastify.post(
    "/create-client-table",
    { preHandler: adminAuth },
    async (request, reply) => {
      await dbHandler(fastify, createClientTable, reply);
    }
  );

  fastify.post(
    "/insert-test-client",
    { preHandler: adminAuth },
    async (request, reply) => {
      await dbHandler(fastify, insertTestClient, reply);
    }
  );
}

module.exports = { setupRoutes };
