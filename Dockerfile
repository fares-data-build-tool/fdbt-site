FROM node:12-alpine AS build

RUN apk add --no-cache git

WORKDIR /tmp

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .
RUN npm run build

FROM node:12-alpine

ENV NODE_ENV production

RUN apk update && apk upgrade && apk add --no-cache -t .clamv-run-deps openrc clamav clamav-daemon clamav-libunrar && \
    mkdir /run/clamav && chown -R clamav:clamav /run/clamav && freshclam && chown -R node:node /var/log/clamav /var/lib/clamav /run/clamav

USER node

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY --chown=node:node --from=build /tmp/.next ./.next
COPY --chown=node:node --from=build /tmp/dist ./dist

EXPOSE 8080

CMD ["sh", "-c", "sleep 20 && (freshclam && (clamd -F & freshclam -d)) & npm start"]
