// Entry point for the application which is using the user management system
var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    usersRouter = require("./routers/users_router"),
    nuzlockeRouter = require("./routers/nuzlocke_router"),
    databaseConnection = require("./database_connections"),
    nuzlockeDb = require("./nuzlocke_db"),
    log = require("./utils").log;

    
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var users = databaseConnection.usersManagementConnection( 
    () => log("Users manager REDIS DB is up."), 
    (err) => { throw err; }
);

databaseConnection.nuzlockePlannerDataConnection(
    (db) => log("Connected to database: Nuzlocke Planer Data" ), 
    (err) => { throw err; }
);

// Set the routers
usersRouter.usersRouter(app, users, nuzlockeDb);
nuzlockeRouter.nuzlocke_router(app, users, nuzlockeDb);

// Listening...
app.listen(process.env.PORT || 3000, function () {
    log("App listening...")
});