// src/userRepository/databaseUserRepository.js

const UserRepository = require("./userRepository");

class DatabaseUserRepository extends UserRepository {
  getUser(userId) {
    // Реализация для базы данных
    return null;
  }

  updateUser(userId, preferences) {
    // Реализация для базы данных
    return false;
  }

  createUser(email, telephone, preferences) {
    // Реализация для базы данных
    return null;
  }
}

module.exports = DatabaseUserRepository;