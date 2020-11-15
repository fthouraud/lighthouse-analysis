FROM node:14-alpine

RUN apk update && \
    apk upgrade && \
    apk add --no-cache chromium nss && \
    mkdir /app /output && \
    adduser -H -D lh -u 1001 && \
    chown lh:lh -R /app /output

USER lh
WORKDIR /app
VOLUME /output

COPY . /app

RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

CMD ["node", "/app/index.js"]
