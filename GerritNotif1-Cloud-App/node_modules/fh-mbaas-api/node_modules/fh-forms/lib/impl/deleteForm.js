var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var groups = require('./groups.js');
var async = require('async');

var deleteForm = function(connections, options, cb) {

  async.series([validateParams, validateGroupAccessToForm, deleteFormUsingId], cb);

  function validateParams(cb){
    var paramsValidator = validate(options);
    paramsValidator.has("_id", function(failure){
      if(failure){
        return cb(new Error("Invalid params to deleteForm. No form Id specified."));
      } else {
        return cb();
      }
    });
  }

  function validateGroupAccessToForm(cb) {
    return groups.validateFormAllowedForUser(connections, options.restrictToUser, options._id, cb);
  }

  // updates to AppForms sub collection
  function updateAppForms(formId, cb) {
    var appFormsModel = models.get(connections.mongooseConnection, models.MODELNAMES.APP_FORMS);
    appFormsModel.find({forms: formId}).exec(function (err, apps) {
      if (err) return cb(err);

      function removeAppForm(app, callback) {
        var forms = app.forms;
        var newForms = [];
        forms.forEach(function(form) {
          if (!form.equals(formId)) newForms.push(form.toString());
        });
        appFormsModel.findById(app._id).exec(function(err, a) {
          if (err) return callback(err);
          a.forms = newForms;
          a.save(callback);
        });
      }
      async.map(apps, removeAppForm, cb);
    });
  }

  // delete submissions for this form
  function deleteSubmissions(formId, cb) {
    var formSubmissionModel = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);

    formSubmissionModel
    .find({"formId" : formId})
    .remove()
    .exec(cb);
  }

  function deleteFormUsingId(cb){
    var formModel = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);
    var formId = options._id;

    async.series([
      function (cb) { // first remove the form itself
        return formModel.findById(formId).remove().exec(cb);
      },
      function (cb) { // then remove the AppForms
        updateAppForms(formId, cb);
      },
      function (cb) { // remove deleted from from any groups
        groups.removeFormFromAllGroups(connections, formId, cb);
      },
      function (cb) { // remove submissions
        deleteSubmissions(formId, cb);
      }
    ], function (err) {
      if (err) return cb(err);
      return cb(null);
    });
  }
};

module.exports = deleteForm;
