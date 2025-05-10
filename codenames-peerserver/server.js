const { PeerServer } = require("peer");

const server = PeerServer({
  port: 8080,
  path: "/",
  config: {
    iceServers: [
      {
        urls: "turn:relay1.expressturn.com:3478", 
        username: "efWL5HTQ6ZG17APRCZ", 
        credential: "unrYr5wHzYu7qDNF", 
      },
    ],
  },
});

console.log("PeerJS server running on port 8080");
