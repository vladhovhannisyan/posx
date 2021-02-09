var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hikeInvoiceFileSchema = new Schema({
    integrationId: {type: String},
    invoiceId: {type: String},
    invoiceStatus: {type: String},
    invoiceType: {type: String},
    creationDatetime: {type: String},
    modificationDatetime: {type: String},
    customerId: {type: String},
    quantity: {type: String},
    sellTotal: {type: String},
    tax1Total: {type: String},
    taxCodeId: {type: String},
    tax1Rate: {type: String},
    total: {type: String},
    totalPaid: {type: String},
    paymentAmount1: {type: String},
    paymentMethod1: {type: String},
    paymentType1: {type: String},
    status: {type: String, default: 'new'}
});

var HikeInvoiceFile = mongoose.model('HikeInvoiceFile', hikeInvoiceFileSchema);

module.exports = HikeInvoiceFile;