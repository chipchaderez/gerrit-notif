var models = require('../common/models.js')();
var groups = require('./groups.js');
var validation = require('./../common/validate');

exports.getFormApps = getFormApps;

/*
 * getFormApps(connections, options, appId, cb)
 *
 *    connections: {
 *       mongooseConnection: ...
 *    }
 *
 *    options: {
 *       uri:       db connection string,
 *       userEmail: user email address string
 *       appId: id of the App
 *    }
 *
 *    cb  - callback function (err)
 *
 */

function getFormApps(connections, options, cb) {
  var validate = validation(options);
  function validateParams(cb) {
    validate.has("formId",cb);
  }
  validateParams(function(err) {
    if (err) return cb(err);
    var conn = connections.mongooseConnection;
    var appFormsModel = models.get(conn, models.MODELNAMES.APP_FORMS);
    var formId = options.formId;
    var restrictToUser = options.restrictToUser;

    groups.validateFormAllowedForUser(connections, restrictToUser, formId, function (err) {
      if (err) return cb(err);

      groups.getAppsForUser(connections, restrictToUser, function (err, allowedApps) {
        var query = {forms: formId};
        if(allowedApps) {
          query.apps = {$in: allowedApps};
        }
        appFormsModel.find(query).exec(function (err, apps) {
          if (err) return cb(err);
          return cb(null, apps);
        });
      });

    });
  });
}