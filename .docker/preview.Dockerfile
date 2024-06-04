FROM node:22-alpine as build-stage

RUN mkdir app
WORKDIR /app
COPY --from=insta-cyborg-base /app/config ./config
COPY --from=insta-cyborg-base /app/util ./util
COPY --from=insta-cyborg-base /app/preview ./preview
COPY --from=insta-cyborg-base /app/node_modules ./node_modules
COPY --from=insta-cyborg-base /app/package.json /app/tsconfig.json ./
RUN npm run preview:build

FROM httpd:2.4-alpine
COPY --from=build-stage /app/preview/build /usr/local/apache2/htdocs/
CMD ["httpd-foreground"]