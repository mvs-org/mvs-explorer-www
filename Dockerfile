FROM node:8.15.0-alpine as builder
WORKDIR /app
RUN npm i -g grunt-cli
COPY . .
RUN rm -rf dist min-safe min && npm i && grunt

FROM node:8.15.0-alpine
WORKDIR /app
COPY --from=builder /app/dist dist
COPY package.json .
COPY server.js .
RUN npm i --prod
EXPOSE 80
CMD [ "npm", "start"  ]
