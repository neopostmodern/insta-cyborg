FROM node:18-alpine

RUN apk add chromium
RUN mkdir app
WORKDIR /app
COPY --from=insta-cyborg-base /app/config ./config
COPY --from=insta-cyborg-base /app/util ./util
COPY --from=insta-cyborg-base /app/server ./server
COPY --from=insta-cyborg-base /app/package.json ./

CMD [ "npm", "run", "server:start" ]