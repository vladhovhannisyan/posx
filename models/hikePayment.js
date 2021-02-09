var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hikePaymentSchema = new Schema({
  integrationId: {type: String},
  id: {type: Number},
  name: {type: String},
  paymentOptionType: {type: Number},
  paymentOptionName: {type: String},
  isActive: {type: Boolean},
  createdAt: {type: Date, Default: new Date()},
  updatedAt: {type: Date, Default: new Date()},
  deletedAt: {type: Date}
});

var HikePayment = mongoose.model('HikePayment', hikePaymentSchema);

module.exports = HikePayment;