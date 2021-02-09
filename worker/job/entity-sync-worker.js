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
const syncEntityMethods = require('./../utils/syncEntityMethods');

mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}); //Make this configurable

const entityToSync = [
    {
        name: 'locations',
        pagination: false
    },
    {
        name: 'registers',
        pagination: false
    },
    {
        name: 'products',
        pagination: true
    },
    {
        name: 'customers',
        pagination: true
    },
    {
        name: 'taxes',
        pagination: false
    },
    {
        name: 'payments',
        pagination: false
    }
];

async function syncAllEntities(integration) {
    try {
        await Promise.resolve(npmAsync.mapSeries(entityToSync, async function(entity){
            if(entity.pagination) {
                let filter = {
                    page_size: 100,
                    Skip_count: 0
                }
                await syncEntityMethods[entity.name](integration, filter);
            } else {
                await syncEntityMethods[entity.name](integration);
            }
        }));
        return {status: 'completed'}
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function runEntitySyncWorker(){
    try {
        while(moment().utc().isSameOrBefore(maxAnchorTimeStamp)){
            let integration = await Integration.findOneAndUpdate({entitySync: false, status: 'active', entitySyncStatus: 'run'}, {entitySyncStatus: 'running'});
            if(integration) {
                logger.info({message: 'Processing entity sync for integration', integration, functionName: 'runEntitySyncWorker'});
                let syncEntity = await syncAllEntities(integration);
                if(syncEntity.status == 'completed') {
                    logger.info({message: 'Completed entity sync for integration', integration, functionName: 'runEntitySyncWorker'});
                    await Integration.findOneAndUpdate({_id: ObjectId(integration._id)},{entitySyncStatus: 'run', entitySync: true});
                } else {
                    let failedCount = integration.failedCount ? (integration.failedCount + 1) : 1;
                    if(failedCount == 5) {
                        logger.debug({message: 'Disabled entity sync for integration', data: integration});
                        await Integration.findOneAndUpdate({_id: ObjectId(integration._id)}, {status: 'disabled', failedCount: failedCount});
                    } else {
                        logger.debug({message: 'Disabled entity sync for integration '+failedCount, data: integration});
                        await Integration.findOneAndUpdate({_id: ObjectId(integration._id)},{failedCount: failedCount, entitySyncStatus: 'run'});
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

runEntitySyncWorker();