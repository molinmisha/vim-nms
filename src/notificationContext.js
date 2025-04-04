// src/notificationContext.js

class NotificationContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async sendNotification(user, message) {
    return this.strategy.send(user, message);
  }
}

module.exports = NotificationContext;