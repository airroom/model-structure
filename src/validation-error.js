var ValidationError;
module.exports = (function() {
  function ValidationError(msg, field, constr) {
    Error.captureStackTrace(this, constr || this);
    this.message = msg || this.name;
    this.field = field;
  }
  ValidationError.prototype = Object.create(Error.prototype);
  ValidationError.prototype.name = 'ValidationError';
  return ValidationError;
})();


