FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV MAX_RETRIES=3
ENV RETRY_INTERVAL=1000

EXPOSE 3000

CMD [ "npm", "start" ]