// src/userRepository/inMemoryUserRepository.js

const UserRepository = require("./userRepository");

class InMemoryUserRepository extends UserRepository {
  constructor() {
    super();
    this.users = new Map([
      [1, {
        userId: 1,
        email: "ironman@avengers.com",
        telephone: "+123456789",
        preferences: { email: true, sms: true },
      }],
      [2, {
        userId: 2,
        email: "loki@avengers.com",
        telephone: "+123456788",
        preferences: { email: true, sms: false },
      }],
      [3, {
        userId: 3,
        email: "hulk@avengers.com",
        telephone: "+123456787",
        preferences: { email: false, sms: false },
      }],
      [4, {
        userId: 4,
        email: "blackwidow@avengers.com",
        telephone: "+123456786",
        preferences: { email: true, sms: true },
      }],
    ]);
  }

  getUser(userId) {
    return this.users.get(userId);
  }

  updateUser(userId, preferences) {
    if (this.users.has(userId)) {
      const user = this.users.get(userId);
      user.preferences = preferences;
      return true;
    }
    return false;
  }

  createUser(email, telephone, preferences) {
    const userId = this.users.size + 1;
    this.users.set(userId, { userId, email, telephone, preferences });
    return userId;
  }
}

module.exports = InMemoryUserRepository;