// Import required modules and classes.
const NotificationContext = require("../notificationContext");
const { createErrorResponse, determineResponseStatus } = require("../utils/responseUtils");
const { logger } = require("../logger");
const config = require("../config");

// Define supported notification strategies.
const strategies = {
    email: require("../notificationStrategies/emailNotificationStrategy"),
    sms: require("../notificationStrategies/smsNotificationStrategy"),
};

// Sends a notification via a specific channel using the provided strategy.
// @param {string} channel - The notification channel (e.g., "email", "sms").
// @param {object} user - The user object with details like email or telephone.
// @param {string} message - The message to send.
// @param {NotificationContext} context - The context for managing the strategy.
// @returns {Promise<object|null>} - The result of the send operation or null if unsupported.
async function sendToChannel(channel, user, message, context) {
    const Strategy = strategies[channel]; // Retrieve the strategy for the channel.
    if (!Strategy) {
        logger.warn(`Skipping unsupported notification channel: ${channel}`);
        return null; // Return null for unsupported channels.
    }
    context.setStrategy(new Strategy(config.notificationService)); // Set the strategy in the context.
    const response = await context.sendNotification(user, message); // Send the notification.
    logger.info(`${channel} sent to ${response.to || "unknown-receiver"}`); // Log the result.
    return response; // Return the response from the strategy.
}

// Filters active and supported channels from user preferences.
// @param {object} preferences - The user's notification preferences.
// @returns {string[]} - Array of supported channel names.
function getSupportedChannels(preferences) {
    const channels = [];
    for (const channel in preferences) {
        if (preferences[channel]) { // Check if the channel is enabled.
            if (strategies[channel]) {
                channels.push(channel); // Add supported channels to the list.
            } else {
                logger.warn(`Channel ${channel} is enabled but not supported`);
            }
        }
    }
    return channels;
}

// Processes notification sending for a single channel.
// @param {string} channel - The notification channel.
// @param {object} user - The user object.
// @param {string} message - The message to send.
// @param {NotificationContext} context - The context for the strategy.
// @returns {Promise<object>} - The result of the send operation or an error object.
async function processChannel(channel, user, message, context) {
    try {
        const response = await sendToChannel(channel, user, message, context); // Attempt to send.
        if (response) {
            return response; // Return successful response.
        }
        return createErrorResponse(channel, new Error("No response from channel")); // Handle null response.
    } catch (err) {
        logger.error(`${channel} error: ${err.message}`); // Log the error.
        return createErrorResponse(channel, err); // Return error object.
    }
}

// Sends notifications to a user across all active channels.
// @param {object} userRepository - The repository for user data.
// @param {number} userId - The ID of the user.
// @param {string} message - The message to send.
// @returns {Promise<object>} - Object with send results and statistics.
// @throws {Error} - Throws if the user is not found.
async function sendNotifications(userRepository, userId, message) {
    const user = userRepository.getUser(userId); // Retrieve the user.
    if (!user) throw new Error("User not found"); // Throw error if user not found.

    const supportedChannels = getSupportedChannels(user.preferences); // Get active channels.
    const totalChannels = supportedChannels.length; // Total number of channels to process.
    const context = new NotificationContext(); // Initialize the notification context.
    const responses = []; // Array to store results from each channel.

    // Iterate over each supported channel and process the notification.
    for (const channel of supportedChannels) {
        const result = await processChannel(channel, user, message, context);
        responses.push(result);
    }

    // Count the number of successful sends (no errors).
    const successfulChannels = responses.filter(r => !r.error).length;
    
    // Return the results and statistics.
    return { responses, successfulChannels, totalChannels };
}

// Export the main service function.
module.exports = { sendNotifications };