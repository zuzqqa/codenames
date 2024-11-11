db = db.getSiblingDB('CodenamesDB');
db.createUser({
    user: "admin",
    pwd: "admin",
    roles: [{ role: "readWrite", db: "CodenamesDB" }]
});
