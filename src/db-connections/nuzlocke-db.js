var mongoose = require('mongoose');
var log = require('../utils').log;

let connection_str_nuz = process.env.NODE_ENV === 'test' ? process.env.DATA_NUZLOCKE_PLANNER_TEST : process.env.DATA_NUZLOCKE_PLANNER;

mongoose.connect(connection_str_nuz, { useNewUrlParser: true });

mongoose.connection.on('connected', function () {
  log("Connected to database: Nuzlocke Planer Data");
});