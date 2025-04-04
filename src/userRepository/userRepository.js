// src/userRepository/userRepository.js

class UserRepository {
  getUser(userId) {
    throw new Error("Method 'getUser' must be implemented.");
  }

  updateUser(userId, preferences) {
    throw new Error("Method 'updateUser' must be implemented.");
  }

  createUser(email, telephone, preferences) {
    throw new Error("Method 'createUser' must be implemented.");
  }
}

module.exports = UserRepository;