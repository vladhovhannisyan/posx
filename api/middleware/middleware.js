const logger = require('winston-logstash-transporter')(__filename);

module.exports = async(req, res, next) => {
  try {
    if(req.headers['x-posx-user-id'] && req.headers['x-posx-organisation-id']) {
        return next();
    } else {
        var error = new Error('Cannot ' + req.method + ' ' + req.url);
        error.status = 404;
        error.method = req.method;
        error.url = req.url;
        next(error);
    }
    next();
  }
  catch (e) {
    logger.error({message: 'Error in authentication', e});
    next(e);
  }
};