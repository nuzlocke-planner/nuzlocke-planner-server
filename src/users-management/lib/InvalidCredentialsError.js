var UserManagementError = require('./UserManagementError');

var InvalidCredentialsError = function (message, date) {
    UserManagementError.call(this, message);
    this.name = 'InvalidCredentialsError';
    this.date = date;
  };
  
  InvalidCredentialsError.prototype = Object.create(UserManagementError.prototype);
  
  InvalidCredentialsError.prototype.constructor = InvalidCredentialsError;
  
  module.exports = InvalidCredentialsError;