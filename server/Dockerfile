FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 3001

ENTRYPOINT ["/bin/sh", "-c", "echo 'Running migrations...' && npx prisma migrate deploy && echo 'Starting server...' && exec npx tsx src/index.ts"]
