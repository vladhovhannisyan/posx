const express = require('express');
const apiRouter = express.Router();
const integrationController = require('../controller/integration.controller');
const sourceSystemsController = require('../controller/sourceSystems');


/**
 * Create a integration in hikeup service
 * @route POST /integration/create
 * @group Integration
 * @param {Integration.model} body.body.required - Integration payload
 * @returns {Integration.model} 201
 * @returns {Error.model} 400 - Validation error, params not fulfilled
 * @returns {Error.model} 403 - Forbidden, integration not valid
 * @returns {Error.model} 404 - Not found, url not found
 * @returns {Error.model} 401 - Unauthorised, token invalid
 */
apiRouter.post('/integration/create', async(req, res, next) => {
  try {
    let result = await integrationController.createIntegration(req.body);
    res.status(201).send(result);
  }
  catch (e) {
    next(e);
  }
});

/**
 * Update a integration in hikeup service
 * @route PUT /integration/update/{id}
 * @group Integration
 * @param {string} id.path.required - Id of integration to modify
 * @param {Integration.model} body.body.required - Integration payload
 * @returns {Integration.model} 201
 * @returns {Error.model} 400 - Validation error, params not fulfilled
 * @returns {Error.model} 403 - Forbidden, integration not valid
 * @returns {Error.model} 404 - Not found, url not found
 * @returns {Error.model} 401 - Unauthorised, token invalid
 */
apiRouter.put('/integration/update/:id', async(req, res, next) => {
  try {
    let result = await integrationController.updateIntegration(req.params.id, req.body);
    res.status(200).send(result);
  }
  catch (e) {
    next(e);
  }
});

/**
 * Get a integration in hikeup service
 * @route GET /integration/get/{id}
 * @group Integration
 * @param {string} id.path.required - Id of integration to fetch data
 * @returns {Integration.model} 201
 * @returns {Error.model} 400 - Validation error, params not fulfilled
 * @returns {Error.model} 403 - Forbidden, integration not valid
 * @returns {Error.model} 404 - Not found, url not found
 * @returns {Error.model} 401 - Unauthorised, token invalid
 */
apiRouter.get('/integration/get/:id', async(req, res, next) => {
  try {
    let result = await integrationController.getIntegration(req.params.id);
    res.status(200).send(result);
  }
  catch (e) {
    next(e);
  }
});

/**
 * Delete a integration in hikeup service
 * @route DELETE /integration/delete/{id}
 * @group Integration
 * @param {string} id.path.required - Id of integration to fetch data
 * @returns {object} 201
 * @returns {Error.model} 400 - Validation error, params not fulfilled
 * @returns {Error.model} 403 - Forbidden, integration not valid
 * @returns {Error.model} 404 - Not found, url not found
 * @returns {Error.model} 401 - Unauthorised, token invalid
 */
apiRouter.delete('/integration/delete/:id', async(req, res, next) => {
  try {
    let result = await integrationController.deleteIntegration(req.params.id);
    res.status(200).send(result);
  }
  catch (e) {
    next(e);
  }
});

/**
 * Get valid source system names
 * @route GET /source-systems
 * @group Source Systems
 * @returns {array} 200
 */
apiRouter.get('/source-systems', async(req, res, next) => {
  try {
    let result = await sourceSystemsController.getSourceSystems();
    res.send(result);
  }
  catch (e) {
    next(e);
  }
});

/**
 * Get all integration in hikeup service
 * @route GET /get-all-integration
 * @group Integration
 * @returns {array} 200
 */
apiRouter.get('/get-all-integration', async(req, res, next) => {
  try {
    let result = await integrationController.getAllIntegrations();
    res.send(result);
  }
  catch (e) {
    next(e);
  }
});

apiRouter.get('/asd', async(req, res) => {
  try {
    // let result = await integrationController.getAllIntegrations();
    res.send('asdasd');
  }
  catch (e) {
    // next(e);
  }
});

module.exports = apiRouter;