require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

(async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[server] Feedants API listening on http://localhost:${PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`[server] received ${signal}, shutting down gracefully...`);
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[server] failed to start:', err);
    process.exit(1);
  }
})();
