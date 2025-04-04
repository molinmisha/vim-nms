class NotificationStrategy {
    send(user, message) {
      throw new Error("Method 'send' must be implemented.");
    }
  }
  
  module.exports = {
    NotificationStrategy,
  };