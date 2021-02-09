const logger = require('winston-logstash-transporter')(__filename);
const SourceSystem = require('../models/sourceSystem');
const {ErrorHandler} = require('../utils/errorHandler');

/**
 * Fetch all source systems
 * @function
 * @returns {*}
 */
async function getSourceSystems() {
  try {
    logger.debug('Fetching source systems');
    return await SourceSystem.find({});
  }
  catch (e) {
    logger.error({
      message: 'Could not get source systems',
      e
    });
    let error = e instanceof ErrorHandler ? e : new ErrorHandler('Could not get source systems', 500);
    throw error;
  }
}

/**
 * Upsert source systems in food service
 * @function
 * @param {Array} data
 * @return {*}
 */
async function findOrCreateSourceSystems(data) {
  try {

    if (!(data instanceof Array && data.length)) {
      throw new Error('data should be a valid array');
    }
    logger.debug({
      message: 'Will create these source systems',
      data
    });

    let createdSourceSystems = await Promise.all(data.map(async (eachSourceSystem) => {
      return await SourceSystem.findOneAndUpdate({name: eachSourceSystem.name}, eachSourceSystem, {
        new: true,
        upsert: true
      });
    }));

    logger.debug({
      message: 'Created source systems',
      createdSourceSystems
    });
    return createdSourceSystems;
  }
  catch (e) {
    logger.error({message: 'Error creating source systems', e});
    throw error;
  }
}

module.exports = {
  findOrCreateSourceSystems,
  getSourceSystems
};