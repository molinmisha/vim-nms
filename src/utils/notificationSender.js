// Import required modules.
const axios = require("axios");
const { logger } = require("../logger");

// Sends a notification with retry logic for transient failures.
// @param {string} url - The URL to send the notification to.
// @param {object} data - The data payload for the request (e.g., { email, message }).
// @param {object} retryConfig - Retry configuration with maxRetries and retryInterval.
// @returns {Promise<object>} - The response data from the server.
// @throws {Error} - Throws an error with retry details if all attempts fail.
async function sendNotification(url, data, retryConfig) {
    let retries = 0; // Track the number of retry attempts.
    
    while (retries < retryConfig.maxRetries) {
        try {
            // Attempt to send the POST request using axios.
            const response = await axios.post(url, data);
            
            // Check if the request was successful (200 OK).
            if (response.status === 200) {
                return response.data; // Return the response data on success.
            }
            
            // Throw an error for non-200 responses.
            throw new Error(`Request failed with status code ${response.status}`);
        } catch (err) {
            retries++; // Increment retry count.
            
            // Determine if the error is retryable (429 Too Many Requests or 500 Internal Server Error).
            const isRetryable = err.response && (err.response.status === 429 || err.response.status === 500);
            
            // If not retryable, throw the error immediately.
            if (!isRetryable) throw err;
            
            // Log the retry attempt.
            logger.info(`Attempt ${retries} of ${retryConfig.maxRetries} failed for ${url}: ${err.message}, waiting ${retryConfig.retryInterval}ms`);
            
            // If max retries reached, throw a final error.
            if (retries === retryConfig.maxRetries) {
                throw new Error(`${err.message} (after ${retryConfig.maxRetries} retries)`);
            }
            
            // Wait before the next retry.
            await new Promise((resolve) => setTimeout(resolve, retryConfig.retryInterval));
        }
    }
}

// Export the sendNotification function.
module.exports = { sendNotification };