const { sendNotification } = require("../utils/notificationSender");

class SmsNotificationStrategy {
    constructor(config) {
        this.config = config;
    }

    /**
     * Отправляет уведомление по SMS.
     * @param {object} user - Объект пользователя с полем telephone.
     * @param {string} message - Текст сообщения.
     * @returns {Promise<object>} - Результат отправки с информацией о получателе.
     */
    async send(user, message) {
        const url = `${this.config.host}${this.config.endpoints.sms}`;
        const response = await sendNotification(url, { telephone: user.telephone, message }, this.config.retry);
        return {
            status: "sent",
            channel: "sms",
            to: user.telephone,
            message
        };
    }
}

module.exports = SmsNotificationStrategy;