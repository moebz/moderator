const {
  verifyWithLevenshtein,
  verifyWithComprehend,
  verifyWithPerspectiveAPI,
} = require("./service");
const { dbHandler } = require("../../utils/dbHandler");

async function verifyRoutes(fastify) {
  fastify.post("/verify", async (request, reply) => {
    const { text } = request.body;
    await dbHandler(fastify, (client) => verifyWithLevenshtein(client, text), reply);
  });

  fastify.post("/verify-with-comprehend", async (request, reply) => {
    const { text } = request.body;

    try {
      const result = await verifyWithComprehend(text);
      reply.send(result);
    } catch (err) {
      console.error("Error verifying with Comprehend:", err);
      reply.code(500).send({ error: "Failed to analyze content", details: err.message });
    }
  });

  fastify.post("/verify-with-ca", async (request, reply) => {
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