## LOCAL HOST DOCKER FILE

# Use Node.js 20 as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm install

# Copy the entire application source code
COPY . .

# Expose port 5173 for the development server
EXPOSE 5173

# Start the application in development mode with host binding
CMD ["npm", "run", "dev", "--", "--host"]

## DOCKER FILE FOR PRODUCTION

# FROM node:20 as build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# FROM node:20-alpine
# WORKDIR /app

# RUN npm install -g serve

# COPY --from=build /app/dist ./dist

# EXPOSE 8080

# CMD ["serve", "-s", "dist", "-l", "8080"]