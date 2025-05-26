const { testConnection, getDatabases, getTables } = require("./service");

const { dbHandler } = require("../utils/dbHandler");
const { adminAuth } = require("../middleware/adminAuth");

async function databaseRoutes(fastify) {
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

  fastify.get(
    "/tables",
    { preHandler: adminAuth },

    async (request, reply) => {
      await dbHandler(fastify, getTables, reply);
    }
  );

  fastify.post(
    "/create-client-table",
    { preHandler: adminAuth },

    async (request, reply) => {
      const { client } = request.body;

      try {
        const result = await client.query(`
        CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          api_key VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
        reply.send(result);
      } catch (err) {
        console.error("Error creating client table:", err);
        reply.code(500).send({ error: "Failed to create client table" });
      }
    }
  );
}

module.exports = { databaseRoutes };
