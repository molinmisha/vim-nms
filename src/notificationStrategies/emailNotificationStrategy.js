const axios = require("axios");
const { NotificationStrategy } = require("./notificationStrategy");

class EmailNotificationStrategy extends NotificationStrategy {
    constructor(config) {
        super();
        this.config = config;
    }

    async send(user, message) {
        const url = `${this.config.host}${this.config.endpoints.email}`;
        const response = await axios.post(url, {
            email: user.email,
            message,
        });
        return response.data;
    }
}

module.exports = EmailNotificationStrategy;