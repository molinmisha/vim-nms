require("dotenv").config();

module.exports = {
    port: process.env.PORT || 8080, // Дефолт для Docker
    notificationService: {
        host: process.env.NOTIFICATION_SERVICE_HOST || "http://notification-service:5001", // Дефолт для Docker
        endpoints: {
            email: "/send-email",
            sms: "/send-sms",
        },
        retry: {
            maxRetries: parseInt(process.env.MAX_RETRIES) || 5,
            retryInterval: parseInt(process.env.RETRY_INTERVAL) || 2000,
        },
    },
    authToken: process.env.AUTH_TOKEN || "Bearer onlyvim2024",
};