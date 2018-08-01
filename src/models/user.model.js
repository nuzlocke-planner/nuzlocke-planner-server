var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
  user: {
    type: String
  },
  nuzlockes: {
    type: [Schema.Types.ObjectId],
    default: []
  },
});

var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;