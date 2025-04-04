require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3000,
    notificationService: {
        host: process.env.NOTIFICATION_SERVICE_HOST || "http://localhost:5001",
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