const fastify = require("fastify")();
const path = require("path");
const fs = require("fs");

// Register PostgreSQL plugin
fastify.register(require("@fastify/postgres"), {
  connectionString: "postgres://postgres:123456@localhost:5432/moderator",
  ssl: false,
  debug: true, // Enable debugging
});

fastify.get("/test-connection", async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query("SELECT current_database();");
    reply.send(result.rows);
  } catch (err) {
    console.error("Error testing connection:", err);
    reply.code(500).send({ error: "Failed to test connection.", details: err });
  } finally {
    client.release();
  }
});

fastify.get("/databases", async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false;"
    );
    reply.send(result.rows);
  } catch (err) {
    console.error("Error fetching databases:", err);
    reply.code(500).send({ error: "Failed to fetch databases.", details: err });
  } finally {
    client.release();
  }
});

fastify.get("/tables", async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    reply.send(result.rows);
  } catch (err) {
    console.error("Error fetching tables:", err);
    reply.code(500).send({ error: "Failed to fetch tables.", details: err });
  } finally {
    client.release();
  }
});

fastify.post("/insert-words", async (request, reply) => {
  const filePath = path.join(__dirname, "badWords.json");
  try {
    // Read the JSON file
    const data = fs.readFileSync(filePath, "utf8");
    const words = JSON.parse(data);

    // Validate that words is an array
    if (!Array.isArray(words)) {
      return reply
        .code(400)
        .send({ error: "JSON file must contain an array of words." });
    }

    const client = await fastify.pg.connect();
    try {
      // Begin a transaction
      await client.query("BEGIN");

      // Insert each word into the words table
      for (const word of words) {
        await client.query("INSERT INTO public.words (word) VALUES ($1)", [
          word,
        ]);
      }

      // Commit the transaction
      await client.query("COMMIT");
      reply.send({ success: true, message: "Words inserted successfully." });
    } catch (err) {
      console.error("Error inserting words:", err);
      // Rollback the transaction in case of error
      await client.query("ROLLBACK");
      reply.code(500).send({ error: "Failed to insert words.", details: err });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error reading or parsing JSON file:", err);
    reply
      .code(500)
      .send({ error: "Failed to read or parse JSON file.", details: err });
  }
});

// Route to add a new word
fastify.post("/words", async (request, reply) => {
  const { word } = request.body;
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      "INSERT INTO words (word) VALUES ($1) RETURNING *",
      [word]
    );
    reply.code(201).send(result.rows[0]);
  } catch (err) {
    reply.code(500).send(err);
  } finally {
    client.release();
  }
});

// Route to search for words with exact match
fastify.get("/words/search", async (request, reply) => {
  const { query } = request.query;
  const client = await fastify.pg.connect();
  try {
    const result = await client.query(
      "SELECT id, word FROM words WHERE word = $1 LIMIT 10",
      [query]
    );
    reply.send(result.rows);
  } catch (err) {
    reply.code(500).send(err);
  } finally {
    client.release();
  }
});

// Verify route with Levenshtein distance
fastify.post("/verify", async (request, reply) => {
  const { text } = request.body;
  const client = await fastify.pg.connect();
  try {
    // Split the text into words
    const words = text.split(/\s+/);

    // Set a Levenshtein distance threshold
    const distanceThreshold = 1;

    // Prepare the query to find matching forbidden words using Levenshtein distance

    // Raw example

    /* SELECT word
      FROM words
      WHERE EXISTS (
        SELECT 1
        FROM unnest(ARRAY['unas', 'palabras', 'telrible', 'hola']::text[]) AS input_word
        WHERE levenshtein(word, input_word) <= 1
      )
      LIMIT 1;
    */

    const query = `
      SELECT word
      FROM words
      WHERE EXISTS (
        SELECT 1
        FROM unnest($1::text[]) AS input_word
        WHERE levenshtein(word, input_word) <= $2
      )
      LIMIT 1;
    `;

    const result = await client.query(query, [words, distanceThreshold]);
    if (result.rows.length > 0) {
      reply.send({ match: true, word: result.rows[0].word });
    } else {
      reply.send({ match: false });
    }
  } catch (err) {
    console.error("Error verifying text:", err);
    reply.code(500).send(err);
  } finally {
    client.release();
  }
});

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
