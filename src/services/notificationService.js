const NotificationContext = require("../notificationContext");
const { createErrorResponse, determineResponseStatus } = require("../utils/responseUtils");
const { logger } = require("../logger");
const config = require("../config");

const strategies = {
    email: require("../notificationStrategies/emailNotificationStrategy"),
    sms: require("../notificationStrategies/smsNotificationStrategy"),
};

/**
 * Отправляет уведомление по указанному каналу.
 * @param {string} channel - Канал уведомления (email, sms и т.д.).
 * @param {object} user - Объект пользователя с данными (email, telephone, preferences).
 * @param {string} message - Текст сообщения.
 * @param {NotificationContext} context - Контекст для стратегии отправки.
 * @returns {Promise<object|null>} - Результат отправки или null, если канал не поддерживается.
 */
async function sendToChannel(channel, user, message, context) {
    const Strategy = strategies[channel];
    if (!Strategy) {
        logger.warn(`Skipping unsupported notification channel: ${channel}`);
        return null;
    }
    context.setStrategy(new Strategy(config.notificationService));
    const response = await context.sendNotification(user, message);
    logger.info(`${channel} sent to ${response.to || "unknown-receiver"}`);
    return response;
}

/**
 * Фильтрует активные и поддерживаемые каналы из предпочтений пользователя.
 * @param {object} preferences - Объект предпочтений пользователя.
 * @returns {string[]} - Массив поддерживаемых каналов.
 */
function getSupportedChannels(preferences) {
    const channels = [];
    for (const channel in preferences) {
        if (preferences[channel]) {
            if (strategies[channel]) {
                channels.push(channel);
            } else {
                logger.warn(`Channel ${channel} is enabled but not supported`);
            }
        }
    }
    return channels;
}

/**
 * Обрабатывает отправку уведомления по одному каналу.
 * @param {string} channel - Канал уведомления.
 * @param {object} user - Объект пользователя.
 * @param {string} message - Текст сообщения.
 * @param {NotificationContext} context - Контекст для стратегии.
 * @returns {Promise<object>} - Результат отправки или объект ошибки.
 */
async function processChannel(channel, user, message, context) {
    try {
        const response = await sendToChannel(channel, user, message, context);
        if (response) {
            return response;
        }
        return createErrorResponse(channel, new Error("No response from channel"));
    } catch (err) {
        logger.error(`${channel} error: ${err.message}`);
        return createErrorResponse(channel, err);
    }
}

/**
 * Отправляет уведомления пользователю по всем активным каналам.
 * @param {object} userRepository - Репозиторий пользователей.
 * @param {number} userId - ID пользователя.
 * @param {string} message - Текст сообщения.
 * @returns {Promise<object>} - Объект с результатами отправки и статистикой.
 * @throws {Error} - Если пользователь не найден.
 */
async function sendNotifications(userRepository, userId, message) {
    const user = userRepository.getUser(userId);
    if (!user) throw new Error("User not found");

    const supportedChannels = getSupportedChannels(user.preferences);
    const totalChannels = supportedChannels.length;
    const context = new NotificationContext();
    const responses = [];

    for (const channel of supportedChannels) {
        const result = await processChannel(channel, user, message, context);
        responses.push(result);
    }

    const successfulChannels = responses.filter(r => !r.error).length;
    return { responses, successfulChannels, totalChannels };
}

module.exports = { sendNotifications };