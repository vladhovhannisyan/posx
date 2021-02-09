const sqsSDK = require('./../utils/sqs-sdk');
const logger = require('winston-logstash-transporter')(__filename);
async function createQueues() {
    try {
      let queueUrl = await sqsSDK.addQueue(process.env.ORDER_QUEUE);
      await sqsSDK.addQueue(process.env.DEADLETTER_QUEUE);
      await sqsSDK.addDeadLetterQueue(queueUrl);
    } catch(error) {
      logger.error({message: 'Error while creating queues'});
      throw error;
    }
}

module.exports = {
    createQueues
}