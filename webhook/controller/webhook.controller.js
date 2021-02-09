const logger = require('winston-logstash-transporter')(__filename);
const {ErrorHandler} = require('./../utils/errorHandler');
const Integration = require('./../models/integration');
const sqsSDK = require('./../utils/sqs-sdk');
const hikeUpSDK = require('./../utils/hikeup-sdk');

async function getAuthUrl(body) {
  try {
      let authUrl = `${process.env.HIKE_BASE_URL}/oauth/authorize?response_type=code&client_id=${process.env.HIKE_CLIENT_ID}&redirect_uri=${process.env.HIKE_REDIRECT_URL}&state=${body.domainPrefix}&scope=all`;
      return authUrl;
  }
  catch (e) {
    logger.error('Error getting auth url', e);
    let error = e instanceof ErrorHandler ? e : new ErrorHandler('Error getting auth url');
    throw error;
  }
}

async function fetchToken(query) {
  try {
    let code = query.code;
    let state = query.state;
    let tokenResponse = await hikeUpSDK.getToken(code);
    let integration = {
      name: state,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expire_in: tokenResponse.expires_in,
      fileSync: false,
      fileSyncStatus: 'run',
      entitySync: false,
      entitySyncStatus: 'run',
      saleSync: false,
      saleSyncStatus: 'run',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    logger.info({message: 'Got token', data: {token: tokenResponse, integration: integration}});
    await Integration.findOneAndUpdate({name: state}, integration, {upsert: true, new: true});
  }
  catch (e) {
    logger.error('Error getting token from account', e);
    let error = e instanceof ErrorHandler ? e : new ErrorHandler('Error getting token from account');
    throw error;
  }
}

module.exports = {
  getAuthUrl,
  fetchToken
};