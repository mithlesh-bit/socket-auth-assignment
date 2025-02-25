module.exports = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL, // Uses your Supabase connection
    pool: { min: 2, max: 10 },
    migrations: { tableName: "knex_migrations", directory: "./migrations" },
  },
};
