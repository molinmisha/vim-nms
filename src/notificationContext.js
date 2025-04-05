// Defines the NotificationContext class to implement the Strategy pattern for sending notifications.
class NotificationContext {
  // Constructor initializes the context with an optional strategy.
  // @param {object} strategy - The notification strategy to use (optional).
  constructor(strategy) {
      this.strategy = strategy; // Strategy can be null initially and set later.
  }

  // Sets the strategy to be used for sending notifications.
  // @param {object} strategy - The notification strategy instance (e.g., EmailNotificationStrategy).
  setStrategy(strategy) {
      this.strategy = strategy;
  }

  // Sends a notification using the current strategy.
  // @param {object} user - The user object containing details like email or telephone.
  // @param {string} message - The message to send.
  // @returns {Promise<object>} - The result of the notification attempt.
  async sendNotification(user, message) {
      return this.strategy.send(user, message); // Delegates to the strategy's send method.
  }
}

module.exports = NotificationContext; // Exports the class for use in other modules.