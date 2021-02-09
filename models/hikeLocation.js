var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hikeLocationSchema = new Schema({
  integrationId: {type: String},
  id: {type: Number},
  name: {type: String},
  taxId: {type: String},
  isActive: {type: Boolean},
  createdAt: {type: Date, Default: new Date()},
  updatedAt: {type: Date, Default: new Date()},
  deletedAt: {type: Date}
});

var HikeLocation = mongoose.model('HikeLocation', hikeLocationSchema);

module.exports = HikeLocation;