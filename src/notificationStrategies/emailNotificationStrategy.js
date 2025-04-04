const axios = require("axios");
const { NotificationStrategy } = require("./notificationStrategy");

class EmailNotificationStrategy extends NotificationStrategy {
  async send(user, message) {
    const response = await axios.post("http://localhost:5001/send-email", {
      email: user.email,
      message,
    });
    return response.data;
  }
}

module.exports = EmailNotificationStrategy;