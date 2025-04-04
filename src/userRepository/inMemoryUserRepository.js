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
        this.nextId = 5; // Следующий ID для новых пользователей
    }

    /**
     * Получает пользователя по ID.
     * @param {number} userId - ID пользователя.
     * @returns {object|null} - Объект пользователя или null, если не найден.
     */
    getUser(userId) {
        return this.users.get(userId) || null;
    }

    /**
     * Создаёт нового пользователя.
     * @param {string} email - Email пользователя.
     * @param {string} telephone - Телефон пользователя.
     * @param {object} preferences - Предпочтения уведомлений.
     * @returns {number} - ID нового пользователя.
     */
    createUser(email, telephone, preferences) {
        const userId = this.nextId++;
        const user = { userId, email, telephone, preferences };
        this.users.set(userId, user);
        return userId;
    }

    /**
     * Обновляет предпочтения пользователя.
     * @param {number} userId - ID пользователя.
     * @param {object} preferences - Новые предпочтения.
     * @returns {boolean} - Успешность операции.
     */
    updateUser(userId, preferences) {
        const user = this.users.get(userId);
        if (!user) return false;
        user.preferences = { ...user.preferences, ...preferences };
        this.users.set(userId, user);
        return true;
    }
}

module.exports = InMemoryUserRepository;