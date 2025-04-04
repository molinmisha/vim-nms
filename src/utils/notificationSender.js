const axios = require("axios");
const { logger } = require("../logger");

/**
 * Отправляет уведомление с повторными попытками.
 * @param {string} url - URL для отправки.
 * @param {object} data - Данные запроса.
 * @param {object} retryConfig - Конфигурация повторных попыток.
 * @returns {Promise<object>} - Ответ от сервера.
 * @throws {Error} - Ошибка с указанием количества попыток.
 */
async function sendNotification(url, data, retryConfig) {
    let retries = 0;
    while (retries < retryConfig.maxRetries) {
        try {
            const response = await axios.post(url, data);
            if (response.status === 200) {
                return response.data;
            }
            throw new Error(`Request failed with status code ${response.status}`);
        } catch (err) {
            retries++;
            const isRetryable = err.response && (err.response.status === 429 || err.response.status === 500);
            if (!isRetryable) throw err;
            logger.info(`Attempt ${retries} of ${retryConfig.maxRetries} failed for ${url}: ${err.message}, waiting ${retryConfig.retryInterval}ms`);
            if (retries === retryConfig.maxRetries) {
                throw new Error(`${err.message} (after ${retryConfig.maxRetries} retries)`);
            }
            await new Promise((resolve) => setTimeout(resolve, retryConfig.retryInterval));
        }
    }
}

module.exports = { sendNotification };