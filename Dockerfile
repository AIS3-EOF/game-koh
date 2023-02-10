FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY parser ./parser

COPY server ./server
RUN npm run server:build

COPY client ./client
RUN npm run client:build

RUN openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -x509 -nodes -days 365 -out server.cert -keyout server.key -subj '/CN=game-koh'

FROM node:18-alpine AS runner

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/parser ./parser
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

RUN tar -czvf /tmp/app.tar.gz --exclude=node_modules /app

COPY --from=builder /app/server.* ./
COPY ./newrelic.js ./

CMD node -r newrelic server/dist/index.js
