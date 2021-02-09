const fetch = require('node-fetch');
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const { URLSearchParams } = require('url');
const Integration = require('./../models/integration');
const logger = require('winston-logstash-transporter')(__filename);

const getToken = async function(code) {
    try {
        let url = hostHelper('gettoken');
        console.log('url', url);
        const params = new URLSearchParams({
            client_id: process.env.HIKE_CLIENT_ID,
            client_secret: process.env.HIKE_CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.HIKE_REDIRECT_URL,
            grant_type: 'authorization_code'
        });
        let request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        };
        let result = await fetch(url, request);
        let finalResult = await result.json();
        logger.info({message: 'Fetched token', data: finalResult});
        return finalResult;
    } catch(error) {
        logger.error({message: 'Error while fetching token '+integration.storeId, error});
        throw error;
    }
};

const refreshToken = async function(integration) {
    try {
        let url = hostHelper('refreshtoken');
        const params = new URLSearchParams({
            client_id: process.env.HIKE_CLIENT_ID,
            client_secret: process.env.HIKE_CLIENT_SECRET,
            refresh_token: integration.refresh_token,
            grant_type: 'refresh_token'
        });
        let request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        };
        let result = await fetch(url, request);
        let finalResult = await result.json();
        logger.info({message: 'Fetched token', data: finalResult});
        let updatedIntegration = {
            access_token: finalResult.access_token,
            refresh_token: finalResult.refresh_token,
            expire_in: finalResult.expires_in
        }
        let newIntegration = await Integration.findOneAndUpdate({name: integration.name}, updatedIntegration, {new: true});
        return newIntegration;
    } catch(error) {
        logger.error({message: 'Error while fetching refresh token '+integration.storeId, error});
        throw error;
    }
};

const createSale = async function(integration, sale) {
    try {
        let url = hostHelper('createsale');
        let request = {
            method: 'POST',
            headers: {
                'Content-Type': 'text/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+integration.access_token
            },
            body: JSON.stringify(sale)
        };
        let result = await fetch(url, request);
        if(result.status == 200 || result.status == 201) {
            let finalResult = await result.json();
            logger.info({message: 'Sale created', data: finalResult});
        } else if(result.status == 401) {
            let newIntegration = await refreshToken(integration);
            await createSale(newIntegration, sale);
        } else {
            let failedResult = await result.json();
            logger.info({message: 'Failed sale', data: failedResult});
        }
    } catch(error) {
        logger.error({message: 'Error while fetching refresh token '+integration.storeId, error});
        throw error;
    }
};

const getLocation = async function(integration) {
    try {
        let url = hostHelper('getlocation');
        let request = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+integration.access_token
            }
        };
        let result = await fetch(url, request);
        if(result.status == 200) {
            let finalResult = await result.json();
            logger.info({message: 'Location fetched', data: finalResult});
            return finalResult;
        } else if(result.status == 401) {
            let newIntegration = await refreshToken(integration);
            await getLocation(newIntegration);
        } else {
            logger.info({message: 'Failed get location'});
            return false;
        }
    } catch(error) {
        logger.error({message: 'Error while fetching location '+integration.name, error});
        throw error;
    }
};

const getRegister = async function(integration) {
    try {
        let url = hostHelper('getregister');
        let request = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+integration.access_token
            }
        };
        let result = await fetch(url, request);
        if(result.status == 200) {
            let finalResult = await result.json();
            logger.info({message: 'Register fetched', data: finalResult});
            return finalResult;
        } else if(result.status == 401) {
            let newIntegration = await refreshToken(integration);
            await getRegister(newIntegration);
        } else {
            logger.info({message: 'Failed register fetch'});
            return false;
        }
    } catch(error) {
        logger.error({message: 'Error while fetching register '+integration.name, error});
        throw error;
    }
};

