// Import the notification sender utility for making HTTP requests.
const { sendNotification } = require("../utils/notificationSender");

// Defines the SmsNotificationStrategy class for sending SMS notifications.
class SmsNotificationStrategy {
    // Constructor initializes the strategy with configuration.
    // @param {object} config - Configuration object containing host, endpoints, and retry settings.
    constructor(config) {
        this.config = config; // Stores the configuration for use in sending notifications.
    }

    // Sends an SMS notification to the user's telephone number.
    // @param {object} user - The user object with a 'telephone' field.
    // @param {string} message - The message content to send.
    // @returns {Promise<object>} - A promise resolving to an object with send result details.
    async send(user, message) {
        // Construct the URL for the SMS endpoint using the configured host and endpoint.
        const url = `${this.config.host}${this.config.endpoints.sms}`;
        
        // Send the notification via the utility function with retry logic.
        const response = await sendNotification(url, { telephone: user.telephone, message }, this.config.retry);
        
        // Return a structured result object with status and recipient details.
        return {
            status: "sent",          // Indicates the notification was successfully sent.
            channel: "sms",          // Specifies the channel used.
            to: user.telephone,      // The recipient's telephone number.
            message                  // The message that was sent.
        };
    }
}

// Exports the SmsNotificationStrategy class for use in the notification service.
module.exports = SmsNotificationStrategy;