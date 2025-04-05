// Loads environment variables from a .env file using dotenv.
require("dotenv").config();

// Configuration object for the application.
module.exports = {
    // Port on which the server listens, defaults to 8080 for Docker compatibility.
    port: process.env.PORT || 8080,

    // Configuration for the external notification service.
    notificationService: {
        // Host URL of the notification service, defaults to Docker service name.
        host: process.env.NOTIFICATION_SERVICE_HOST || "http://notification-service:5001",
        
        // Endpoints for different notification channels.
        endpoints: {
            email: "/send-email", // Endpoint for sending emails.
            sms: "/send-sms",     // Endpoint for sending SMS.
        },
        
        // Retry configuration for handling failed requests.
        retry: {
            // Maximum number of retries, defaults to 5.
            maxRetries: parseInt(process.env.MAX_RETRIES) || 5,
            // Interval between retries in milliseconds, defaults to 2000ms.
            retryInterval: parseInt(process.env.RETRY_INTERVAL) || 2000,
        },
    },
    
    // Authentication token, defaults to a placeholder value.
    authToken: process.env.AUTH_TOKEN || "Bearer onlyvim2024",
};