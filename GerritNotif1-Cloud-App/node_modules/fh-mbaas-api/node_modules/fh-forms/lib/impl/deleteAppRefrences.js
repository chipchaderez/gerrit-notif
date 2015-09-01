var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var groups = require('./groups.js');
var async = require('async');

module.exports = (function () {
  return {
    deleteAppRefrences: function (connections, options, params, cb) {

      async.series([validateParams, validateGroupAccessToForm, deleteAppForms], cb);

      function validateParams(cb){
        var paramsValidator = validate(params);
        paramsValidator.has("appId", function(failure){
          if(failure){
            return cb(new Error("Invalid params to deleteAppReferences. No AppId specified."));
          } else {
            return cb();
          }
        });
      }

      function validateGroupAccessToForm(cb) {
        return groups.validateAppAllowedForUser(connections, options.restrictToUser, params.appId, cb);
      }

      // updates to AppForms sub collection
      function deleteAppForms(cb) {
        var appId = params.appId;

        async.series([
          function (cb) { // first remove the form itself
            var appFormsModel = models.get(connections.mongooseConnection, models.MODELNAMES.APP_FORMS);
            appFormsModel.find({appId: appId}).remove().exec(cb);
          },
          function (cb) { // remove deleted from from any groups
            groups.removeAppFromAllGroups(connections, appId, cb);
          },
          function deleteThemeRefrences (cb){
             var appThemeModel  = models.get(connections.mongooseConnection, models.MODELNAMES.APP_THEMES);
            appThemeModel.find({"appId":appId}).remove().exec(cb);
          }
          // ,
          // function (cb) { // remove submissions
          //   deleteSubmissions(formId, cb);
          // }
        ], function (err) {
          if (err) return cb(err);
          return cb(null);
        });
      }
    }
  };
}());
