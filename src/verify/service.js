const axios = require("axios");
const { detectToxicContent } = require("../utils/awsComprehend");

const verifyWithLevenshtein = async (client, text) => {
  // Transform characters to spaces
  const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, " ");

  // Split the text into words by spaces
  const words = sanitizedText.split(/\s+/);

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

  console.log("words:", words);

  console.log("Levenshtein result:", result.rows);

  if (result.rows.length > 0) {
    return { match: true, word: result.rows[0].word };
  } else {
    return { match: false };
  }
};

const verifyWithComprehend = async (text) => {
  if (!text) {
    throw new Error("Text is required");
  }

  const result = await detectToxicContent(text);
  return {
    isToxic: result.Toxicity > 0.5,
    scores: result.Labels.reduce((acc, label) => {
      acc[label.Name] = label.Score;
      return acc;
    }, {}),
  };
};

const verifyWithPerspectiveAPI = async (text) => {
  if (!text) {
    throw new Error("Text is required");
  }

  const response = await axios.post(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
    {
      comment: { text },
      languages: ["es"],
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        IDENTITY_ATTACK: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {},
        // SEXUALLY_EXPLICIT: {}, // Experimental - solo inglés
        // FLIRTATION: {}, // Experimental - solo inglés
      },
      doNotStore: true,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;
};

const go = async (client, apiClientToken, text) => {
  if (!text) {
    throw new Error("Text is required");
  }

  if (!apiClientToken) {
    throw new Error("API client token is required");
  }

  const apiClientQuery = await client.query(
    "SELECT * FROM clients WHERE api_key = $1",
    [apiClientToken]
  );

  if (apiClientQuery.rows.length === 0) {
    throw new Error("Invalid API client token");
  }

  const apiClient = apiClientQuery.rows[0];

  let methodsUsed = [];

  if (apiClient.feat_leven) {
    methodsUsed.push("v1");

    const levenResult = await verifyWithLevenshtein(client, text);

    if (levenResult.match) {
      return { shouldReject: true, methodsUsed };
    }
  }

  if (apiClient.feat_persp) {
    methodsUsed.push("v2");

    const perspectiveResult = await verifyWithPerspectiveAPI(text);

    // Check if any of the scores exceed the threshold
    const attributes = [
      "TOXICITY",
      "SEVERE_TOXICITY",
      "IDENTITY_ATTACK",
      "INSULT",
      "PROFANITY",
      "THREAT",
      "SEXUALLY_EXPLICIT",
      "FLIRTATION",
    ];

    console.log("perspectiveResult:", JSON.stringify(perspectiveResult));

    const shouldReject = attributes.some((attr) => {
      const score =
        perspectiveResult.attributeScores[attr]?.summaryScore?.value || 0;
      return score > 0.5;
    });

    if (shouldReject) {
      return { shouldReject: true, methodsUsed };
    }
  }

  return { shouldReject: false, methodsUsed };
};

module.exports = {
  go,
  verifyWithLevenshtein,
  verifyWithComprehend,
  verifyWithPerspectiveAPI,
};
