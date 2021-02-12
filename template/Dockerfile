# イメージの指定
FROM node:lts-alpine3.9

# コンテナ内で cd /app しているようなもの
WORKDIR /app

# コマンド実行
# linux 最新化,gitのインストール、npm最新化
RUN npm install -g npm

COPY package*.json ./

RUN npm install --quiet

COPY . .

RUN npm run build

ENV HOST 0.0.0.0
EXPOSE 3000

# CMD ["npm", "run", "start"]