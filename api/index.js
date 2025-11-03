const app = require('../src/app');
const connectDB = require('../src/config/database');

let isConnected = false;

module.exports = async (req, res) => {
  try {
    // Only attempt DB connection for API routes; allow /health without DB
    if (!isConnected && req.url.startsWith('/api')) {
      await connectDB();
      isConnected = true;
    }
    return app(req, res);
  } catch (err) {
    console.error('Serverless function error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
};
