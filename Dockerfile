FROM node:16-alpine

WORKDIR /notify

COPY ./package.json ./yarn.lock /notify/
RUN yarn
COPY . /notify/

CMD yarn start
