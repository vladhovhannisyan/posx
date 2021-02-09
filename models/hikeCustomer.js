var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hikeCustomerSchema = new Schema({
  integrationId: {type: String},
  id: {type: Number},
  firstName: {type: String},
  lastName: {type: String},
  customerCode: {type: String},
  companyName: {type: String},
  isActive: {type: Boolean},
  createdAt: {type: Date, Default: new Date()},
  updatedAt: {type: Date, Default: new Date()},
  deletedAt: {type: Date}
});

var HikeCustomer = mongoose.model('HikeCustomer', hikeCustomerSchema);

module.exports = HikeCustomer;