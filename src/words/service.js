const fs = require("fs");
const path = require("path");

const createWordsTable = async (client) => {
  const query = `
    CREATE TABLE IF NOT EXISTS public.words (
      id serial4 NOT NULL,
      word text NOT NULL,
      CONSTRAINT words_pkey PRIMARY KEY (id)
    );
    `;
  const result = await client.query(query);
  return result;
};

const insertWordsFromFile = async (client) => {
  // No ejecutar si ya hay palabras
  const checkQuery = "SELECT COUNT(*) FROM words";
  const checkResult = await client.query(checkQuery);
  if (Number(checkResult.rows[0].count) > 0) {
    return { success: false, message: "Words already exist in the database." };
  }

  const filePath = path.join(__dirname, "./badWords.json");
  const data = fs.readFileSync(filePath, "utf8");
  const words = JSON.parse(data);

  if (!Array.isArray(words)) {
    throw new Error("JSON file must contain an array of words.");
  }

  await client.query("BEGIN");
  try {
    for (const word of words) {
      await client.query("INSERT INTO public.words (word) VALUES ($1)", [word]);
    }
    await client.query("COMMIT");
    return { success: true, message: "Words inserted successfully." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
};

const getAllWords = async (client) => {
  const result = await client.query("SELECT id, word FROM words");
  return result.rows;
};

const addWord = async (client, word) => {
  const result = await client.query(
    "INSERT INTO words (word) VALUES ($1) RETURNING *",
    [word]
  );
  return result.rows[0];
};

const searchWord = async (client, query) => {
  const result = await client.query(
    "SELECT id, word FROM words WHERE word = $1 LIMIT 10",
    [query]
  );
  return result.rows;
};

module.exports = {
  createWordsTable,
  insertWordsFromFile,
  addWord,
  searchWord,
  getAllWords,
};
