/**
 * Logger utility for MCP IDE integration
 */

/**
 * Creates a logger instance with the specified name
 * 
 * @param {string} name The name of the logger instance
 * @returns {Object} A logger object with info, warn, error, and debug methods
 */
export function initializeLogger(name) {
  // Log level, can be controlled via configuration in a real extension
  const logLevel = process.env.LOG_LEVEL || 'info';
  
  // Map log levels to numeric values
  const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  
  // Only log messages at or above the configured level
  const shouldLog = (level) => levels[level] >= levels[logLevel];
  
  // Format the log message with timestamp and logger name
  const formatMessage = (level, message) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${name}] ${message}`;
  };
  
  return {
    debug: (message, ...args) => {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', message), ...args);
      }
    },
    info: (message, ...args) => {
      if (shouldLog('info')) {
        console.info(formatMessage('info', message), ...args);
      }
    },
    warn: (message, ...args) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', message), ...args);
      }
    },
    error: (message, ...args) => {
      if (shouldLog('error')) {
        console.error(formatMessage('error', message), ...args);
      }
    }
  };
}