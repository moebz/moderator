const {
  ComprehendClient,
  DetectToxicContentCommand,
} = require("@aws-sdk/client-comprehend");

console.log("process.env", process.env);

const client = new ComprehendClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const detectToxicContent = async (text) => {
  const params = {
    TextSegments: [
      {
        Text: text,
      },
    ],
    LanguageCode: "en", // Solamente inglés permitido hoy en día.
  };

  try {
    const command = new DetectToxicContentCommand(params);
    const response = await client.send(command);
    return response.ResultList[0];
  } catch (error) {
    console.error("Error detecting toxic content:", error);
    throw error;
  }
};

module.exports = {
  detectToxicContent,
};
