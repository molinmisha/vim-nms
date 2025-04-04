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

const app = express();

app.use(bodyParser.json());
app.use(authMiddleware);

// Создаем экземпляр UserRepository
const userRepository = new InMemoryUserRepository();

// Send Notifications
app.post("/notifications", validateNotificationInput, async (req, res) => {
    const { userId, message } = req.body;
    try {
        const { responses, successfulChannels, totalChannels } = await sendNotifications(userRepository, userId, message);
        const { status, message: statusMessage } = determineResponseStatus(successfulChannels, totalChannels);
        const responseBody = status >= 400 ? { error: statusMessage, details: responses } : { message: statusMessage, details: responses };
        return res.status(status).json(responseBody);
    } catch (err) {
        if (err.message === "User not found") {
            return res.status(404).json({ error: "User not found" });
        }
        throw err; // Проброс в глобальный обработчик
    }
});

// Edit User Preferences
app.post("/users/preferences", validatePreferencesInput, (req, res) => {
    const { userId, preferences } = req.body;
    if (userRepository.updateUser(userId, preferences)) {
        res.json({ message: "Preferences updated", userId });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// Create User Preferences
app.post("/users", validateUserCreationInput, (req, res) => {
    const { email, telephone, preferences } = req.body;
    const userId = userRepository.createUser(email, telephone, preferences);

    if (userId) {
        res.json({ message: "User created", userId });
    } else {
        res.status(500).json({ error: "User creation failed" });
    }
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
    logger.info(`Server listening at http://localhost:${config.port}`);
});