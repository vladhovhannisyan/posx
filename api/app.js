const PORT = process.env.PORT;
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const url = process.env.DB_URL;
const apiRouter = require('./routes/routes');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const logger = require('winston-logstash-transporter')(__filename);
const {handleError} = require('./utils/errorHandler');
const scripts = require('./scripts/createQueue');
const middleware = require('./middleware/middleware');
const createSourceSystems = require('./boot/create-source-systems');
const Sentry = require('@sentry/node');
Sentry.init({ dsn:  process.env.SENTRY_URL});

try {
  // app.use(middleware);
  mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}); //Make this configurable
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use('/api', apiRouter);
  scripts.createQueues();
  app.use((err, req, res, next) => {
    logger.error({message: 'Error occurred in serving API req', err});
    handleError(err, res);
  });
  app.listen(PORT || 80, () => {
    logger.info(`hikeup Service API listening on port ${PORT}!`);
    createSourceSystems();
  });
}
catch (e) {
  logger.error({
    message: 'Error initializing app',
    e
  });
  Sentry.captureException(e);
}