const { dbHandler } = require("../utils/dbHandler");
const {
  insertWordsFromFile,
  addWord,
  searchWord,
  getAllWords,
} = require("./service");

async function wordRoutes(fastify) {
  fastify.post("/add/multiple", async (request, reply) => {
    await dbHandler(fastify, insertWordsFromFile, reply);
  });

  fastify.post("/add", async (request, reply) => {
    const { word } = request.body;
    await dbHandler(fastify, (client) => addWord(client, word), reply);
  });

  fastify.get("/all", async (request, reply) => {
    await dbHandler(fastify, (client) => getAllWords(client), reply);
  });

  fastify.get("/search", async (request, reply) => {
    const { query } = request.query;
    await dbHandler(fastify, (client) => searchWord(client, query), reply);
  });
}

module.exports = { wordRoutes };
