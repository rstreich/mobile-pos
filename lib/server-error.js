/**
 *
 * @param status
 * @param message
 * @param error
 * @constructor
 */
function ServerError(status, message, error) {
    var myMessage = message;
    var myStatus = status;
    var myError = error;
    if (arguments.length != 3) {
        for (var i = 0; i < arguments.length; ++i) {
            if (typeof arguments[i] === 'number') {
                myStatus = arguments[i];
            } else if (typeof arguments[i] === 'string') {
                myMessage = arguments[i];
            } else if (typeof arguments[i] === 'object') {
                myError = arguments[i];
            }
        }
        if (!myMessage && myError) {
            myMessage = myError.message;
        }
    }

    Error.call(this, myMessage);
    Error.captureStackTrace(this, this.constructor);
    this.message = myMessage;
    this.status = myStatus;
    this.inner = myError;
}

ServerError.prototype.name = 'ServerError';
ServerError.prototype = Object.create(Error.prototype);
ServerError.prototype.constructor = ServerError;

module.exports = ServerError;
