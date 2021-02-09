/**
 * @typedef Error
 * @property {string} status.required - Status of request - eg: error
 * @property {number} status.required - StatusCode of request - eg: 400, 403
 * @property {string} message.required - Reason for order creation failure
 */
class ErrorHandler extends Error {
    constructor(message, status) {
      super();
      this.status = status || 500;
      this.message = message;
    }
  }
  
  /**
   * Send errors to the client with following format
   * @function
   * @param {Error} err
   * @param {object} res
   */
  function handleError(err, res) {
    const {message} = err;
    res.status(err.status).send({
      status: err.status,
      error: message
    });
  }
  
  /**
   * Check if HTTP response is success
   * @function
   * @param {object} res
   * @return {boolean}
   */
  function isOk(res) {
    return res.status>=200 && res.status<300;
  }
  
  module.exports = {
    handleError,
    ErrorHandler,
    isOk
  };