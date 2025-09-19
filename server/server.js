const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '../.env' });
const { httpLogger, logger } = require('./utils/logger');



// Import routes
const eventRoutes = require('./routes/eventRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(httpLogger);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Database connection
const configuredDbName = process.env.MONGODB_DB || process.env.MONGODB_DBNAME;
logger.info('[DB] Attempting to connect to MongoDB...');
try {
  logger.db('connection_attempt', {
    uri: (process.env.MONGODB_URI || '').replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
    database: configuredDbName || (process.env.MONGODB_URI ? process.env.MONGODB_URI.split('/').pop().split('?')[0] : undefined)
  });
} catch (_) {
  // no-op: avoid crashing on malformed URIs in logs
}

mongoose.connect(process.env.MONGODB_URI, configuredDbName ? { dbName: configuredDbName } : undefined)
.then(() => {
  logger.info('[DB] ✅ Connected to MongoDB successfully');
  logger.db('connection_success', { 
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    readyState: mongoose.connection.readyState
  });
  
  // Monitor connection events
  mongoose.connection.on('disconnected', () => {
    logger.error('[DB] 🔌 Disconnected from MongoDB');
  });
  
  mongoose.connection.on('reconnected', () => {
    logger.info('[DB] 🔄 Reconnected to MongoDB');
  });
  
  mongoose.connection.on('error', (err) => {
    logger.error('[DB] MongoDB connection error:', err);
  });
})
.catch((error) => {
  logger.error('[DB] ❌ MongoDB connection error', error);
  process.exit(1);
});

// Log all MongoDB operations
mongoose.set('debug', (collectionName, method, query, doc) => {
  logger.db('query', { collection: collectionName, method, query, doc });
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Serve static files from dist (when built)
app.use(express.static(path.join(__dirname, '../dist')));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'EvalSuite API Server is running!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      events: '/api/events',
      evaluations: '/api/evaluations'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;