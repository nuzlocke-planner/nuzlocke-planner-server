var UserManagementError = require('./UserManagementError');

var RedisError = function (message, date) {
    UserManagementError.call(this, message);
    this.name = 'RedisError';
    this.date = date;
  };
  
  RedisError.prototype = Object.create(UserManagementError.prototype);
  
  RedisError.prototype.constructor = RedisError;
  
  module.exports = RedisError;