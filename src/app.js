// Entry point for the application which is using the user management system
var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    usersRouter = require("./routers/users-router.js"),
    nuzlockeRouter = require("./routers/nuzlocke-router"),
    databaseConnection = require("./database_connections");

    
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var users = databaseConnection.usersManagementConnection( );
databaseConnection.nuzlockePlannerDataConnection(
    (db) => console.log("Connected to database: Nuzlocke Planer Data" ), 
    (err) => { throw err; }
);
// Set the routers
usersRouter.usersRouter(app, users);
nuzlockeRouter.nuzlocke_router(app, users);

// Listening...
app.listen(3000, function () {
    console.log("Node server running on http://localhost:3000");
});