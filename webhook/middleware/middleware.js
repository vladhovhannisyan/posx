const logger = require('winston-logstash-transporter')(__filename);
module.exports = function(req, res, next){
  try {
    if(req.headers['x-hikeup-token'] && req.headers['x-hikeup-token'] == process.env.hikeupToken) {
        next();
    } else {
        var error = new Error('Cannot ' + req.method + ' ' + req.url);
        error.status = 404;
        error.method = req.method;
        error.url = req.url;
        next(error);
    }
    //next();
  }
  catch (e) {
    logger.error({message: 'Error in authentication', e});
    next(e);
  }
};