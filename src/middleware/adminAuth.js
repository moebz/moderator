const adminAuth = async (request, reply) => {
  console.log("Admin authentication middleware triggered");
  const apiKey = request.headers["x-api-key"];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    reply.code(401).send({ error: "Unauthorized: Invalid API key" });
    return;
  }
};
module.exports = { adminAuth };
