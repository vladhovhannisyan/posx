const logger = require('winston-logstash-transporter')(__filename);
const joiValidate = require('../utils/joiValidate');
const integrationSchema = require('../validator/integration');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const {ErrorHandler} = require('../utils/errorHandler');
const Integration = require('../models/integration');
const Joi = require('@hapi/joi');
const fetch = require('node-fetch');

/**
 * Create a integration in hikeup service
 * @function
 * @param {Object} integration
 * @return {*}
 */
async function createIntegration(integration) {
  try {
    logger.debug({
      message: 'Received integration, will validate against schema',
      inetgration: integration
    });
    joiValidate(integrationSchema, integration);
    let accountPayload = {
      name: integration.name,
      type: integration.type,
      externalId: integration.storeId
    };
    const foodServiceRequest = {
      method: "POST",
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountPayload)
    };
    let account = await fetch(process.env.FOOD_SERVICE_ACCOUNT_INTERNAL_API, foodServiceRequest);
    let createdAccount = await account.json();
    let integrationObject = Object.assign({}, integration, {accountId: createdAccount._id, status: 'active', createdAt: new Date(), updatedAt: new Date()});
    let createdIntegration = await Integration.findOneAndUpdate({storeId: integration.storeId}, integrationObject, {
      new: true,
      upsert: true
    });
    return createdIntegration;
  }
  catch (e) {
    logger.error('Error creating integration', e);
    let error = e instanceof ErrorHandler ? e : new ErrorHandler('Could not create integration');
    throw error;
  }
}

/**
 * Update a integration in hikeup service
 * @function
 * @param {string} integrationId
 * @param {Object} integration
 * @return {*}
 */
async function updateIntegration(integrationId, integration) {
  try {
    logger.debug({
      message: 'Received integration update req, will validate against schema',
      integrationId,
      inetgration: integration
    });
    const schema = Joi.object({
      host: Joi.boolean(),
      secret: Joi.string(),
      accountId: Joi.string(),
      enableForIntegration: Joi.boolean(),
      status: Joi.string()
    });
    joiValidate(schema, integration);
    let integrationObject = Object.assign({updatedAt: new Date()}, integration);
    let updatedIntegration = await Integration.findOneAndUpdate({_id: ObjectId(integrationId)}, integrationObject);
    return updatedIntegration;
  }
  catch (e) {
    logger.error('Error updating integration', e);
    let error = e instanceof ErrorHandler ? e : new ErrorHandler('Could not update integration');
    throw error;
  }
}

/**
 * Get a integration in hikeup service
 * @function
 * @param {string} integrationId
 * @return {*}
 */
async function getIntegration(integrationId) {
  try {
    logger.debug({
      message: 'Received integration get req',
      integrationId
    });
    let integration = await Integration.findOne({_id: ObjectId(integrationId)});
    return integration;
  }
  catch (e) {
    logger.error('Error getting integration', e);
    let error = e instanceof ErrorHandler ? e : new ErrorHandler('Could not get integration');
    throw error;
  }
}

/**
 * Get all integration in hikeup service
 * @function
 * @return {*}
 */
async function getAllIntegrations() {
  try {
    logger.debug({
      message: 'Received all integration get req'});
    let integration = await Integration.find({});
    return integration;
  }
  catch (e) {
    logger.error('Error getting all integration', e);
    let error = e instanceof ErrorHandler ? e : new ErrorHandler('Could not get all integration');
    throw error;
  }
}

/**
 * Delete a integration in hikeup service
 * @function
 * @param {string} integrationId
 * @return {object}
 */
async function deleteIntegration(integrationId) {
  try {
    logger.debug({
      message: 'Received integration delete req',
      integrationId
    });
    let integration = await Integration.findOneAndUpdate({_id: ObjectId(integrationId)}, {deletedAt: new Date(), enableForIntegration: false, status: 'deleted'}, { new: true});
    return integration;
  }
  catch (e) {
    logger.error('Error getting integration', e);
    let error = e instanceof ErrorHandler ? e : new ErrorHandler('Could not get integration');
    throw error;
  }
}

module.exports = {
  createIntegration,
  updateIntegration,
  getIntegration,
  deleteIntegration,
  getAllIntegrations
};