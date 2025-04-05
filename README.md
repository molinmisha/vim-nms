# User Notifications Manager

## Overview

The **User Notifications Manager** is a backend HTTP service designed to manage user notification preferences and send notifications via multiple channels (e.g., email, SMS). Built with Node.js and Express, it uses an in-memory storage solution for simplicity and supports extensibility for adding new notification channels in the future. This service meets the following requirements:

- Store hundreds of thousands of users in memory (no external storage).
- Send notifications to all enabled channels based on user preferences.
- Provide flexibility for adding additional notification channels.

## Features

- **RESTful API**: Endpoints to send notifications, create users, and update preferences.
- **In-Memory Storage**: Uses a `Map` to store user data efficiently, suitable for hundreds of thousands of users.
- **Notification Channels**: Supports email and SMS out of the box, with a modular design for adding more channels.
- **Retry Mechanism**: Handles transient failures (e.g., rate limits) with configurable retries.
- **Authentication**: Requires a Bearer token for all requests.

## Prerequisites

- **Node.js**: Version 18.x or higher (tested with `node:18-alpine` in Docker).
- **Docker**: Required to run the service and the external "Notification Service" in containers.
- **npm**: For installing dependencies locally (if not using Docker).

## Setup

### Option 1: Using Docker
1. **Clone the Repository**:
   git clone <your-repo-url>
   cd user-notifications-manager

2. **Build and Run with Docker Compose**:
   docker-compose up --build
   - This command builds the `user-notifications-manager` service and runs it alongside the external `notification-service` (image: `aryekog/backend-interview-notifications-service:0.0.2`).
   - The service will be available at `http://localhost:8080`.
   - The notification service runs at `http://localhost:5001`.

3. **Verify the Service**:
   - Check the logs to ensure the server starts:
     {"level":"info","message":"Server listening at http://localhost:8080","timestamp":"..."}

### Option 2: Running Locally
1. **Clone the Repository**:
   git clone <your-repo-url>
   cd user-notifications-manager

2. **Install Dependencies**:
   npm install

3. **Set Environment Variables** (optional):
   - Copy the example environment file and edit if needed:
     cp .env.example .env
   - Default values in `.env.example`:
     PORT=8080
     NOTIFICATION_SERVICE_HOST=http://localhost:5001
     MAX_RETRIES=5
     RETRY_INTERVAL=2000
     AUTH_TOKEN=Bearer onlyvim2024

4. **Start the Service**:
   npm start
   - The service will run at `http://localhost:8080`.
   - Note: You must separately run the `notification-service` (e.g., via Docker) for notifications to work.

## Usage

### API Endpoints

#### 1. Send Notifications
- **Endpoint**: `POST /notifications`
- **Headers**: `Authorization: Bearer onlyvim2024`
- **Body**:
  {"userId": 4,"message": "Test notification"}
- **Response** (Success, 200):
  {"message": "Notifications sent","details": [{"status": "sent","channel": "email","to": "blackwidow@avengers.com","message": "Test notification"},{"status": "sent","channel": "sms","to": "+123456786","message": "Test notification"}]}
- **Errors**:
  - `401 Unauthorized`: Invalid or missing `Authorization` header.
  - `400 Bad Request`: Invalid `userId` or `message`.
  - `404 Not Found`: User with `userId` does not exist.

#### 2. Create a New User
- **Endpoint**: `POST /users`
- **Headers**: `Authorization: Bearer onlyvim2024`
- **Body**:
  {"email": "newuser@avengers.com","telephone": "+123456799","preferences": {"email": true,"sms": false}}
- **Response** (Success, 200):
  {"message": "User created","userId": 5}
- **Errors**:
  - `400 Bad Request`: Invalid `email`, `telephone`, or `preferences`.

#### 3. Update User Preferences
- **Endpoint**: `POST /users/preferences`
- **Headers**: `Authorization: Bearer onlyvim2024`
- **Body**:
  {"userId": 4,"preferences": {"email": true,"sms": false}}
- **Response** (Success, 200):
  {"message": "Preferences updated","userId": 4}
- **Errors**:
  - `400 Bad Request`: Invalid `userId` or `preferences`.
  - `404 Not Found`: User with `userId` does not exist.

### Example with curl
curl -X POST http://localhost:8080/notifications -H "Authorization: Bearer onlyvim2024" -H "Content-Type: application/json" -d '{"userId": 4, "message": "Test notification"}'

## Architecture

### Key Components
- **Express Server** (`src/app.js`): Handles HTTP requests and routes them to appropriate handlers.
- **Notification Service** (`src/services/notificationService.js`): Manages the logic for sending notifications to multiple channels.
- **Notification Context** (`src/notificationContext.js`): Implements the Strategy pattern for dynamic channel selection.
- **Strategies** (`src/notificationStrategies/`): Modular classes (e.g., `EmailNotificationStrategy`, `SmsNotificationStrategy`) for sending notifications.
- **User Repository** (`src/userRepository/inMemoryUserRepository.js`): Stores user data in a `Map` for efficient in-memory access.
- **Utilities**:
  - `notificationSender.js`: Handles HTTP requests with retry logic.
  - `responseUtils.js`: Formats responses and determines status codes.
- **Logger** (`src/logger.js`): Uses Winston to log events in JSON format.

### Flow
1. **Request**: A POST request to `/notifications` is received with `userId` and `message`.
2. **Validation**: Middleware checks the `Authorization` header and input data.
3. **Service**: `sendNotifications` retrieves the user from `InMemoryUserRepository` and identifies active channels from `preferences`.
4. **Context**: `NotificationContext` dynamically selects a strategy (e.g., `EmailNotificationStrategy`) for each channel.
5. **Strategy**: The strategy sends the notification via `sendNotification` to the external service.
6. **Response**: Results are collected, logged, and returned as a JSON response.

## Extensibility

### Adding a New Notification Channel
To add a new channel (e.g., Telegram):
1. **Create a New Strategy**:
   - File: `src/notificationStrategies/telegramNotificationStrategy.js`
   const { sendNotification } = require("../utils/notificationSender");
   class TelegramNotificationStrategy {
       constructor(config) {
           this.config = config;
       }
       async send(user, message) {
           const url = `${this.config.host}/send-telegram`;
           const response = await sendNotification(url, { telegramId: user.telegramId, message }, this.config.retry);
           return { status: "sent", channel: "telegram", to: user.telegramId, message };
       }
   }
   module.exports = TelegramNotificationStrategy;

2. **Update Notification Service**:
   - Add the new strategy to `strategies` in `src/services/notificationService.js`:
     const strategies = {
         email: require("../notificationStrategies/emailNotificationStrategy"),
         sms: require("../notificationStrategies/smsNotificationStrategy"),
         telegram: require("../notificationStrategies/telegramNotificationStrategy"),
     };

3. **Update User Data**:
   - Ensure users include the new field (e.g., `telegramId`) and preference (e.g., `preferences.telegram`).

No changes to the core logic (`sendToChannel`) are needed due to the flexible design using `response.to`.

## Notes
- **Scalability**: The in-memory `Map` can handle hundreds of thousands of users (~20-30 MB for 100,000 users), but memory usage should be monitored for larger scales.
- **Security**: The `AUTH_TOKEN` is hardcoded as a default for simplicity; in production, use environment variables or a secrets manager.
- **Dependencies**: Managed via `package.json`; ensure `npm install` includes all required modules (`express`, `axios`, `winston`, etc.).


p.s.
User preferences updated by id and not by email (or phone)
No tests
Bearer header is visible.
