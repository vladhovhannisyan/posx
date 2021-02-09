const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const moment = require('moment');
const maxAnchorTimeStamp = moment().add(10, 'minutes').utc();
const sqsSDK = require('./../utils/sqs-sdk');
const fetch = require('node-fetch');
const Sentry = require('@sentry/node');
const logger = require('winston-logstash-transporter')(__filename);
Sentry.init({ dsn:  process.env.SENTRY_URL});
const npmAsync = require('async');

mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}); //Make this configurable

async function mapOrder(order, integration){
    try {
        let payload = {};
        payload['accountId'] = integration.accountId;
        payload['restaurant'] = {};
        payload['restaurant']['name'] = integration.name;
        payload['restaurant']['externalId'] = integration.storeId;
        payload['restaurant']['currency'] = order.currencyCode ? order.currencyCode : 'USD';
        payload['externalId'] = order.externalIdentifiers.id;
        payload['orderDate'] = order.orderedAt;
        payload['orderType'] = order.fulfillmentInfo.fulfillmentMode.toLowerCase();
        payload['orderSource'] = 'Online';
        payload['estimatedFulfilmentDate'] = order.fulfillmentInfo.pickupTime;
        if(moment(order.fulfillmentInfo.pickupTime).isAfter(moment().add('120', 'minute').format())) {
            payload['futureOrderDate'] = order.fulfillmentInfo.pickupTime;
        }
        payload['friendlyOrderId'] = order.externalIdentifiers.friendlyId;
        payload['customer'] = {};
        payload['customer']['externalId'] = order.customer.externalId;
        payload['customer']['firstName'] = order.customer.name;
        payload['customer']['lastName'] = '';
        payload['customer']['email'] = order.customer.email;
        payload['customer']['phone'] = order.customer.phone;
        if(order.deliveryInfo && order.deliveryInfo.destination) {
            payload['customer']['address'] = {};
            payload['customer']['address']['line1'] = order.deliveryInfo.destination.addressLines ? order.deliveryInfo.destination.addressLines[0] : '';
            payload['customer']['address']['line2'] = (order.deliveryInfo.destination.addressLines.length == 2) ? order.deliveryInfo.destination.addressLines[1] : '';
            payload['customer']['address']['city'] = order.deliveryInfo.destination.city ? order.deliveryInfo.destination.city : '';
            payload['customer']['address']['number'] = order.deliveryInfo.destination.number ? order.deliveryInfo.destination.number : '4605';
            payload['customer']['address']['state'] = order.deliveryInfo.destination.state ? order.deliveryInfo.destination.state : '';
            payload['customer']['address']['country'] = order.deliveryInfo.destination.countryCode ? order.deliveryInfo.destination.countryCode : '';
            payload['customer']['address']['zip'] = order.deliveryInfo.destination.postalCode ? order.deliveryInfo.destination.postalCode : '';
            payload['customer']['address']['long'] = order.deliveryInfo.destination.location ? order.deliveryInfo.destination.location.longitude : '';
            payload['customer']['address']['lat'] = order.deliveryInfo.destination.location ? order.deliveryInfo.destination.location.latitude : '';
        }
        payload['discount'] = parseFloat(order.orderTotal.discount).toFixed(2);
        payload['subTotal'] = parseFloat(order.orderTotal.subtotal).toFixed(2);
        payload['total'] = parseFloat(order.orderTotal.total).toFixed(2);
        payload['tip'] = parseFloat(order.orderTotal.tip).toFixed(2);
        payload['deliveryCharge'] = parseFloat(order.orderTotal.deliveryFee).toFixed(2);
        payload['discountCoupon'] = order.orderTotal.couponCode;
        payload['deliveryCharge'] = parseFloat(order.orderTotal.deliveryFee).toFixed(2);
        payload['taxes'] = [];
        payload['taxes'].push({
            name: 'Tax',
            value: parseFloat(order.orderTotal.tax).toFixed(2)
        });
        payload['paymentDetails'] = [];
        await Promise.resolve(npmAsync.mapSeries(order.customerPayments, async function(payment){
            payload['paymentDetails'].push({
                externalId: payment.externalId,
                name: payload.paymentMethod,
                value: parseFloat(payment.value).toFixed(2),
                type: payload.paymentMethod
            });
        }));
        
        payload['items'] = [];
        await Promise.resolve(npmAsync.mapSeries(order.items, async function(item){
            let allmodifires = [];
            await Promise.resolve(npmAsync.mapSeries(item.modifiers, async function(modifier){
                allmodifires.push({
                    externalId: modifier.id,
                    name: modifier.name,
                    price: parseFloat(modifier.price).toFixed(2),
                    quantity: modifier.quantity,
                    groupName: modifier.groupName,
                    groupId: modifier.groupId
                });
            }));
            if(allmodifires.length) {
                payload['items'].push({
                    externalId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price).toFixed(2),
                    categoryId: item.categoryId,
                    categoryName: item.categoryName,
                    modifiers: allmodifires,
                    instructions: item.note
                });
            } else {
                payload['items'].push({
                    externalId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price).toFixed(2),
                    categoryId: item.categoryId,
                    categoryName: item.categoryName,
                    instructions: item.note
                });
            }
        }));
        payload['posSystem'] = integration.type;
        return payload;
    } catch(error) {
        logger.error({message: 'Error while mapping order', error});
        throw error;
    }
}

async function sendOrderToFoodService(message) {
    try {
        if(message.type == 'cancel') {
            logger.info({message: 'Processing cancel order push to food service', data: message.order, functionName: 'sendOrderToFoodService'});
            const foodServiceCancelRequest = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accountId: message.integration.accountId,
                    orderId: message.order.externalIdentifiers.id,
                    restaurant: {
                        externalId: message.integration.storeId
                    }
                })
            };
            await fetch(process.env.FOOD_SERVICE_CANCEL_INTERNAL_API, foodServiceCancelRequest);
            logger.info({message: 'Completed cancel order push to food service', data: message.order, functionName: 'sendOrderToFoodService'});
        } else {
            let mappedOrder = await mapOrder(message.order, message.integration);
            logger.info({message: 'Processing order push to food service', mappedOrder, functionName: 'sendOrderToFoodService'});
            const foodServiceRequest = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mappedOrder)
            };
            await fetch(process.env.FOOD_SERVICE_INTERNAL_API, foodServiceRequest);
            logger.info({message: 'Completed order push to food service', mappedOrder, functionName: 'sendOrderToFoodService'});
        }
        
    } catch (error) {
        throw error;
    }
}

async function runPushQueueWorker(){
    try {
        let queueUrl = await sqsSDK.getQueueUrl(process.env.ORDER_QUEUE);
        while(moment().utc().isSameOrBefore(maxAnchorTimeStamp)){
            let messages = await sqsSDK.getMessage(queueUrl);
            if(messages && messages.length) {
                let message = JSON.parse(messages[0].Body);
                await sendOrderToFoodService(message);
                await sqsSDK.deleteMessage(queueUrl, messages[0].ReceiptHandle);
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
    }
    catch (error) {
        logger.error({message: 'Error in push worker hikeup', error});
        Sentry.captureException(error);
        process.exit(1);
    }
    finally {
        mongoose.connection.close().then(function(){
            process.exit(0);
        });
    }
}

runPushQueueWorker();