const mongoose = require('mongoose');

/**
 * Connects to MongoDB. We keep pool size explicit because under load
 * (thousands of concurrent users) the default pool can become a bottleneck
 * or, conversely, exhaust connections on the DB server if left unbounded.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy .env.example to .env and configure it.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    maxPoolSize: 50,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
  });

  const conn = mongoose.connection;
  conn.on('error', (err) => console.error('[mongo] connection error:', err.message));
  conn.on('disconnected', () => console.warn('[mongo] disconnected'));

  console.log(`[mongo] connected -> ${conn.host}/${conn.name}`);
  return conn;
}

module.exports = connectDB;
