// Import required modules.
const express = require("express");
const bodyParser = require("body-parser");
const InMemoryUserRepository = require("./userRepository/inMemoryUserRepository");
const { createErrorResponse, determineResponseStatus } = require("./utils/responseUtils");
const config = require("./config");
const { logger } = require("./logger");
const {
    authMiddleware,
    validateNotificationInput,
    validatePreferencesInput,
    validateUserCreationInput,
} = require("./middleware");
const { sendNotifications } = require("./services/notificationService");

// Initialize the Express application.
const app = express();

// Middleware to parse JSON request bodies.
app.use(bodyParser.json());

// Middleware to enforce authentication on all routes.
app.use(authMiddleware);

// Create an instance of the in-memory user repository.
const userRepository = new InMemoryUserRepository();

// Route to send notifications to a user.
app.post("/notifications", validateNotificationInput, async (req, res) => {
    // Extract userId and message from the request body.
    const { userId, message } = req.body;
    
    try {
        // Send notifications and get the result.
        const { responses, successfulChannels, totalChannels } = await sendNotifications(userRepository, userId, message);
        
        // Determine the HTTP status and message based on the sending result.
        const { status, message: statusMessage } = determineResponseStatus(successfulChannels, totalChannels);
        
        // Prepare the response body: error for failures, success message otherwise.
        const responseBody = status >= 400 ? { error: statusMessage, details: responses } : { message: statusMessage, details: responses };
        
        // Send the response with the determined status code.
        return res.status(status).json(responseBody);
    } catch (err) {
        // Handle specific error for user not found.
        if (err.message === "User not found") {
            return res.status(404).json({ error: "User not found" });
        }
        // Re-throw other errors to the global error handler.
        throw err;
    }
});

// Route to update user notification preferences.
app.post("/users/preferences", validatePreferencesInput, (req, res) => {
    // Extract userId and preferences from the request body.
    const { userId, preferences } = req.body;
    
    // Update the user's preferences and respond accordingly.
    if (userRepository.updateUser(userId, preferences)) {
        res.json({ message: "Preferences updated", userId });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// Route to create a new user.
app.post("/users", validateUserCreationInput, (req, res) => {
    // Extract email, telephone, and preferences from the request body.
    const { email, telephone, preferences } = req.body;
    
    // Create a new user and get the assigned userId.
    const userId = userRepository.createUser(email, telephone, preferences);

    // Respond with success or failure.
    if (userId) {
        res.json({ message: "User created", userId });
    } else {
        res.status(500).json({ error: "User creation failed" });
    }
});

// Global error handler for uncaught exceptions.
app.use((err, req, res, next) => {
    // Log the error stack for debugging.
    logger.error(err.stack);
    
    // Respond with a generic internal server error.
    res.status(500).json({ error: "Internal server error" });
});

// Start the server on the configured port.
app.listen(config.port, () => {
    // Log the server start event.
    logger.info(`Server listening at http://localhost:${config.port}`);
});