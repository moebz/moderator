const testConnection = async (client) => {
  const result = await client.query("SELECT current_database();");
  return result.rows;
};

const getDatabases = async (client) => {
  const result = await client.query(
    "SELECT datname FROM pg_database WHERE datistemplate = false;"
  );
  return result.rows;
};

const getTables = async (client) => {
  const result = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  return result.rows;
};

const createClientTable = async (client) => {
  const query = `
  CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    feat_leven BOOLEAN DEFAULT false,
    feat_persp BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
  const result = await client.query(query);
  return result;
};

const insertTestClient = async (client) => {
  const query = `
    INSERT INTO clients (name,
    feat_leven,
    feat_persp,
    api_key) 
    VALUES ('AwesomeBlog',
    true,
    true,
    'TxlyMqTQ2xZEFCGZPeIRAd0qkS6Bui5u') 
    ON CONFLICT (api_key) DO NOTHING;
    `;
  const result = await client.query(query);
  return result;
};

module.exports = {
  testConnection,
  getDatabases,
  getTables,
  createClientTable,
  insertTestClient,
};
