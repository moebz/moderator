const { insertWordsFromFile, addWord, searchWord } = require("./service");

const { dbHandler } = require("../../utils/dbHandler");

async function wordRoutes(fastify) {
  fastify.post("/insert-words", async (request, reply) => {
    await dbHandler(fastify, insertWordsFromFile, reply);
  });

  fastify.post("/words", async (request, reply) => {
    const { word } = request.body;
    await dbHandler(fastify, (client) => addWord(client, word), reply);
  });

  fastify.get("/words/search", async (request, reply) => {
    const { query } = request.query;
    await dbHandler(fastify, (client) => searchWord(client, query), reply);
  });
}

module.exports = { wordRoutes };
