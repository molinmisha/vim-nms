const { sendNotification } = require("../utils/notificationSender");

class SmsNotificationStrategy {
    constructor(config) {
        this.config = config;
    }

    async send(user, message) {
        const url = `${this.config.host}${this.config.endpoints.sms}`;
        return await sendNotification(url, { telephone: user.telephone, message }, this.config.retry);
    }
}

module.exports = SmsNotificationStrategy;