const logger = require('winston-logstash-transporter')(__filename);
const sourceSystemController = require('../controller/sourceSystems');

module.exports = async () => {
  try {
    let sourceSystems = [
      {
        name: 'Teknisa'
      }
    ];
    await sourceSystemController.findOrCreateSourceSystems(sourceSystems);
  }
  catch (error) {
    logger.error({
      message: 'Could not create source systems',
      error
    });
    throw new Error('Could not create source systems');
  }
};