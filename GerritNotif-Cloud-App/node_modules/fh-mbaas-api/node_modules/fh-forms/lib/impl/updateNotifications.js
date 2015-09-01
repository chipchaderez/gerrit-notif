var models = require('../common/models.js')();
var groups = require('./groups.js');

/*
 * updateFormNotifications(connections, options, subscribers, cb)
 *
 *    connections: {
 *       mongooseConnection: ...
 *    }
 *
 *    options: {
 *       uri:       db connection string,
 *       _id: form object ID
 *    }
 *
 *    subscribers: [
 *      "some@example.com"
 *    ]
 *
 *    cb  - callback function (err)
 *
 */

module.exports = function(connections, options, subscribers, cb) {
  if (!subscribers || typeof subscribers.length !== "number"){
    return cb("Must supply array of subscribers");
  }
  if(!options._id) {
    return cb(new Error("Invalid params to updateNotifications. FormId Not specified"));
  }

  groups.validateFormAllowedForUser(connections, options.restrictToUser, options._id, function (err) {
    if (err) return cb(err);

    var conn = connections.mongooseConnection;
    var formModel = models.get(conn, models.MODELNAMES.FORM);
    formModel.findById(options._id).exec(function (err, form) {
      if (err) {
        return cb(err);
      }
      if (!form){
        return cb("No form with id " + options._id + " found");
      }

      form.subscribers = subscribers;

      form.save(function(err){
        if (err) {
          return cb(err);
        }
        return cb(null, { _id : form._id, subscribers : subscribers });
      });
    });
  });
};