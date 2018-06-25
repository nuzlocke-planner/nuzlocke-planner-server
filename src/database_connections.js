var users = require("./users-management/users-management-redis"),
    mongoClient = require('mongodb').MongoClient;

function usersManagementConnection ( ) {
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
    
    return users;
}

function nuzlockePlannerDataConnection (onSuccess, onError) {
    var url = process.env.DATA_NUZLOCKE_PLANNER;

    console.log(url);

    mongoClient.connect(url, function(err, db) {
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