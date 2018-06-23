var UserManagementError = require('./UserManagementError');

var NotExistError = function (message, date) {
    UserManagementError.call(this, message);
    this.name = 'NotExistError';
    this.date = date;
  };
  
  NotExistError.prototype = Object.create(UserManagementError.prototype);
  
  NotExistError.prototype.constructor = NotExistError;
  
  module.exports = NotExistError;