const Joi = require('@hapi/joi');
const {ErrorHandler} = require('../utils/errorHandler');

/**
 * Known issue:
 * https://github.com/pgroot/express-swagger-generator/issues/53
 */

/**
 * @typedef Integration
 * @property {string} host.required - host of hikeup account
 * @property {string} secret.required - secret of hikeup webhook configuration integrity signature
 */
const schema = Joi.object({
    name: Joi.string().required().error(new ErrorHandler('Restaurent name should be string')),
    type: Joi.string().required().error(new ErrorHandler('Source type should be string')),
    storeId: Joi.string().required().error(new ErrorHandler('Store ID should be string'))
});

module.exports = schema;