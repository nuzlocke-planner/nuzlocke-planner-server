var UserManagementError = function (message, error) {
    Error.call(this, message);
    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = 'UserManagementError';
    this.message = message;
    if (error) this.inner = error;
  };
  
UserManagementError.prototype = Object.create(Error.prototype);
UserManagementError.prototype.constructor = UserManagementError;

module.exports = UserManagementError;