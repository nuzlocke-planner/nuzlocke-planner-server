var NuzlockePlannerError = function (message, error) {
    Error.call(this, message);
    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = 'NuzlockePlannerError';
    this.message = message;
    if (error) this.inner = error;
};
  
NuzlockePlannerError.prototype = Object.create(Error.prototype);
NuzlockePlannerError.prototype.constructor = NuzlockePlannerError;

module.exports = NuzlockePlannerError;