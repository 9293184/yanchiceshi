FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

RUN chmod +x start.sh

EXPOSE 3001

CMD ["./start.sh"]
