# p201_activestreamhc_cloud

## Build Setup

```bash
# install dependencies
$ npm install

$ docker-compose up -d

# serve with hot reload at localhost:3000
$ DEV_DOCKER=docker npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate

$ docker-compose -f docker-compose.env.yml up -d

$ npm run dev:docker
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## バージョンについて
配布用イメージバージョンは[githubのパブリックリポジトリ](https://github.com/activestreamhc/activestreamhc-nn)で公開しています。

## 配布について
[dockerhub](https://hub.docker.com/repository/docker/activestreamhc/activestreamhc-nn)で各ブランチのイメージを管理しています。

dockerhubにアクセス用のユーザー名とパスワードは[こちら](https://gitlab.com/azest_tan/p201_activestreamhc_cloud_shell/-/blob/master/bin/docker_login.sh)を参照してください。




