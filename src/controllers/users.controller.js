var User = require('../models/user.model');
var Nuzlocke = require('../models/nuzlocke.model');
var async = require("async");

var UserCtrl = {
  get: (username, callback) => {
    User.findOne({user: username}, 'nuzlockes', callback);
  },
  add: (username, callback) => {
    let user = new User({user: username});
    user.save(callback);
  },
  delete: (username, callback) => {
    async.waterfall([
      // Get the user
      next => User.findOne({user: username}, '', (err, user) => {
        if (err) throw err;
        next(null, user);
      }),
      // Delete nuzlockes of the user
      (user, next) => {
        Nuzlocke.remove({_id :{ '$in': user.nuzlockes }}, (err) => {
          if (err) throw err;
          next(null);
        });
      },
      // Delete the user
      () => User.deleteOne({ user: username }, (err) => {
        if (err) throw err;
        callback();
      })
    ]);
  },
  add_nuzlocke: (username, nuzlocke, callback) => {    
    User.updateOne({ user: username },  {$push: { nuzlockes: nuzlocke }}, callback);
  },
  delete_nuzlocke: (username, nuzlocke, callback) => {
    User.updateOne({ user: username },  {$pull: { nuzlockes: nuzlocke }}, callback);
  },
  has_nuzlocke: (username, nuzlocke, onSuccess, onError) => {
    User.findOne({ user: username, nuzlockes: nuzlocke }, 'nuzlockes', (err, result) => {
      if (err) {
        onError(err);
      } else {
        onSuccess(result != null);
      }
    })
  }
};

module.exports = UserCtrl;