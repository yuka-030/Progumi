# frontend/Dockerfile

FROM node:20-alpine

WORKDIR /app

# 依存定義だけコピー（まだ無くてもOK）
COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]