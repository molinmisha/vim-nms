const axios = require("axios");
const { NotificationStrategy } = require("./notificationStrategy");

class SmsNotificationStrategy extends NotificationStrategy {
    constructor(config) {
        super();
        this.config = config;
    }

    async send(user, message) {
        const url = `${this.config.host}${this.config.endpoints.sms}`;
        const response = await axios.post(url, {
            telephone: user.telephone,
            message,
        });
        return response.data;
    }
}

module.exports = SmsNotificationStrategy;