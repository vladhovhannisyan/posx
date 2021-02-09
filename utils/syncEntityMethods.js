const fetch = require('node-fetch');
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const npmAsync = require('async');
const Integration = require('./../models/integration');
const hikeUpSDK = require('./../utils/hikeup-sdk');
const hikeCustomer = require('./../models/hikeCustomer');
const hikeProduct = require('./../models/hikeProduct');
const hikeLocation = require('./../models/hikeLocation');
const hikeRegister = require('./../models/hikeRegister');
const hikeTax = require('./../models/hikeTax');
const hikePayment = require('./../models/hikePayment');
const mapping = require('./../config/mapping.js');

const logger = require('winston-logstash-transporter')(__filename);

const locations = async function(integration) {
    try {
        let allLocations = await hikeUpSDK.getLocation(integration);
        if(allLocations) {
            await Promise.resolve(npmAsync.mapSeries(allLocations.items, async function(location){
                let hikeLocationData = { integrationId: integration._id};
                let mappings = mapping.hikeup.locations.mapping;
                for(let mapping in mappings) {
                    hikeLocationData[mapping] = location[mappings[mapping]];
                }
                await hikeLocation.create(hikeLocationData);
            }));
        } else {
            return false;
        }
    } catch(error) {
        console.log(error);
        throw error;
    }
};

const registers = async function(integration) {
    try {
        let allRegisters = await hikeUpSDK.getRegister(integration);
        if(allRegisters) {
            await Promise.resolve(npmAsync.mapSeries(allRegisters.items, async function(register){
                let hikeRegisterData = { integrationId: integration._id};
                let mappings = mapping.hikeup.registers.mapping;
                for(let mapping in mappings) {
                    hikeRegisterData[mapping] = register[mappings[mapping]];
                }
                await hikeRegister.create(hikeRegisterData);
            }));
        } else {
            return false;
        }
    } catch(error) {
        console.log(error);
        throw error;
    }
};

const customers = async function(integration, filter) {
    try {
        console.log('customer initial filter', filter);
        let allCustomers = await hikeUpSDK.getCustomer(integration, filter);
        if(allCustomers) {
            await Promise.resolve(npmAsync.mapSeries(allCustomers.items, async function(customer){
                let hikeCustomerData = { integrationId: integration._id};
                let mappings = mapping.hikeup.customers.mapping;
                for(let mapping in mappings) {
                    hikeCustomerData[mapping] = customer[mappings[mapping]];
                }
                await hikeCustomer.create(hikeCustomerData);
            }));
            if(allCustomers.items.length < 100) {
                return true;
            } else {
                let newFilter = {
                    page_size: 100,
                    Skip_count: filter.page_size + filter.Skip_count
                };
                await customers(integration, newFilter)
            }
        } else {
            return false;
        }
    } catch(error) {
        console.log(error);
        throw error;
    }
};

const products = async function(integration, filter) {
    try {
        console.log('product initial filter', filter);
        let allProducts = await hikeUpSDK.getProduct(integration, filter);
        if(allProducts) {
            await Promise.resolve(npmAsync.mapSeries(allProducts.items, async function(product){
                let hikeProductData = { integrationId: integration._id};
                let mappings = mapping.hikeup.products.mapping;
                for(let mapping in mappings) {
                    hikeProductData[mapping] = product[mappings[mapping]];
                }
                await hikeProduct.create(hikeProductData);
            }));
            if(allProducts.items.length < 100) {
                return true;
            } else {
                let newFilter = {
                    page_size: 100,
                    Skip_count: filter.page_size + filter.Skip_count
                };
                await products(integration, newFilter)
            }
        } else {
            return false;
        }
    } catch(error) {
        console.log(error);
        throw error;
    }
};

const taxes = async function(integration) {
    try {
        let allTaxes = await hikeUpSDK.getTax(integration);
        if(allTaxes) {
            await Promise.resolve(npmAsync.mapSeries(allTaxes.items, async function(tax){
                let hikeTaxData = { integrationId: integration._id};
                let mappings = mapping.hikeup.taxes.mapping;
                for(let mapping in mappings) {
                    hikeTaxData[mapping] = tax[mappings[mapping]];
                }
                await hikeTax.create(hikeTaxData);
            }));
        } else {
            return false;
        }
    } catch(error) {
        console.log(error);
        throw error;
    }
};

const payments = async function(integration) {
    try {
        let allPaymets = await hikeUpSDK.getPayment(integration);
        if(allPaymets) {
            await Promise.resolve(npmAsync.mapSeries(allPaymets.items, async function(payment){
                let hikePaymentData = { integrationId: integration._id};
                let mappings = mapping.hikeup.payments.mapping;
                for(let mapping in mappings) {
                    hikePaymentData[mapping] = payment[mappings[mapping]];
                }
                await hikePayment.create(hikePaymentData);
            }));
        } else {
            return false;
        }
    } catch(error) {
        console.log(error);
        throw error;
    }
};

module.exports = {
    locations,
    registers,
    customers,
    products,
    taxes,
    payments
};