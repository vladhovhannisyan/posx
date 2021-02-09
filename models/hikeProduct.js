var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hikeProductSchema = new Schema({
  integrationId: {type: String},
  id: {type: Number},
  name: {type: String},
  description: {type: String},
  sku: {type: String},
  barcode: {type: String},
  brandId: {type: Number},
  beandName: {type: String},
  isActive: {type: Boolean},
  createdAt: {type: Date, Default: new Date()},
  updatedAt: {type: Date, Default: new Date()},
  deletedAt: {type: Date}
});

var HikeProduct = mongoose.model('HikeProduct', hikeProductSchema);

module.exports = HikeProduct;