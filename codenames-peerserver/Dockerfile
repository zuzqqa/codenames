FROM node:20

WORKDIR /app

COPY server.js .

RUN npm install peer

EXPOSE 8080

CMD ["node", "server.js"]