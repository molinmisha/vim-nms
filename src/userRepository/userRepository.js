// Base abstract class defining the UserRepository interface.
class UserRepository {
  // Retrieves a user by their ID.
  // @param {number} userId - The ID of the user.
  // @returns {object|null} - The user object or null if not found.
  getUser(userId) {
      throw new Error("Method 'getUser' must be implemented."); // Must be overridden.
  }

  // Updates a user's notification preferences.
  // @param {number} userId - The ID of the user.
  // @param {object} preferences - The new preferences to set.
  // @returns {boolean} - True if updated, false if user not found.
  updateUser(userId, preferences) {
      throw new Error("Method 'updateUser' must be implemented."); // Must be overridden.
  }

  // Creates a new user with the given details.
  // @param {string} email - The user's email.
  // @param {string} telephone - The user's telephone number.
  // @param {object} preferences - The user's notification preferences.
  // @returns {number|null} - The new user's ID or null if creation fails.
  createUser(email, telephone, preferences) {
      throw new Error("Method 'createUser' must be implemented."); // Must be overridden.
  }
}

// Export the base class for inheritance.
module.exports = UserRepository;