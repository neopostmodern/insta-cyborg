FROM node:18-alpine

RUN apk add --no-cache py3-pip make g++
RUN mkdir app
WORKDIR /app
ADD https://github.com/neopostmodern/insta-cyborg/archive/master.tar.gz ./git.tar.gz
RUN tar --strip-components=1 -zxf git.tar.gz
RUN rm ./git.tar.gz
RUN npm ci
COPY ../config/lib/index.ts ./config/lib
RUN npx lerna bootstrap

CMD [ "exit", "0" ]