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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Set the routers
usersRouter.usersRouter(app, users);
nuzlockeRouter.nuzlocke_router(app);

//Express application will listen to port mentioned in our configuration
app.listen(process.env.PORT || 3000, () => {
  log("Server started...");
});

module.exports = app; // for testing