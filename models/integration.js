var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var integrationSchema = new Schema({
  name: {type: String},
  access_token: {type: String},
  refresh_token: {type: String},
  expire_in: {type: String},
  fileSync: {type: Boolean},
  fileSyncStatus: {type: String},
  entitySync: {type: Boolean},
  entitySyncStatus: {type: String},
  saleSync: {type: Boolean},
  saleSyncStatus: {type: String},
  status: {type: String},
  failedCount: {type: Number},
  createdAt: {type: Date, Default: new Date()},
  updatedAt: {type: Date, Default: new Date()},
  deletedAt: {type: Date}
});

var Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration;