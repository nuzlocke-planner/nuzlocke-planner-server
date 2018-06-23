// Entry point for the application which is using the user management system
var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    users = require("./users-management/users-management-redis"),
    users_router = require("./routers/users-router.js");

    
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Get credentials from connection string
var conString = process.env.USER_MANAGEMENT_NUZLOCKE_PLANNER.replace('redis://', '');

var credentials = {
    username: conString.split(':')[0],
    password: conString.split(':')[1].split('@')[0],
    host: conString.split(':')[1].split('@')[1],
    port: conString.split(':')[2]
};

// Create redis client
users.initRedisClient(credentials, 
    () => console.log("Redis database is up."), 
    (err) => console.log(err));

// Set the routers
app.use(users_router.usersRouter(users));

// Listening...
app.listen(3000, function () {
    console.log("Node server running on http://localhost:3000");
});