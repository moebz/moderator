const { adminAuth } = require("../middleware/adminAuth");
const { dbHandler } = require("../utils/dbHandler");
const {
  insertWordsFromFile,
  addWord,
  searchWord,
  getAllWords,
  createWordsTable,
} = require("./service");

async function wordRoutes(fastify) {
  fastify.post(
    "/create-words-table",
    { preHandler: adminAuth },
    async (request, reply) => {
      await dbHandler(fastify, createWordsTable, reply);
    }
  );

  fastify.post(
    "/add/multiple",
    { preHandler: adminAuth },

    async (request, reply) => {
      await dbHandler(fastify, insertWordsFromFile, reply);
    }
  );

  fastify.post(
    "/add",
    { preHandler: adminAuth },

    async (request, reply) => {
      const { word } = request.body;
      await dbHandler(fastify, (client) => addWord(client, word), reply);
    }
  );

  fastify.get(
    "/all",
    { preHandler: adminAuth },

    async (request, reply) => {
      await dbHandler(fastify, (client) => getAllWords(client), reply);
    }
  );

  fastify.get(
    "/search",
    { preHandler: adminAuth },

    async (request, reply) => {
      const { query } = request.query;
      await dbHandler(fastify, (client) => searchWord(client, query), reply);
    }
  );
}

module.exports = { wordRoutes };
