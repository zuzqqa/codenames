FROM node:20

# Expose port 3001 for peerjs server
EXPOSE 3001

# Install peerjs globally
RUN npm install -g peer

# Start the peerjs server
CMD ["peerjs", "--port", "3001"]