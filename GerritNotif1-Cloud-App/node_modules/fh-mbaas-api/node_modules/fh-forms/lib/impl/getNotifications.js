var models = require('../common/models.js')();
var groups = require('./groups.js');
var logger = require('../common/logger.js').getLogger();

/*
 * getNotifications(connections, options, cb)
 *
 *    connections: {
 *       mongooseConnection: ...
 *    }
 *
 *    options: {
 *       uri:       db connection string,
 *       userEmail: user email address string
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

module.exports = function(connections, options, cb) {
  var conn = connections.mongooseConnection;
  var formModel = models.get(conn, models.MODELNAMES.FORM);
  if(!options._id) {
    return cb(new Error("Invalid params to getNotifications. FormId Not specified"));
  }

  groups.validateFormAllowedForUser(connections, options.restrictToUser, options._id, function (err) {
    if (err) return cb(err);

    formModel.findById(options._id).exec(function (err, form) {
      if (err) {
        return cb(err);
      }
      if (!form){
        return cb("No form with id " + options._id + " found");
      }
      var subscribers = (typeof form.subscribers !== "undefined") ? form.subscribers : [];

      logger.debug('getNotifications() - Subscribers: ', subscribers, ', for form: ', options._id);
      return cb(null, { _id : form._id, subscribers : subscribers, formName: form.name });
    });
  });
};
