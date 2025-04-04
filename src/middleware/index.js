const config = require("../config");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (authHeader !== config.authToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};

const validateNotificationInput = (req, res, next) => {
    const { userId, message } = req.body;
    if (!userId || typeof userId !== "number") {
        return res.status(400).json({ error: "Invalid or missing userId" });
    }
    if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Invalid or missing message" });
    }
    next();
};

const validatePreferencesInput = (req, res, next) => {
    const { userId, preferences } = req.body;
    if (!userId || typeof userId !== "number") {
        return res.status(400).json({ error: "Invalid or missing userId" });
    }
    if (!preferences || typeof preferences !== "object") {
        return res.status(400).json({ error: "Invalid or missing preferences" });
    }
    next();
};

const validateUserCreationInput = (req, res, next) => {
    const { email, telephone, preferences } = req.body;
    if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Invalid or missing email" });
    }
    if (!telephone || typeof telephone !== "string") {
        return res.status(400).json({ error: "Invalid or missing telephone" });
    }
    if (!preferences || typeof preferences !== "object") {
        return res.status(400).json({ error: "Invalid or missing preferences" });
    }
    next();
};

module.exports = {
    authMiddleware,
    validateNotificationInput,
    validatePreferencesInput,
    validateUserCreationInput,
};