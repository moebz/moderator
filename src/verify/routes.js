const { dbHandler } = require("../utils/dbHandler");
const {
  verifyWithLevenshtein,
  verifyWithComprehend,
  verifyWithPerspectiveAPI,
  go,
} = require("./service");

async function verifyRoutes(fastify) {
  fastify.post("/go", async (request, reply) => {
    const { text } = request.body;
    const apiClientToken = request.headers["x-api-key"];
    await dbHandler(
      fastify,
      (client) => go(client, apiClientToken, text),
      reply
    );
  });

  fastify.post("/leven", async (request, reply) => {
    const { text } = request.body;
    await dbHandler(
      fastify,
      (client) => verifyWithLevenshtein(client, text),
      reply
    );
  });

  fastify.post("/comprehend", async (request, reply) => {
    const { text } = request.body;

    try {
      const result = await verifyWithComprehend(text);
      reply.send(result);
    } catch (err) {
      console.error("Error verifying with Comprehend:", err);
      reply
        .code(500)
        .send({ error: "Failed to analyze content", details: err.message });
    }
  });

  fastify.post("/analyze", async (request, reply) => {
    const { text } = request.body;

    try {
      const result = await verifyWithPerspectiveAPI(text);
      reply.send(result);
    } catch (err) {
      console.error("Perspective API error:", err);
      reply.code(500).send({
        error: "Analysis failed",
        details: err.response?.data?.error || err.message,
      });
    }
  });
}

module.exports = { verifyRoutes };
