const dbHandler = async (fastify, handler, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await handler(client);
    reply.send(result);
  } catch (err) {
    console.error("Database operation error:", err);
    reply.code(500).send({ error: "Database operation failed.", details: err });
  } finally {
    client.release();
  }
};

module.exports = { dbHandler };
