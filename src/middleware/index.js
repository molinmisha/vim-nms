// Import the application configuration module to access the auth token.
const config = require("../config");

// Middleware to enforce authentication on incoming requests by checking the Authorization header.
// @param {object} req - The Express request object containing headers and other request data.
// @param {object} res - The Express response object used to send responses back to the client.
// @param {function} next - The next function in the middleware chain to proceed if authentication succeeds.
const authMiddleware = (req, res, next) => {
    // Extract the Authorization header from the request (expected format: "Bearer <token>").
    const authHeader = req.headers["authorization"];
    
    // Compare the provided header with the configured auth token.
    if (authHeader !== config.authToken) {
        // If the header doesn't match, return a 401 Unauthorized response with an error message.
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    // If authentication succeeds, call the next middleware or route handler in the chain.
    next();
};

// Middleware to validate the input for the /notifications endpoint.
// Ensures that userId is a number and message is a string.
// @param {object} req - The Express request object containing the request body.
// @param {object} res - The Express response object used to send responses back to the client.
// @param {function} next - The next function in the middleware chain to proceed if validation passes.
const validateNotificationInput = (req, res, next) => {
    // Destructure userId and message from the request body.
    const { userId, message } = req.body;
    
    // Check if userId is present and is a number; if not, return a 400 Bad Request response.
    if (!userId || typeof userId !== "number") {
        return res.status(400).json({ error: "Invalid or missing userId" });
    }
    
    // Check if message is present and is a string; if not, return a 400 Bad Request response.
    if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Invalid or missing message" });
    }
    
    // If all validations pass, proceed to the next middleware or route handler.
    next();
};

// Middleware to validate the input for the /users/preferences endpoint.
// Ensures that userId is a number and preferences is an object.
// @param {object} req - The Express request object containing the request body.
// @param {object} res - The Express response object used to send responses back to the client.
// @param {function} next - The next function in the middleware chain to proceed if validation passes.
const validatePreferencesInput = (req, res, next) => {
    // Destructure userId and preferences from the request body.
    const { userId, preferences } = req.body;
    
    // Check if userId is present and is a number; if not, return a 400 Bad Request response.
    if (!userId || typeof userId !== "number") {
        return res.status(400).json({ error: "Invalid or missing userId" });
    }
    
    // Check if preferences is present and is an object; if not, return a 400 Bad Request response.
    if (!preferences || typeof preferences !== "object") {
        return res.status(400).json({ error: "Invalid or missing preferences" });
    }
    
    // If all validations pass, proceed to the next middleware or route handler.
    next();
};

// Middleware to validate the input for the /users endpoint (user creation).
// Ensures that email and telephone are strings, and preferences is an object.
// @param {object} req - The Express request object containing the request body.
// @param {object} res - The Express response object used to send responses back to the client.
// @param {function} next - The next function in the middleware chain to proceed if validation passes.
const validateUserCreationInput = (req, res, next) => {
    // Destructure email, telephone, and preferences from the request body.
    const { email, telephone, preferences } = req.body;
    
    // Check if email is present and is a string; if not, return a 400 Bad Request response.
    if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Invalid or missing email" });
    }
    
    // Check if telephone is present and is a string; if not, return a 400 Bad Request response.
    if (!telephone || typeof telephone !== "string") {
        return res.status(400).json({ error: "Invalid or missing telephone" });
    }
    
    // Check if preferences is present and is an object; if not, return a 400 Bad Request response.
    if (!preferences || typeof preferences !== "object") {
        return res.status(400).json({ error: "Invalid or missing preferences" });
    }
    
    // If all validations pass, proceed to the next middleware or route handler.
    next();
};

// Export all middleware functions as an object for use in other parts of the application.
module.exports = {
    authMiddleware,          // Middleware for authentication.
    validateNotificationInput, // Middleware for validating notification input.
    validatePreferencesInput,  // Middleware for validating preferences update input.
    validateUserCreationInput, // Middleware for validating user creation input.
};