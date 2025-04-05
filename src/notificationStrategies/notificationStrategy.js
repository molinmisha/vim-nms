// Defines the base NotificationStrategy class as an abstract interface.
// This class is meant to be extended by specific notification strategies (e.g., Email, SMS).
class NotificationStrategy {
  // Abstract method for sending notifications.
  // Must be implemented by subclasses.
  // @param {object} user - The user object containing notification details (e.g., email, telephone).
  // @param {string} message - The message to be sent.
  // @throws {Error} - Throws an error if not overridden by a subclass.
  send(user, message) {
      throw new Error("Method 'send' must be implemented.");
  }
}

// Exports the NotificationStrategy class for use in other modules.
module.exports = {
  NotificationStrategy,
};