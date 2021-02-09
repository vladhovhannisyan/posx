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
const hikeUpSDK = require('./../utils/hikeup-sdk');
const hikeCustomer = require('./../models/hikeCustomer');
const hikeProduct = require('./../models/hikeProduct');
const hikeLocation = require('./../models/hikeLocation');
const hikeRegister = require('./../models/hikeRegister');
const hikeTax = require('./../models/hikeTax');
const hikePayment = require('./../models/hikePayment');
const HikeInvoiceFile = require('./../models/hikeInvoiceFile');
const HikeInvoiceItemFile = require('./../models/hikeInvoiceItemFile');
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}); //Make this configurable

async function saleMapper(integration, invoice, invoiceItems) {
    try {
        var payload;
        let customer = await hikeCustomer.findOne({integrationId: integration._id, customerCode: invoice.customerId});
        let payment = await hikePayment.findOne({integrationId: integration._id, name: invoice.paymentMethod1});
        if(!customer) {
            logger.info({message: 'Customer not found in invoice', invoice});
        } else {
            payload = {
                "number": invoice.invoiceId,
                "transactionDate": moment.utc(new Date(invoice.creationDatetime)).format('YYYY-MM-DDTHH:mm:ss.SSZ'),
                "finalizeDate": moment.utc(new Date(invoice.creationDatetime)).format('YYYY-MM-DDTHH:mm:ss.SSZ'),
                "customerId": customer.id,
                "customerName": customer.firstName + ' ' + customer.lastName,
                // "customerGroupId":1,
                // "customerGroupDiscount":5,
                // "customerGroupDiscountNote":"Hike Group:5% off",
                "outletId": 1,
                "registerid": 1,
                // "registerName":"Cash Register 1",
                // "registerClosureId":1,
                // "barcode":"#1000629",
                "status": 'Completed',
                "taxInclusive": true,
                // "applyTaxAfterDiscount":true,
                // "discountIsAsPercentage":true,
                // "discountValue":5,
                // "discountNote":"",
                // "tipIsAsPercentage":true,
                // "tipValue":0,
                "subTotal": invoice.sellTotal,
                "giftCardTotal":0,
                "totalDiscount":0,
                "totalShippingCost":0,
                "shippingTaxAmount":0,
                "otherCharges":0,
                "totalTax": parseFloat(invoice.tax1Total).toFixed(2),
                "totalTip":0,
                "roundingAmount": 0,
                "netAmount": parseFloat(invoice.total).toFixed(2),
                "totalPaid": parseFloat(invoice.totalPaid).toFixed(2),
                "totalTender": parseFloat(invoice.total).toFixed(2),
                // "changeAmount":0,
                "currency":"INR",
                //"servedBy":1,
                //"servedByName":"Jack Hike",
                "note":"",
                "creationTime": moment.utc(invoice.creationDatetime).format('YYYY-MM-DDTHH:mm:ss.SSZ'),
                //"isReStockWhenRefund":false,
                //"trackURL":"",
                //"trackDetails":"",
                //"doNotUpdateInvenotry":false,
                //"thirdPartySyncStatus":1,
                //"customerCurrentLoyaltyPoints":329.3,
                //"loyaltyPoints":217.6,
                //"loyaltyPointsValue":2.18,
                "invoiceLineItems":[],
                "invoicePayments":[{
                    "paymentOptionId": payment.paymentOptionType,
                    "paymentOptionName": invoice.paymentMethod1,
                    "paymentOptionType": payment.paymentOptionType,
                    //"tenderedAmount":207.6,
                    //"roundingAmount":0.03,
                    "amount": invoice.paymentAmount1,
                    "isPaid":true,
                    "outletId":1,
                    "registerId":1,
                    //"registerClosureId":1,
                    //"actionType":1,
                    "paymentDate": moment.utc(new Date(invoice.creationDatetime)).format('YYYY-MM-DDTHH:mm:ss.SSZ'),
                    //"paymentFrom":3,
                    //"servedBy":"Jack Hike",
                    //"invoicePaymentDetails":[],
                    //"isDeleted":false,
                    "creationTime": moment.utc(new Date(invoice.creationDatetime)).format('YYYY-MM-DDTHH:mm:ss.SSZ'),
                    //"creatorUserId":1,
                    "id": payment.id
                }],
                "isActive": true,
            };

            await Promise.resolve(npmAsync.mapSeries(invoiceItems, async function(item){
                let product = await hikeProduct.findOne({integrationId: integration._id, sku: item.productCode});
                let tax = await hikeTax.findOne({integrationId: integration._id, name: item.taxName});
                if(!product) {
                    logger.info({message: 'Product not found in invoice', item});
                } else {
                    payload['invoiceLineItems'].push({
                        //"invoiceItemType":0,
                        //"invoiceItemValue":2,
                        //"invoiceItemValueParent":1,
                        //"sequence":1,
                        "title": product.name,
                        "sku": product.sku,
                        // "category":
                        //     [
                        //         {
                        //             "categoryId":1,
                        //             "productId":220,
                        //             "name":"Demo Clothing",
                        //             "productName":"Demo Jeans",
                        //             "sku":"demojeans"
                        //         }
                        //     ],
                        //"brand": product.brandId,
                        // "tags":[{"tagId":5,"name":"simple"}],
                        "itemCost": parseFloat(item.sellLineItem).toFixed(2),
                        "quantity": item.quantityLineItem,
                        //"refundedQuantity":0,
                        "soldPrice": parseFloat(item.total).toFixed(2),
                        "retailPrice":parseFloat(item.sellLineItem).toFixed(2),
                        "totalAmount":parseFloat(item.total).toFixed(2),
                        //"taxExclusiveTotalAmount":0,
                        "taxId": tax.id,
                        "taxName": item.taxName,
                        "taxRate": tax.rate,
                        "taxAmount": item.tax1Total ? parseFloat(item.tax1Total).toFixed(2) : 0,
                        // "effectiveAmount":190,
                        // "discountIsAsPercentage":true,
                        "discountValue":0,
                        "totalDiscount":0,
                        // "actionType":1,
                        // "loyaltyPoints":10,
                        // "lineItemTaxes":[
                        // ],
                        // "invoiceLineSubItems":[
                        // ],
                        "id": product.id,
                        "isActive": product.isActive
                    });
                }
            }));
        }
        await hikeUpSDK.createSale(integration, payload);
        console.log('payload', payload);
        return payload;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function pushAllSales(integration) {
    try {
        let invoice = await HikeInvoiceFile.findOne({integrationId: integration._id, status: 'new'});
        if(invoice) {
            let invoiceItems = await HikeInvoiceItemFile.find({integrationId: integration._id, invoiceId: invoice.invoiceId});
            let mappedSale = await saleMapper(integration, invoice, invoiceItems);
            //console.log('invoice', invoice);
            //console.log('invoiceItems', invoiceItems);
            //console.log('mappedSale', mappedSale);
        } else {
            return {status: 'completed'}
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function runSalePushWorker(){
    try {
        while(moment().utc().isSameOrBefore(maxAnchorTimeStamp)){
            let integration = await Integration.findOneAndUpdate({saleSync: false, status: 'active', saleSyncStatus: 'run', fileSync: true, entitySync: true}, {saleSyncStatus: 'running'});
            if(integration) {
                logger.info({message: 'Processing sale push for integration', integration, functionName: 'runEntitySyncWorker'});
                let salePush = await pushAllSales(integration);
                console.log('salePush', salePush);
                // if(syncEntity.status == 'completed') {
                //     logger.info({message: 'Completed entity sync for integration', integration, functionName: 'runEntitySyncWorker'});
                //     await Integration.findOneAndUpdate({_id: ObjectId(integration._id)},{saleSyncStatus: 'run', saleSync: true});
                // } else {
                //     let failedCount = integration.failedCount ? (integration.failedCount + 1) : 1;
                //     if(failedCount == 5) {
                //         logger.debug({message: 'Disabled sale push for integration', data: integration});
                //         await Integration.findOneAndUpdate({_id: ObjectId(integration._id)}, {status: 'disabled', failedCount: failedCount});
                //     } else {
                //         logger.debug({message: 'Disabled sale push for integration '+failedCount, data: integration});
                //         await Integration.findOneAndUpdate({_id: ObjectId(integration._id)},{failedCount: failedCount, saleSyncStatus: 'run'});
                //     }
                // }
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

runSalePushWorker();