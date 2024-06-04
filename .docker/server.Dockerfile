FROM node:22-alpine

RUN apk add chromium
RUN mkdir app
WORKDIR /app
COPY --from=insta-cyborg-base /app/config ./config
COPY --from=insta-cyborg-base /app/util ./util
COPY --from=insta-cyborg-base /app/server ./server
COPY --from=insta-cyborg-base /app/node_modules ./node_modules
COPY --from=insta-cyborg-base /app/package.json /app/tsconfig.json ./

CMD [ "npm", "run", "server:start" ]