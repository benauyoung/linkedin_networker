/**
 * Logger utility for EVENT CONNECT application
 * Provides consistent logging across the application with proper formatting
 * and severity levels. In production, this could be extended to log to external
 * services like Sentry, LogRocket, or similar.
 */

// Environment-aware logging (more detailed in development)
const isDev = process.env.NODE_ENV !== 'production';

// Severity levels with corresponding colors
const LOG_LEVELS = {
  INFO: {
    name: 'INFO',
    color: '\x1b[36m', // Cyan
    emoji: '📝'
  },
  SUCCESS: {
    name: 'SUCCESS',
    color: '\x1b[32m', // Green
    emoji: '✅'
  },
  WARNING: {
    name: 'WARNING',
    color: '\x1b[33m', // Yellow
    emoji: '⚠️'
  },
  ERROR: {
    name: 'ERROR',
    color: '\x1b[31m', // Red
    emoji: '❌'
  },
  DEBUG: {
    name: 'DEBUG',
    color: '\x1b[35m', // Magenta
    emoji: '🔍'
  }
};

// Reset color code
const RESET = '\x1b[0m';

/**
 * Format log message with timestamp, severity level, and optional request ID
 * @param {Object} level - Log level object from LOG_LEVELS
 * @param {String} message - The message to log
 * @param {String} [requestId] - Optional request ID for tracking
 * @returns {String} Formatted log message
 */
function formatMessage(level, message, requestId = '') {
  const timestamp = new Date().toISOString();
  const reqIdStr = requestId ? ` [${requestId}]` : '';
  
  // In non-terminal environments (like Vercel logs), don't use colors
  if (process.env.VERCEL) {
    return `${timestamp} ${level.emoji} ${level.name}${reqIdStr}: ${message}`;
  }

  return `${timestamp} ${level.color}${level.name}${RESET}${reqIdStr}: ${message}`;
}

/**
 * Format error objects into detailed strings
 * @param {Error} error - Error object
 * @returns {String} Formatted error details
 */
function formatError(error) {
  if (!error) return 'Unknown error';
  
  const details = [];
  details.push(`Name: ${error.name || 'Error'}`);
  details.push(`Message: ${error.message || 'No message'}`);
  
  if (error.code) details.push(`Code: ${error.code}`);
  if (error.stack && isDev) details.push(`Stack: ${error.stack}`);
  
  // Handle Mongoose/MongoDB specific errors
  if (error.name === 'ValidationError' && error.errors) {
    details.push('Validation Errors:');
    Object.keys(error.errors).forEach(field => {
      details.push(`  - ${field}: ${error.errors[field].message}`);
    });
  }
  
  return details.join('\n');
}

/**
 * Core logging function
 * @param {Object} level - Log level object from LOG_LEVELS
 * @param {String|Object} message - Message or object to log
 * @param {Error} [error] - Optional error object
 * @param {String} [requestId] - Optional request ID
 */
function log(level, message, error = null, requestId = '') {
  let finalMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
  
  // Log to console (which Vercel captures)
  console.log(formatMessage(level, finalMessage, requestId));
  
  // If there's an error, log its details
  if (error) {
    const errorDetails = formatError(error);
    console.log(formatMessage(LOG_LEVELS.ERROR, 'Error Details:', requestId));
    console.log(errorDetails);
  }
  
  // In production, you might want to send logs to external services
  if (level === LOG_LEVELS.ERROR && process.env.NODE_ENV === 'production') {
    // This is where you'd integrate with error tracking services like Sentry
    // Example: Sentry.captureException(error);
  }
}

// Exported logging methods
const logger = {
  info: (message, requestId = '') => log(LOG_LEVELS.INFO, message, null, requestId),
  success: (message, requestId = '') => log(LOG_LEVELS.SUCCESS, message, null, requestId),
  warn: (message, error = null, requestId = '') => log(LOG_LEVELS.WARNING, message, error, requestId),
  error: (message, error = null, requestId = '') => log(LOG_LEVELS.ERROR, message, error, requestId),
  debug: (message, data = null, requestId = '') => {
    if (isDev) {
      log(LOG_LEVELS.DEBUG, message, null, requestId);
      if (data) {
        console.log('Debug Data:');
        console.log(data);
      }
    }
  },
  // Request logger middleware for Express
  requestLogger: (req, res, next) => {
    // Generate a unique request ID
    const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
    req.requestId = requestId;
    
    const startTime = Date.now();
    
    logger.info(`${req.method} ${req.url}`, requestId);
    
    // Log request body in development mode
    if (isDev && req.method !== 'GET' && req.body) {
      logger.debug('Request Body:', req.body, requestId);
    }
    
    // Capture response
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - startTime;
      const size = body ? body.length : 0;
      
      const logMessage = `${req.method} ${req.url} - ${res.statusCode} (${duration}ms, ${size} bytes)`;
      
      if (res.statusCode >= 500) {
        logger.error(logMessage, null, requestId);
      } else if (res.statusCode >= 400) {
        logger.warn(logMessage, null, requestId);
      } else {
        logger.info(logMessage, requestId);
      }
      
      originalSend.apply(res, arguments);
    };
    
    next();
  },
  // Error handler middleware for Express
  errorHandler: (err, req, res, next) => {
    const requestId = req.requestId || '';
    
    logger.error(`Unhandled error in ${req.method} ${req.url}`, err, requestId);
    
    // Don't expose error details in production
    const errorResponse = {
      error: 'Internal Server Error',
      requestId: requestId,
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
    };
    
    res.status(500).json(errorResponse);
  }
};

module.exports = logger;
