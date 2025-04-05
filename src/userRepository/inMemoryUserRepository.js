// Import the base UserRepository class.
const UserRepository = require("./userRepository");

// In-memory implementation of the UserRepository.
class InMemoryUserRepository extends UserRepository {
    // Constructor initializes the repository with sample users stored in a Map.
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
        this.nextId = 5; // Tracks the next available ID for new users.
    }

    // Retrieves a user by their ID.
    // @param {number} userId - The ID of the user.
    // @returns {object|null} - The user object or null if not found.
    getUser(userId) {
        return this.users.get(userId) || null;
    }

    // Creates a new user with the given details.
    // @param {string} email - The user's email.
    // @param {string} telephone - The user's telephone number.
    // @param {object} preferences - The user's notification preferences.
    // @returns {number} - The new user's ID.
    createUser(email, telephone, preferences) {
        const userId = this.nextId++; // Assign and increment the next ID.
        const user = { userId, email, telephone, preferences }; // Create the user object.
        this.users.set(userId, user); // Store in the Map.
        return userId; // Return the assigned ID.
    }

    // Updates a user's notification preferences.
    // @param {number} userId - The ID of the user.
    // @param {object} preferences - The new preferences to set.
    // @returns {boolean} - True if updated, false if user not found.
    updateUser(userId, preferences) {
        const user = this.users.get(userId); // Retrieve the user.
        if (!user) return false; // Return false if user not found.
        user.preferences = { ...user.preferences, ...preferences }; // Merge new preferences.
        this.users.set(userId, user); // Update the Map entry.
        return true; // Indicate success.
    }
}

// Export the in-memory repository class.
module.exports = InMemoryUserRepository;