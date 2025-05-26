const fs = require("fs");
const path = require("path");

const insertWordsFromFile = async (client) => {
  const filePath = path.join(__dirname, "../../badWords.json");
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
  insertWordsFromFile,
  addWord,
  searchWord,
  getAllWords,
};
