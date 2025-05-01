FROM node:20 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Zainstaluj serwer statyczny
RUN npm install -g serve

# Skopiuj zbudowaną aplikację z etapu build
COPY --from=build /app/dist ./dist

# Cloud Run oczekuje aplikacji nasłuchującej na porcie 8080
EXPOSE 8080

# Uruchom serwer
CMD ["serve", "-s", "dist", "-l", "8080"]
