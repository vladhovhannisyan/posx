const logger = require('winston-logstash-transporter')(__filename);
const {ErrorHandler} = require('./errorHandler');
module.exports = (schema, payload) => {
  try {
    const {error, value} = schema.validate(payload);
    logger.debug({
      message: 'Joi validated',
      error,
      value
    });
    if (error) {
      throw error.message;
    }
    return {error, value}
  }
  catch (e) {
    logger.error({message: 'Error in JOI validation', e});
    throw new ErrorHandler(e, 400);
  }
};