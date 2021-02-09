var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hikeInvoiceItemFileSchema = new Schema({
    integrationId: {type: String},
    invoiceId: {type: String},
    creationDate: {type: String},
    customerId: {type: String},
    quantityLineItem: {type: String},
    productCode: {type: String},
    sellLineItem: {type: String},
    tax1Total: {type: String},
    total: {type: String},
    taxName: {type: String},
});

var HikeInvoiceItemFile = mongoose.model('HikeInvoiceItemFile', hikeInvoiceItemFileSchema);

module.exports = HikeInvoiceItemFile;