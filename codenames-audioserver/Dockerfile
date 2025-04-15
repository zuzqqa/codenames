# Use Node.js 20 as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json for dependency installation
COPY package.json ./

# Install project dependencies
RUN npm install

# Copy the entire application source code
COPY . .

# Expose port 3000 for the audio server
EXPOSE 3000

# Start the audio server
CMD ["npm", "run", "start"]

