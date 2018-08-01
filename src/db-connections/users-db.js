var usersManagement = require("../users-management/users-management-redis");
var log = require("../utils").log;

function usersManagementConnection(connection_string, onSuccess, onError) {
  // Get credentials from connection string
  var conString = connection_string.replace('redis://', '');

  var credentials = {
    username: conString.split(':')[0],
    password: conString.split(':')[1].split('@')[0],
    host: conString.split(':')[1].split('@')[1],
    port: conString.split(':')[2]
  };

  // Create redis client
  usersManagement.initRedisClient(credentials, onSuccess, onError);

  return usersManagement;
}

let connection_str_users = process.env.NODE_ENV === 'test' 
                            ? process.env.USER_MANAGEMENT_NUZLOCKE_PLANNER_TEST 
                            : process.env.USER_MANAGEMENT_NUZLOCKE_PLANNER;

let users = usersManagementConnection(connection_str_users,
  () => log("Users manager REDIS DB is up."),
  (err) => {
    throw err;
  }
);

module.exports = users; 