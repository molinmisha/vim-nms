// Creates an error response object for failed notification attempts.
// @param {string} channel - The notification channel (e.g., "email", "sms").
// @param {Error} err - The error object containing details of the failure.
// @returns {object} - An object with error details.
function createErrorResponse(channel, err) {
    return {
        error: `${channel} error: ${err.message}`, // Descriptive error message.
        response: err.response ? {                 // Optional response details if available.
            status: err.response.status,
            data: err.response.data,
        } : undefined,
    };
}

// Determines the HTTP status code and message based on notification results.
// @param {number} successfulChannels - Number of channels that succeeded.
// @param {number} totalChannels - Total number of channels attempted.
// @returns {object} - Object with status code and message.
function determineResponseStatus(successfulChannels, totalChannels) {
    // No channels to send to is still a success (200).
    if (totalChannels === 0) {
        return { status: 200, message: "No notifications to send" };
    }
    
    // All channels succeeded (200).
    if (successfulChannels === totalChannels) {
        return { status: 200, message: "Notifications sent" };
    }
    
    // Some channels succeeded (207 Partial Success).
    if (successfulChannels > 0) {
        return { status: 207, message: "Notifications sent partially" };
    }
    
    // No channels succeeded (500 Failure).
    return { status: 500, message: "Failed to send notifications" };
}

// Export utility functions for use in other modules.
module.exports = { createErrorResponse, determineResponseStatus };