# Użyj obrazu z Node.js
FROM node:16

# Ustaw katalog roboczy
WORKDIR /usr/src/app

# Skopiuj package.json i package-lock.json (jeśli używasz)
COPY package*.json ./

# Zainstaluj zależności
RUN npm install

# Skopiuj resztę plików aplikacji
COPY . .

# Otwórz port 8080
EXPOSE 8080

# Uruchom aplikację
CMD ["node", "server.js"]
