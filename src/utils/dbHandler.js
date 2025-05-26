const dbHandler = async (fastify, handler, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await handler(client);
    reply.send(result);
  } catch (err) {
    console.error("Operation error:", err);
    reply.code(500).send({ error: "Operation failed.", details: err });
  } finally {
    client.release();
  }
};

module.exports = { dbHandler };
