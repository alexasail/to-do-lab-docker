FROM node:18-alpine3.21 AS build

WORKDIR /app/backend

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

FROM node:18-alpine3.21

WORKDIR /app/backend

ARG DATABASE_URL
ARG SERVER_PORT=3000

ENV DATABASE_URL=${DATABASE_URL}
ENV SERVER_PORT=${SERVER_PORT}

EXPOSE ${SERVER_PORT}

RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

COPY --from=build --chown=nodeuser:nodegroup /app/backend .

USER nodeuser

CMD ["node", "index.js"]
