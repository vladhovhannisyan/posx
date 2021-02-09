const logger = require('winston-logstash-transporter')(__filename);
var AWS = require('aws-sdk');
AWS.config.update({region: process.env.SQS_REGION});
AWS.config.setPromisesDependency(require('bluebird'));



var sqs = new AWS.SQS({
    endpoint: process.env.SQS_QUEUE_URL,
    apiVersion: process.env.SQS_API_VERSION, 
    accessKeyId: process.env.SQS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.SQS_ACCESS_SECRET
});

/**
 * 
 * @param {*} queueName Queue name to add in queue
 */
const addQueue = async function(queueName) {
    try {
        let params = {
            QueueName: queueName,
            Attributes: {
                'DelaySeconds': '60',
                'MessageRetentionPeriod': '86400'
            }
        };
        let data = await sqs.createQueue(params).promise();
        return data.QueueUrl;
    } catch(error) {
        logger.error({message: 'Error while creating queue', error});
        throw error;
    }
}

/**
 * 
 * @param {*} queueUrl Add dead letter queue for given queue url
 */

const addDeadLetterQueue = async function(queueUrl) {
    try {
        let deadLetterArn = `arn:aws:sqs:${process.env.SQS_REGION}:${process.env.ACCOUNT_ID}:${process.env.DEADLETTER_QUEUE}`
        let params = {
            Attributes: {
                "RedrivePolicy": "{\"deadLetterTargetArn\":\""+deadLetterArn+"\",\"maxReceiveCount\":\"10\"}"
            },
            QueueUrl: queueUrl
        };
        let data = await sqs.setQueueAttributes(params).promise();
        return data;
    } catch(error) {
        logger.error({message: 'Error while adding dead letter queue', error});
        throw error;
    }
}

/**
 * 
 * @param {*} queueName get queue url of give queue name
 */
const getQueueUrl = async function(queueName) {
    try {
        let params = {
            QueueName: queueName
            };
            
        let data = await sqs.getQueueUrl(params).promise();
        return data.QueueUrl;
    } catch(error) {
        logger.error({message: 'Error while getting queue url', error});
        throw error;
    }
}

/**
 * 
 * @param {*} queueName Queue name to delete
 */

const deleteQueue = async function(queueName) {
    try {
        let params = {
            QueueName: queueName
        };   
        let data = await sqs.deleteQueue(params).promise();
        return data;
    } catch(error) {
        logger.error({message: 'Error while getting queue url', error});
        throw error;
    }
}

/**
 * List of all queues
 */

const listQueues = async function() {
    try {
        let params = {};
        let data = await sqs.listQueues(params).promise();
        return data.QueueUrls;
    } catch(error) {
        logger.error({message: 'Error while getting queue urls', error});
        throw error;
    }
}

/**
 * 
 * @param {*} messageAttributes Filter attributes sent to identify messages
 * @param {*} messageBody Message for queue in string format
 * @param {*} queueUrl Queue Url
 */
const addMessage = async function(messageAttributes, messageBody, queueUrl) {
    try {
        let params = {
            DelaySeconds: 10,
            MessageAttributes: messageAttributes,
            MessageBody: messageBody,
            QueueUrl: queueUrl
            };
        let data = await sqs.sendMessage(params).promise();
        return data.MessageId;
            
    } catch(error) {
        logger.error({message: 'Error while adding message in queue', error});
        throw error;
    }
}

/**
 * get Message from queue. get data.Messages array
 * @param {*} queueUrl Queue url
 */
const getMessage = async function(queueUrl) {
    try {
        let params = {
            AttributeNames: [
                "All"
            ],
            MaxNumberOfMessages: 1,
            MessageAttributeNames: [
                "All"
            ],
            QueueUrl: queueUrl,
            VisibilityTimeout: 20,
            WaitTimeSeconds: 0
        };
        let data = await sqs.receiveMessage(params).promise();
        return data.Messages;
            
    } catch(error) {
        logger.error({message: 'Error while sending message in queue', error});
        throw error;
    }
}

/**
 * Delete message from queue
 * @param {*} queueUrl Queue url
 * @param {*} receiptHandle coming from send message data.Messages[0].ReceiptHandle
 */
const deleteMessage = async function(queueUrl, receiptHandle) {
    try {
        var params = {
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle
        };
        let data = await sqs.deleteMessage(params).promise();
        return data;    
    } catch(error) {
        logger.error({message: 'Error while deleting message in queue', error});
        throw error;
    }
}

module.exports = {
    addQueue: addQueue,
    addDeadLetterQueue: addDeadLetterQueue,
    getQueueUrl: getQueueUrl,
    deleteQueue: deleteQueue,
    listQueues: listQueues,
    addMessage: addMessage,
    getMessage: getMessage,
    deleteMessage: deleteMessage
}
