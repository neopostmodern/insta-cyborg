FROM node:18-alpine

RUN mkdir app
WORKDIR /app
COPY --from=insta-cyborg-base /app/config ./config
COPY --from=insta-cyborg-base /app/util ./util
COPY --from=insta-cyborg-base /app/bot ./bot
COPY --from=insta-cyborg-base /app/package.json ./

CMD [ "npm", "run", "bot:run" ]