const { sendNotification } = require("../utils/notificationSender");

class EmailNotificationStrategy {
    constructor(config) {
        this.config = config;
    }

    /**
     * Отправляет уведомление по email.
     * @param {object} user - Объект пользователя с полем email.
     * @param {string} message - Текст сообщения.
     * @returns {Promise<object>} - Результат отправки с информацией о получателе.
     */
    async send(user, message) {
        const url = `${this.config.host}${this.config.endpoints.email}`;
        const response = await sendNotification(url, { email: user.email, message }, this.config.retry);
        return {
            status: "sent",
            channel: "email",
            to: user.email,
            message
        };
    }
}

module.exports = EmailNotificationStrategy;