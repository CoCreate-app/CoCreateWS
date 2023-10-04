FROM node:14-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

# COPY . /usr/src/app/
COPY package.json package-lock.json ./

RUN npm install --production

COPY ./src .

CMD [ "npm", "start" ]
