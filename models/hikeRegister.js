var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hikeRegisterSchema = new Schema({
  integrationId: {type: String},
  id: {type: Number},
  name: {type: String},
  outletId: {type: String},
  defaultTax: {type: Number},
  prefix: {type: String},
  suffix: {type: String},
  isActive: {type: Boolean},
  createdAt: {type: Date, Default: new Date()},
  updatedAt: {type: Date, Default: new Date()},
  deletedAt: {type: Date}
});

var HikeRegister = mongoose.model('HikeRegister', hikeRegisterSchema);

module.exports = HikeRegister;