const getProduct = async function(integration, filter) {
    try {
        let url = hostHelper('getproduct');
        let request = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+integration.access_token
            }
        };
        const params = new URLSearchParams(filter);
        let finalUrl = url + '?' + params;
        let result = await fetch(finalUrl, request);
        if(result.status == 200) {
            let finalResult = await result.json();
            logger.info({message: 'Product fteched', data: finalResult});
            return finalResult;
        } else if(result.status == 401) {
            let newIntegration = await refreshToken(integration);
            await getProduct(newIntegration, filter);
        } else {
            logger.info({message: 'Failed product fetch'});
            return false;
        }
    } catch(error) {
        logger.error({message: 'Error while fetching product '+integration.name, error});
        throw error;
    }
};

const getCustomer = async function(integration, filter) {
    try {
        let url = hostHelper('getcustomer');
        let request = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+integration.access_token
            }
        };
        const params = new URLSearchParams(filter);
        let finalUrl = url + '?' + params;
        let result = await fetch(finalUrl, request);
        if(result.status == 200) {
            let finalResult = await result.json();
            logger.info({message: 'Customer fetched', data: finalResult});
            return finalResult;
        } else if(result.status == 401) {
            let newIntegration = await refreshToken(integration);
            await getCustomer(newIntegration, filter);
        } else {
            logger.info({message: 'Failed customer fetch'});
            return false;
        }
    } catch(error) {
        logger.error({message: 'Error while fetching refresh token '+integration.storeId, error});
        throw error;
    }
};

const getPayment = async function(integration) {
    try {
        let url = hostHelper('getpayment');
        let request = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+integration.access_token
            }
        };
        let result = await fetch(url, request);
        if(result.status == 200) {
            let finalResult = await result.json();
            logger.info({message: 'Payment fetched', data: finalResult});
            return finalResult;
        } else if(result.status == 401) {
            let newIntegration = await refreshToken(integration);
            await getPayment(newIntegration);
        } else {
            logger.info({message: 'Failed payment fetch'});
            return false;
        }
    } catch(error) {
        logger.error({message: 'Error while fetching payment '+integration.name, error});
        throw error;
    }
};

const getTax = async function(integration) {
    try {
        let url = hostHelper('gettax');
        let request = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+integration.access_token
            }
        };
        let result = await fetch(url, request);
        if(result.status == 200) {
            let finalResult = await result.json();
            logger.info({message: 'Tax fetched', data: finalResult});
            return finalResult;
        } else if(result.status == 401) {
            let newIntegration = await refreshToken(integration);
            await getTax(newIntegration);
        } else {
            logger.info({message: 'Tax fetched sale'});
        }
    } catch(error) {
        logger.error({message: 'Error while fetching tax '+integration.name, error});
        throw error;
    }
};

function hostHelper(action){
    if(action == 'gettoken'){
        return `${process.env.HIKE_BASE_URL}/oauth/token`;
    } else if(action == 'refreshtoken'){
        return `${process.env.HIKE_BASE_URL}/oauth/token`;
    } else if(action == 'createsale'){
        return `${process.env.HIKE_BASE_URL}/api/v1/sales/create`;
    } else if(action == 'getlocation'){
        return `${process.env.HIKE_BASE_URL}/api/v1/outlets/get_all`;
    } else if(action == 'getregister'){
        return `${process.env.HIKE_BASE_URL}/api/v1/outlets/get_Registers_all`;
    } else if(action == 'getproduct'){
        return `${process.env.HIKE_BASE_URL}/api/v1/products/get_all`;
    } else if(action == 'getcustomer'){
        return `${process.env.HIKE_BASE_URL}/api/v1/customers/get_all`;
    } else if(action == 'getpayment'){
        return `${process.env.HIKE_BASE_URL}/api/v1/payment_types/get_all`;
    } else if(action == 'gettax'){
        return `${process.env.HIKE_BASE_URL}/api/v1/taxes/get_all`;
    } else {
        return `${process.env.HIKE_BASE_URL}/oauth/token`;
    }
}

module.exports = {
    getToken,
    refreshToken,
    createSale,
    getLocation,
    getRegister,
    getProduct,
    getCustomer,
    getPayment,
    getTax
};