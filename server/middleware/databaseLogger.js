const { logger } = require('../utils/logger');

const databaseLogger = (req, res, next) => {
  // Log the request details for database-related endpoints
  if (req.path.includes('/api/evaluations') || req.path.includes('/api/events')) {
    logger.db('api_request', {
      method: req.method,
      path: req.path,
      params: req.params,
      query: req.query,
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
      timestamp: new Date().toISOString(),
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  }
  next();
};

module.exports = databaseLogger;