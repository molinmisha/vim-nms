const { sendNotification } = require("../utils/notificationSender");

class EmailNotificationStrategy {
    constructor(config) {
        this.config = config;
    }

    async send(user, message) {
        const url = `${this.config.host}${this.config.endpoints.email}`;
        return await sendNotification(url, { email: user.email, message }, this.config.retry);
    }
}

module.exports = EmailNotificationStrategy;