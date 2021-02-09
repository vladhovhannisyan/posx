const express = require('express');
const webhookRouter = express.Router();
const webhookController = require('../controller/webhook.controller');
const logger = require('winston-logstash-transporter')(__filename);


webhookRouter.post('/get/auth-url', async(req, res, next) => {
  try {
    let url = await webhookController.getAuthUrl(req.body);
    res.status(200).send({success: true, url: url});
  }
  catch (e) {
    next(e);
  }
});

webhookRouter.get('/complete/authorization', async(req, res, next) => {
  try {
    await webhookController.fetchToken(req.query);
    res.status(200).send({success: true});
  }
  catch (e) {
    next(e);
  }
});

module.exports = webhookRouter;