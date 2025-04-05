// Import the notification sender utility for making HTTP requests.
const { sendNotification } = require("../utils/notificationSender");

// Defines the EmailNotificationStrategy class for sending email notifications.
class EmailNotificationStrategy {
    // Constructor initializes the strategy with configuration.
    // @param {object} config - Configuration object containing host, endpoints, and retry settings.
    constructor(config) {
        this.config = config; // Stores the configuration for use in sending notifications.
    }

    // Sends an email notification to the user's email address.
    // @param {object} user - The user object with an 'email' field.
    // @param {string} message - The message content to send.
    // @returns {Promise<object>} - A promise resolving to an object with send result details.
    async send(user, message) {
        // Construct the URL for the email endpoint using the configured host and endpoint.
        const url = `${this.config.host}${this.config.endpoints.email}`;
        
        // Send the notification via the utility function with retry logic.
        const response = await sendNotification(url, { email: user.email, message }, this.config.retry);
        
        // Return a structured result object with status and recipient details.
        return {
            status: "sent",          // Indicates the notification was successfully sent.
            channel: "email",        // Specifies the channel used.
            to: user.email,          // The recipient's email address.
            message                  // The message that was sent.
        };
    }
}

// Exports the EmailNotificationStrategy class for use in the notification service.
module.exports = EmailNotificationStrategy;