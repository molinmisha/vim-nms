const axios = require("axios");
const { NotificationStrategy } = require("./notificationStrategy");

class SmsNotificationStrategy extends NotificationStrategy {
  async send(user, message) {
    const response = await axios.post("http://localhost:5001/send-sms", {
      telephone: user.telephone,
      message,
    });
    return response.data;
  }
}

module.exports = SmsNotificationStrategy;