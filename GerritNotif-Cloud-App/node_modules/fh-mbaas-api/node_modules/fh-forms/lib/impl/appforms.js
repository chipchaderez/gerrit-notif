var async = require('async');
var util = require('util');
var models = require('../common/models.js')();
var getForms = require('./getForms.js')();
var groups = require('./groups.js');
var _ = require('underscore');
var validation = require('./../common/validate');

exports.updateAppForms = updateAppForms;
exports.getAppFormsForApp = getAppFormsForApp;
exports.getAllAppForms = getAllAppForms;
exports.getAppFormsWithPopulatedForms = getAppFormsWithPopulatedForms;

function mapArrayOfFormIdsToForms(connections, formsIds, allowedForms, cb) {
  async.map(formsIds, function(form, cb) {
    return cb(undefined, form.toString());        // get list of ObjectIDs as strings, to allo filtering
  }, function (err, stringifiedFormIds) {
    if (err) return cb(err);

    if (allowedForms) {     // if should restrict access
      formsToReturn = _.intersection(stringifiedFormIds, allowedForms);
    } else {
      formsToReturn = stringifiedFormIds;    // else return all forms
    }
    getForms.findForms(connections, formsToReturn, function(err, forms){   // get all forms listed in array
      if(err) return cb(err);

      return cb(undefined, forms);
    });
  });
}

function getAppFormsWithPopulatedForms(connections, restrictToUser, appid, cb) {
    var AppForms = models.get(connections.mongooseConnection, models.MODELNAMES.APP_FORMS);
    async.waterfall([
      function (cb) {  // ensure user authorised for app before getting list of forms
        groups.validateAppAllowedForUser(connections, restrictToUser, appid, cb);
      },
      function (cb) {  // get forms that user has access to
        groups.getFormsForUser(connections, restrictToUser, function (err, allowedForms) {
          var query = {"appId" : appid};
          AppForms.findOne(query, function (err, appForms) {  // get all forms associated with this app
            if (err) return cb(err);

            if(!appForms || !appForms.forms) {
              return cb();
            }
            return mapArrayOfFormIdsToForms(connections, appForms.forms, allowedForms, cb);
          });
        });
      }
    ], cb);
}

function getAllAppFormsWithPopulatedForms(connections, restrictToUser, cb) {
    var AppForms = models.get(connections.mongooseConnection, models.MODELNAMES.APP_FORMS);
    async.waterfall([
      function (cb) {  // ensure user authorised for app before getting list of forms
        groups.getAppsForUser(connections, restrictToUser, cb);
      },
      function (allowedApps, cb) {
        var query = {};
        if (allowedApps) {
          query.appId = {$in:allowedApps};
        }

        groups.getFormsForUser(connections, restrictToUser, function (err, allowedForms) {
          AppForms.find(query, function (err, appForms) {  // get all forms associated with this app
            if (err) return cb(err);
            if(!appForms) {
              return cb(undefined, null);
            }
            async.map(appForms, function (item, cb) {
              mapArrayOfFormIdsToForms(connections, item.forms, allowedForms, function (err, populatedForms) {
                return cb(undefined, {_id: item._id, appId: item.appId, lastUpdated: item.lastUpdated, forms: populatedForms});
              });
            }, cb);
          });
        });
      }
    ], cb);
}

/*
 * updateAppForms(connections, options, appForms, cb)
 *
 *    connections: {
 *       mongooseConnection: ...
 *    }
 *
 *    options: {
 *       uri:       db connection string,
 *       userEmail: user email address string
 *    }
 *
 *    appForms: {
 *      appId: id of the App
 *      forms: array of formIds
 *    }
 *
 *    cb  - callback function (err)
 *
 */

function updateAppForms(connections, options, appForms, cb) {
  var validate = validation(appForms);
  function validateParams(cb) {
    validate.has("appId","forms",cb);
  }
  validateParams(function(err) {
    if (err) return cb(err);
    var conn = connections.mongooseConnection;
    var appFormsModel = models.get(conn, models.MODELNAMES.APP_FORMS);
    var appId = appForms.appId;
    var forms = appForms.forms;

    groups.validateAppAllowedForUser(connections, options.restrictToUser, appId, function (err) {
      if (err) return cb(err);

      groups.getFormsForUser(connections, options.restrictToUser, function (err, allowedForms) {
        if (err) return cb(err);

        if (allowedForms) {
          var disallowedForms = _.difference(forms, allowedForms);
          if (disallowedForms.length > 0) {
            return cb(new Error('No permission for forms: ' + util.inspect(disallowedForms)));
          }
        }

        appFormsModel.findOne({appId:appId}).exec(function (err, af) {
          if (err) return cb(err);
          if (af) {
            af.forms = appForms.forms;
            af.save(cb);
          } else {
            var afm = new appFormsModel(appForms);
            afm.save(cb);
          }
        });
      });
    });
  });
}

/*
 * getAppFormsForApp(connections, options, cb)
 *
 *    connections: {
 *       mongooseConnection: ...
 *    }
 *
 *    options: {
 *       uri:       db connection string,
 *       userEmail: user email address string,
 *       appId: the App Id
 *    }
 *
 *
 *    cb  - callback function (err)
 *
 */

function getAppFormsForApp(connections, options, cb) {
  getAppFormsWithPopulatedForms(connections, options.restrictToUser, options.appId, function (err, forms) {
    if (err) return cb(err);
    return cb(undefined, {
      _id: options.appId,
      forms: forms
    });
  });
}

/*
 * getAllAppForms(connections, options, cb)
 *
 *    connections: {
 *       mongooseConnection: ...
 *    }
 *
 *    options: {
 *       uri:       db connection string,
 *       userEmail: user email address string
 *    }
 *
 *    cb  - callback function (err)
 *
 */

function getAllAppForms(connections, options, cb) {
  return getAllAppFormsWithPopulatedForms(connections, options.restrictToUser, cb);
}
