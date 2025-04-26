// Switch to the CodenamesDB database
db = db.getSiblingDB("CodenamesDB");

// Create a new MongoDB user with credentials from environment variables
db.createUser({
  user: process.env.MONGO_INITDB_ROOT_USERNAME, // Username for database authentication
  pwd: process.env.MONGO_INITDB_ROOT_PASSWORD, // Password for database authentication
  roles: [{ 
    role: "readWrite", // Assigns read and write permissions to the user
    db: "CodenamesDB" // Grants permissions specifically for the CodenamesDB database
}],
});
