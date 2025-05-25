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

module.exports = {
  testConnection,
  getDatabases,
  getTables,
};