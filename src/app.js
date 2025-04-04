// src/app.js

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const InMemoryUserRepository = require("./userRepository/inMemoryUserRepository"); // Импорт UserRepository
const EmailNotificationStrategy = require("./notificationStrategies/emailNotificationStrategy");
const SmsNotificationStrategy = require("./notificationStrategies/smsNotificationStrategy");
const NotificationContext = require("./notificationContext");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Конфигурация повторных запросов из переменных окружения (с значениями по умолчанию)
const retryConfig = {
    maxRetries: parseInt(process.env.MAX_RETRIES) || 5, // Максимальное количество попыток (по умолчанию 5)
    retryInterval: parseInt(process.env.RETRY_INTERVAL) || 2000, // Интервал между попытками (в миллисекундах, по умолчанию 2000)
};

// Создаем экземпляр UserRepository (пока in-memory)
const userRepository = new InMemoryUserRepository();

/**
 * Функция для отправки уведомлений с повторными попытками.
 *
 * @param {string} url - URL-адрес для отправки запроса.
 * @param {object} data - Данные для отправки в запросе.
 * @returns {Promise<object>} - Ответ от сервера.
 * @throws {Error} - Ошибка, если отправка уведомления не удалась после всех попыток.
 */
async function sendNotification(url, data) {
    let retries = 0;
    let lastError = null; // Объединяем lastResponse и lastError в одну переменную
    while (retries < retryConfig.maxRetries) {
        try {
            const response = await axios.post(url, data);
            if (response.status === 200) {
                return response.data; // Успешный запрос
            } else {
                lastError = { message: `Request failed with status code ${response.status}`, response: response.data }; // Сохраняем ошибку и ответ
                retries++;
                console.log(`Retry ${retries} for ${url}`);
                await new Promise((resolve) => setTimeout(resolve, retryConfig.retryInterval)); // Задержка перед повторным запросом
            }
        } catch (err) {
            if (err.response && (err.response.status === 429 || err.response.status === 500)) {
                retries++;
                lastError = err; // Сохраняем ошибку и ответ
                console.log(`Retry ${retries} for ${url}`);
                await new Promise((resolve) => setTimeout(resolve, retryConfig.retryInterval)); // Задержка перед повторным запросом
            } else {
                throw err; // Другие ошибки
            }
        }
    }
    if (lastError) {
        throw lastError; // Выбрасываем последнюю ошибку после всех попыток
    } else {
        throw { message: `Failed to send notification after ${retryConfig.maxRetries} retries`, response: null }; // Ошибка после всех попыток
    }
}

// Send Notifications
app.post("/notifications", async (req, res) => {
    const { userId, message } = req.body;
    const user = userRepository.getUser(userId); // Получаем пользователя из UserRepository

    if (!user) {
        return res.status(404).json({ error: "User not found" }); // Возвращаем ошибку, если пользователь не найден
    }

    const responses = [];
    let hasError = false;

    const context = new NotificationContext();

    for (const channel in user.preferences) {
        if (user.preferences[channel]) {
            try {
                let strategy;
                if (channel === "email") {
                    strategy = new EmailNotificationStrategy(); // Создаем стратегию для email
                } else if (channel === "sms") {
                    strategy = new SmsNotificationStrategy(); // Создаем стратегию для sms
                } else {
                    throw new Error(`Unsupported notification channel: ${channel}`); // Обработка неподдерживаемого канала
                }
                context.setStrategy(strategy); // Устанавливаем стратегию
                const response = await context.sendNotification(user, message); // Отправляем уведомление
                responses.push(response);
                console.log(`${channel} sent to ${user[channel]}`);
            } catch (err) {
                console.error(`${channel} error: ${err.message}`, err.response);
                let responseDetails = {
                    error: `${channel} error: ${err.message} (after ${retryConfig.maxRetries} retries)`, // Добавляем информацию о количестве попыток
                };
                if (err.response) {
                    // Выбираем только необходимые свойства из err.response
                    responseDetails.response = {
                        status: err.response.status,
                        data: err.response.data,
                        headers: err.response.headers,
                    };
                }
                responses.push(responseDetails);
                hasError = true;
            }
        }
    }

    if (hasError) {
        return res.status(500).json({ error: "Failed to send notifications", details: responses }); // Возвращаем ошибку, если есть ошибки
    }

    res.json({ message: "Notifications sent", details: responses }); // Возвращаем успешный ответ
});

// Edit User Preferences
app.post("/users/preferences", (req, res) => {
    const { userId, preferences } = req.body;
    if (userRepository.updateUser(userId, preferences)) { // Обновляем предпочтения пользователя
        res.send("Preferences updated"); // Возвращаем успешный ответ
    } else {
        res.status(404).json({ error: "User not found" }); // Возвращаем ошибку, если пользователь не найден
    }
});

// Create User Preferences
app.post("/users", (req, res) => {
    const { email, telephone, preferences } = req.body;
    const userId = userRepository.createUser(email, telephone, preferences); // Создаем пользователя

    if (userId) {
        res.json({ message: "User created", userId }); // Возвращаем ID пользователя
    } else {
        res.status(500).json({ error: "User creation failed" }); // Возвращаем ошибку, если создание пользователя не удалось
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});