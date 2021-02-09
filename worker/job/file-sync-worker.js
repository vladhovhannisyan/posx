const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
mongoose.set('useCreateIndex', true);
const moment = require('moment');
const maxAnchorTimeStamp = moment().add(10, 'minutes').utc();
const sqsSDK = require('./../utils/sqs-sdk');
const fetch = require('node-fetch');
const Sentry = require('@sentry/node');
const logger = require('winston-logstash-transporter')(__filename);
Sentry.init({ dsn:  process.env.SENTRY_URL});
const npmAsync = require('async');
const Integration = require('./../models/integration');
const HikeInvoiceFile = require('./../models/hikeInvoiceFile');
const HikeInvoiceItemFile = require('./../models/hikeInvoiceItemFile');
const mapping = require('./../config/mapping.js');
const csv = require('csv-parser');
const fs = require('fs');

mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}); //Make this configurable

async function fileCsvReaderInvoice(integration) {
    try {
        return new Promise(async (resolve, reject) => {
            await Promise.resolve(fs.createReadStream(`./files/${integration.name}-SI.csv`)
            .pipe(csv())
            .on('data', (row) => {
                let hikeInvoiceFileData = { integrationId: integration._id, status: 'new'};
                let mappings = mapping.hikeup.invoiceFile.mapping;
                for(let mapping in mappings) {
                    hikeInvoiceFileData[mapping] = row[mappings[mapping]];
                }
                HikeInvoiceFile.create(hikeInvoiceFileData);
            })
            .on('error', () => {
                console.log('CSV file failed processed');
                resolve({status: 'failed'});
            })
            .on('end', () => {
                console.log('CSV Invoice file successfully processed');
                resolve({status: 'completed'});
            }));
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function fileCsvReaderInvoiceItem(integration) {
    try {
        return new Promise(async (resolve, reject) => {
            await Promise.resolve(fs.createReadStream(`./files/${integration.name}-SLI.csv`)
            .pipe(csv())
            .on('data', (row) => {
                let hikeInvoiceItemFileData = { integrationId: integration._id};
                let mappings = mapping.hikeup.invoiceItemFile.mapping;
                for(let mapping in mappings) {
                    hikeInvoiceItemFileData[mapping] = row[mappings[mapping]];
                }
                HikeInvoiceItemFile.create(hikeInvoiceItemFileData);
            })
            .on('error', () => {
                console.log('CSV file failed processed');
                resolve({status: 'failed'});
            })
            .on('end', () => {
                console.log('CSV Invoice Item file successfully processed');
                resolve({status: 'completed'});
            }));
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function runFileSyncWorker(){
    try {
        while(moment().utc().isSameOrBefore(maxAnchorTimeStamp)){
            let integration = await Integration.findOneAndUpdate({fileSync: false, status: 'active', fileSyncStatus: 'run'}, {fileSyncStatus: 'running'});
            if(integration) {
                logger.info({message: 'Processing file reader for integration', integration, functionName: 'runFileSyncWorker'});
                let fileReadInvoice = await fileCsvReaderInvoice(integration);
                let fileReadInvoiceItem = await fileCsvReaderInvoiceItem(integration);
                if(fileReadInvoice.status == 'completed' && fileReadInvoiceItem.status == 'completed') {
                    logger.info({message: 'Completed file reader for integration', integration, functionName: 'runFileSyncWorker'});
                    await Integration.findOneAndUpdate({_id: ObjectId(integration._id)},{fileSyncStatus: 'run', fileSync: true});
                } else {
                    let failedCount = integration.failedCount ? (integration.failedCount + 1) : 1;
                    if(failedCount == 5) {
                        logger.debug({message: 'Disabled file reader for integration', data: integration});
                        await Integration.findOneAndUpdate({_id: ObjectId(integration._id)}, {status: 'disabled', failedCount: failedCount});
                    } else {
                        logger.debug({message: 'Disabled file reader for integration '+failedCount, data: integration});
                        await Integration.findOneAndUpdate({_id: ObjectId(integration._id)},{failedCount: failedCount, fileSyncStatus: 'run'});
                    }
                }
            } else {
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }
    catch (error) {
        logger.error({message: 'Error in file sync worker hikeup', error});
        Sentry.captureException(error);
        process.exit(1);
    }
    finally {
        mongoose.connection.close().then(function(){
            process.exit(0);
        });
    }
}

runFileSyncWorker();