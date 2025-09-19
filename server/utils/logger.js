const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Create separate log files for different types of logs
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
    path.join(logsDir, 'error.log'),
    { flags: 'a' }
);

const dbLogStream = fs.createWriteStream(
    path.join(logsDir, 'database.log'),
    { flags: 'a' }
);

// Custom logging format
const logFormat = ':timestamp :method :url :status :response-time ms - :remote-addr - :user-agent';

// Add timestamp token
morgan.token('timestamp', () => new Date().toISOString());

// Create logger middleware
const httpLogger = morgan(logFormat, {
    stream: accessLogStream
});

// Custom logging functions
const logger = {
    http: (message) => {
        const log = `[${new Date().toISOString()}] [HTTP] ${message}\n`;
        accessLogStream.write(log);
    },
    
    error: (message, error = null) => {
        const errorDetails = error ? `\nError: ${error.message}\nStack: ${error.stack}` : '';
        const log = `[${new Date().toISOString()}] [ERROR] ${message}${errorDetails}\n`;
        errorLogStream.write(log);
        console.error(log);
    },
    
    db: (operation, details) => {
        const log = `[${new Date().toISOString()}] [DATABASE] ${operation}: ${JSON.stringify(details)}\n`;
        dbLogStream.write(log);
    },
    
    info: (message) => {
        const log = `[${new Date().toISOString()}] [INFO] ${message}\n`;
        console.log(log);
        accessLogStream.write(log);
    }
};

module.exports = { httpLogger, logger };