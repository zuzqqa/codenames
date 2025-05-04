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