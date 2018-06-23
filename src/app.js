// Entry point for the application which is using the user management system
var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    users = require("./users-management/users-management-redis"),
    router = require("./routers/users-router.js");

    
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Get credentials from connection string
var conString = process.env.USER_MANAGEMENT_REDIS.replace('redis://', '');
console.log(conString);

var credentials = {
    username: 'u',
    password: "p35de29af4f9db68b7fa48fa1af950478402382df19b847f7b616572a363c94e0",
    host: "ec2-34-247-101-73.eu-west-1.compute.amazonaws.com",
    port: '9939'
};

// Create redis client
users.initRedisClient(credentials, () => console.log("Redis database is up."), () => console.log("Error"));

// Override password validation
users.options.passwordValidation = (pass) => pass.length > 9 && pass.match(/[a-z]/i);
users.options.passwordValidationErrMessage = 'Password must be larger than 9 characters and include at least one letter';

// Set the routers
app.use(router.usersRouter(users));

// Listening...
app.listen(3000, function () {
    console.log("Node server running on http://localhost:3000");
});