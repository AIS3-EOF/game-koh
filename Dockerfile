FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY parser ./parser

COPY server ./server
RUN npm run server:build

COPY client ./client
RUN npm run client:build

FROM node:18-alpine AS runner

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/parser ./parser
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

CMD node server/dist/index.js
