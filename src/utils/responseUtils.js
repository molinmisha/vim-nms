/**
 * Формирует объект ошибки для ответа.
 * @param {string} channel - Канал уведомления (email, sms и т.д.).
 * @param {Error} err - Ошибка.
 * @returns {object} - Объект с деталями ошибки.
 */
function createErrorResponse(channel, err) {
    return {
        error: `${channel} error: ${err.message}`,
        response: err.response ? {
            status: err.response.status,
            data: err.response.data,
        } : undefined,
    };
}

/**
 * Определяет статус ответа и сообщение на основе результатов отправки.
 * @param {number} successfulChannels - Количество успешных каналов.
 * @param {number} totalChannels - Общее количество каналов.
 * @returns {object} - Объект с кодом статуса и сообщением.
 */
function determineResponseStatus(successfulChannels, totalChannels) {
    if (totalChannels === 0) {
        return { status: 200, message: "No notifications to send" };
    }
    if (successfulChannels === totalChannels) {
        return { status: 200, message: "Notifications sent" };
    }
    if (successfulChannels > 0) {
        return { status: 207, message: "Notifications sent partially" };
    }
    return { status: 500, message: "Failed to send notifications" };
}

module.exports = { createErrorResponse, determineResponseStatus };