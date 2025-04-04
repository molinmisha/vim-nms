const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const InMemoryUserRepository = require("./userRepository/inMemoryUserRepository");
const EmailNotificationStrategy = require("./notificationStrategies/emailNotificationStrategy");
const SmsNotificationStrategy = require("./notificationStrategies/smsNotificationStrategy");
const NotificationContext = require("./notificationContext");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Middleware для проверки авторизации
app.use((req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (authHeader !== "Bearer onlyvim2024") {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
});

// Конфигурация сервиса уведомлений
const notificationServiceConfig = {
    host: process.env.NOTIFICATION_SERVICE_HOST || "http://localhost:5001",
    endpoints: {
        email: "/send-email",
        sms: "/send-sms",
    },
};

// Конфигурация повторных запросов из переменных окружения (с значениями по умолчанию)
const retryConfig = {
    maxRetries: parseInt(process.env.MAX_RETRIES) || 5,
    retryInterval: parseInt(process.env.RETRY_INTERVAL) || 2000,
};

// Создаем экземпляр UserRepository (пока in-memory)
const userRepository = new InMemoryUserRepository();

/**
 * Функция для отправки уведомлений с повторными попытками.
 */
async function sendNotification(url, data) {
    let retries = 0;
    while (retries < retryConfig.maxRetries) {
        try {
            const response = await axios.post(url, data);
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(`Request failed with status code ${response.status}`);
            }
        } catch (err) {
            retries++;
            const isRetryable = err.response && (err.response.status === 429 || err.response.status === 500);
            if (!isRetryable) {
                throw err;
            }
            console.log(`Attempt ${retries} of ${retryConfig.maxRetries} failed for ${url}: ${err.message}, waiting ${retryConfig.retryInterval}ms`);
            if (retries === retryConfig.maxRetries) {
                throw new Error(`${err.message} (after ${retryConfig.maxRetries} retries)`);
            }
            await new Promise((resolve) => setTimeout(resolve, retryConfig.retryInterval));
        }
    }
}

// Send Notifications
app.post("/notifications", async (req, res) => {
    const { userId, message } = req.body;
    const user = userRepository.getUser(userId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const responses = [];
    let hasError = false;
    let hasSuccess = false;

    const context = new NotificationContext();

    for (const channel in user.preferences) {
        if (user.preferences[channel]) {
            try {
                let strategy;
                if (channel === "email") {
                    strategy = new EmailNotificationStrategy(notificationServiceConfig);
                } else if (channel === "sms") {
                    strategy = new SmsNotificationStrategy(notificationServiceConfig);
                } else {
                    console.warn(`Skipping unsupported notification channel: ${channel}`);
                    continue;
                }
                context.setStrategy(strategy);
                const response = await context.sendNotification(user, message);
                responses.push(response);
                console.log(`${channel} sent to ${user[channel]}`);
                hasSuccess = true; // Успешная отправка
            } catch (err) {
                console.error(`${channel} error: ${err.message}`);
                let responseDetails = {
                    error: `${channel} error: ${err.message}`,
                };
                if (err.response) {
                    responseDetails.response = {
                        status: err.response.status,
                        data: err.response.data,
                    };
                }
                responses.push(responseDetails);
                hasError = true; // Ошибка при отправке
            }
        }
    }

    if (hasError && hasSuccess) {
        // Частичный успех: некоторые каналы сработали, некоторые нет
        return res.status(207).json({
            message: "Notifications sent with partial success",
            details: responses,
        });
    } else if (hasError) {
        // Полный провал: ничего не отправилось
        return res.status(500).json({
            error: "Failed to send notifications",
            details: responses,
        });
    }

    // Полный успех: всё отправилось
    res.status(200).json({
        message: "Notifications sent",
        details: responses,
    });
});

// Edit User Preferences
app.post("/users/preferences", (req, res) => {
    const { userId, preferences } = req.body;
    if (userRepository.updateUser(userId, preferences)) {
        res.json({ message: "Preferences updated", userId });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// Create User Preferences
app.post("/users", (req, res) => {
    const { email, telephone, preferences } = req.body;
    const userId = userRepository.createUser(email, telephone, preferences);

    if (userId) {
        res.json({ message: "User created", userId });
    } else {
        res.status(500).json({ error: "User creation failed" });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});