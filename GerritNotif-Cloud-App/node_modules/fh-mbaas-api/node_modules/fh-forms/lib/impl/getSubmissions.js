var models = require('../common/models.js')();
var groups = require('./groups.js');
var async = require('async');
var _ = require('lodash');

var FIELD_TYPES_INCLUDED_IN_SUMMARY = ["text", "textarea", "number", "emailAddress", "dropdown", "radio", "dateTime"];
var NUM_FIELDS_INCLUDED_IN_SUMMARY = 3;

/*
 * getSubmissions(connections, options, appId, cb) *
 *   connections: {
 *     mongooseConnection: ...
 *   }
 *
 *   options: {
 *     uri: db connection string,
 *   }
 *   params: {
 *     appId: optional appId of submissions to retrieve,
 *     formId: optional formId of submissions to retrieve
 *   }
 *   cb - callback function (err, result)
 *      result: {
 *        submissions: []    // array of submissions
 *      }
 */
module.exports = function getSubmissionList(connections, options, params, cb) {
  var formSubmissionModel = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
  var fieldModel = models.get(connections.mongooseConnection, models.MODELNAMES.FIELD);
  var formModel = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);
  var restrictToUser = options.restrictToUser;

  var query = {
    "status": "complete"
  };

  //Checking if the formId needs to be mapped to its id instead of a full form object.
  if(params.formId){
    params.formId = (params.formId instanceof Array) ? params.formId : [params.formId];
    params.formId = _.map(params.formId, function(form){
      if(typeof(form) === "object"){
        return form._id;
      } else {
        return form;
      }
    });
  }

  async.waterfall([
    function (cb) {
      if (params.appId) {  // if appid specified then ensure user is allowed access
        query.appId = params.appId;
        return groups.validateAppAllowedForUser(connections, restrictToUser, params.appId, function(err) {
          return cb(err);
        });
      } else {  // restrict to particular allowed apps
        groups.getAppsForUser(connections, restrictToUser, function (err, allowedApps) {
          if (err) return cb(err);
          if (allowedApps) {
            query.appId = {$in: allowedApps};
          }
          return cb();
        });
      }
    },
    function (cb) {
      if (params.formId) {
        var formIds = (params.formId instanceof Array) ? params.formId : [params.formId];
        query.formId = {$in :formIds};
        groups.validateFormAllowedForUser(connections, restrictToUser, params.formId, cb);
      } else {  // restrict to particular allowed forms
        groups.getFormsForUser(connections, restrictToUser, function (err, allowedForms) {
          if (err) return cb(err);
          if (allowedForms) {
            query.formId = {$in: allowedForms};
          }
          return cb();
        });
      }
    },
    function (cb){
      if(params.subid && params.subid instanceof Array){
        //formId and appId will already be populated if they are needed.
        query._id = {$in:params.subid};
      }
      return cb();
    }
  ], function (err) {
    if (err) return cb(err);

    formSubmissionModel
    .find(query)
    .sort({submissionStartedTimestamp: -1})
    .populate({"path": "formId", "model": formModel, "select": "name"})
    .populate({"path": "formFields.fieldId", "model": fieldModel, "select": "-__v"})
    .exec(function(err, foundSubmissions){
      if(err) return cb(err);
      var retSubmissions = [];
      async.each(
        foundSubmissions,
        function(item, cb) {
          var submission = JSON.parse(JSON.stringify(item));
            if(err) return cb(err);

            reformatFormIdAndName(submission, function (err, submission) {
              if(err) return cb(err);
              submission.appName = resolveAppName(submission.appId);

              function restrict(submission, rcb) {
                if (params.wantRestrictions === false) return rcb(null, submission);
                restrictSubmissionForSummary(submission, rcb);
              }

              restrict(submission, function (err, restrictedSubmission) {
                if(err) return cb(err);
                retSubmissions.push(restrictedSubmission);
                return cb();
              });
            });
        }, function (err) {
          if (err) return cb(err);
          return cb(undefined, {submissions: retSubmissions});
        }
      );
    });
  });

  function resolveAppName(appId) {
    var name = "Unknown";
    if(params.appMap && params.appMap.result) {
      var len = params.appMap.result.length;
      for(var i=0; i < len; i++){
        if(params.appMap.result[i].guid === appId){
          name = params.appMap.result[i].title;
          break;
        }
      }
    }
    return name;
  }

  function reformatFormIdAndName(submission, cb) {
    var formName = "Unknown";
    var formId = "Unknown";
    if(submission && submission.formId && submission.formId.name) {
      formName = submission.formId.name;
    }
    if(submission && submission.formId && submission.formId._id) {
      formId = submission.formId._id;
    }
    submission.formName = formName;
    submission.formId = formId;
    return cb(undefined, submission);
  }
};

function restrictSubmissionForSummary(submission, cb) {
  var formFields = submission.formFields;
  var restrictedFormFields = [];
  delete submission.formFields;
  delete submission.formSubmittedAgainst;
  submission.formFields = restrictedFormFields;
  async.eachSeries(formFields, function (formField, cb) {
    var finishFlag;
    if(FIELD_TYPES_INCLUDED_IN_SUMMARY.indexOf(formField.fieldId.type) >= 0) {
      restrictedFormFields.push(formField);
      if(restrictedFormFields.length === NUM_FIELDS_INCLUDED_IN_SUMMARY) {
        finishFlag = "limit reached";
      }
    }
    return cb(finishFlag);
  }, function (err) {
    var retErr = err;

    if (retErr && retErr === "limit reached") {
      retErr = undefined;
    }
    if(retErr) return cb(retErr);

    return cb(undefined, submission);
  });
}
