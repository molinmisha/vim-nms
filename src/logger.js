// Import the Winston logging library.
const winston = require("winston");

// Create a Winston logger instance.
const logger = winston.createLogger({
    // Set the logging level to "info" (includes info, warn, error).
    level: "info",
    
    // Define the log format: timestamp and JSON structure.
    format: winston.format.combine(
        winston.format.timestamp(), // Adds a timestamp to each log entry.
        winston.format.json()       // Formats logs as JSON objects.
    ),
    
    // Output logs to the console.
    transports: [new winston.transports.Console()],
});

// Export the logger for use across the application.
module.exports = { logger };