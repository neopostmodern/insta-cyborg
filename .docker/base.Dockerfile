FROM node:18-alpine

RUN apk add --no-cache py3-pip make g++
WORKDIR /app
COPY . /app
COPY ../config/lib/index.ts ./config/lib
RUN npm ci --install-strategy=nested

CMD [ "exit", "0" ]