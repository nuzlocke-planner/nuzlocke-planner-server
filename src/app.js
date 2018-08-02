var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var app = express();

var log = require("./utils").log;
var usersRouter = require("./routers/users_router");
var nuzlockeRouter = require("./routers/nuzlocke_router");

var users = require("./db-connections/users-db");
require("./db-connections/nuzlocke-db");


app.use(bodyParser.urlencoded({'extended': 'true' }));
app.use(bodyParser.json());
app.use(methodOverride());


// Set the routers
usersRouter.usersRouter(app, users);
nuzlockeRouter.nuzlocke_router(app);

//Express application will listen to port mentioned in our configuration
app.listen(process.env.PORT || 3000, () => {
  log("Server started...");
});

console.log(process.env.NODE_ENV);

module.exports = app; // for testing