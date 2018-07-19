var users = require("./users-management/users-management-redis"),
  mongoClient = require('mongodb').MongoClient;

function usersManagementConnection(onSuccess, onError) {
  // Get credentials from connection string
  var conString = process.env.USER_MANAGEMENT_NUZLOCKE_PLANNER.replace('redis://', '');

  var credentials = {
    username: conString.split(':')[0],
    password: conString.split(':')[1].split('@')[0],
    host: conString.split(':')[1].split('@')[1],
    port: conString.split(':')[2]
  };

  // Create redis client
  users.initRedisClient(credentials, onSuccess, onError);

  return users;
}

function nuzlockePlannerDataConnection(onSuccess, onError) {
  var url = process.env.DATA_NUZLOCKE_PLANNER;

  mongoClient.connect(url, function (err, db) {
    if (err) {
      onError(err);
    } else {
      onSuccess(db);
      db.close();
    }
  });
}

exports.usersManagementConnection = usersManagementConnection;
exports.nuzlockePlannerDataConnection = nuzlockePlannerDataConnection;