var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hikeTaxSchema = new Schema({
  integrationId: {type: String},
  id: {type: Number},
  name: {type: String},
  rate: {type: Number},
  isActive: {type: Boolean},
  createdAt: {type: Date, Default: new Date()},
  updatedAt: {type: Date, Default: new Date()},
  deletedAt: {type: Date}
});

var HikeTax = mongoose.model('HikeTax', hikeTaxSchema);

module.exports = HikeTax;