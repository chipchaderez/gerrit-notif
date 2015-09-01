var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var notification = require('./notification.js');
var async = require('async');
var logger = require('../common/logger.js').getLogger();

var completeFormSubmission = function(connections, options, cb) {
  var FormSubmission = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
  var Field = models.get(connections.mongooseConnection, models.MODELNAMES.FIELD);

  var submission = options.submission;
  var submissionToCheck;
  var fieldsToCheck = [];
  var filesWaitingToBeUploaded = [];

  if(!submission){
    return cb(new Error("No submission entered"));
  }

  var submissionValidation = validate(submission);

  submissionValidation.has("submissionId", function(failure){
    if(failure) return cb(new Error(failure));

    //submissionId defined,
    async.series([findSubmission, checkSubmissionComplete], function(err){
      if(err) return cb(err);

      var completeStatus = {"formSubmission": submissionToCheck.toJSON(),"result": "ok", "status" : "complete"};

      if(filesWaitingToBeUploaded.length > 0){
        completeStatus.status = "pending";
        completeStatus.pendingFiles = filesWaitingToBeUploaded.map(function(fileWaiting){
          return fileWaiting.hashName;
        });
      }
      if("complete" === completeStatus.status) {
        updateSubmission(function (err) {
          if(err) return cb(err);
          completeStatus.formSubmission = submissionToCheck.toJSON();  // after updating database
          logger.debug('completeFormSubmission() - Submission marked complete: ', completeStatus);

          notification.emitFormEvent(notification.constants.FORM_EVENT_SUBMISSION_COMPLETED, {
            submissionId: completeStatus.formSubmission._id,
            submission: completeStatus.formSubmission,
            submissionCompletedTimestamp: completeStatus.formSubmission.submissionCompletedTimestamp
          });

          notification.sendNotification(connections, completeStatus, function () {
            return cb(undefined, completeStatus);
          });
        });
      } else {
        logger.warn('completeFormSubmission() - completeSubmission attempted but submission still pending: ', completeStatus);
        return cb(undefined, completeStatus);
      }
    });
  });

  function findSubmission(cb){
    FormSubmission.findOne({"_id" : submission.submissionId},function(err, foundSubmission){
      if(err) return cb(err);

      if(foundSubmission === null){
        return cb(new Error("Submission with id " + submission.submissionId + " not found"));
      }

      FormSubmission.populate(foundSubmission, {"path": "formFields.fieldId", "model": Field, "select": "-__v"}, function(err, updatedSubmission){
        if(err) return cb(err);


        submissionToCheck = updatedSubmission;

        return cb();
      });
    });
  }

  function checkSubmissionComplete(cb){
    //For the submission to be complete, any files it contains must have been saved.

    //First, find any fields that are files, photos or signatures.
    async.eachSeries(submissionToCheck.formFields, function(formField, cb){
      if(formField.fieldId.type === "file" || formField.fieldId.type === "photo" || formField.fieldId.type === "signature"){
        fieldsToCheck.push(formField);
      }

      return cb();
    }, function(err){
      if(err) return cb(err);

      //All required file fields are now populated
      async.eachSeries(fieldsToCheck, function(formField, cb){

        formField.fieldValues = formField.fieldValues ? formField.fieldValues : [];
        filesWaitingToBeUploaded = formField.fieldValues.filter(function(fieldValue){
            return fieldValue.groupId === null || fieldValue.groupId === undefined;
        });

        cb();
      }, cb);
    });
  }

  function updateSubmission(cb){
    //Submission totally complete, ready to finalise
    submissionToCheck.submissionCompletedTimestamp = new Date().getTime();
    submissionToCheck.status = "complete";
    submissionToCheck.markModified("submissionCompletedTimestamp");

    submissionToCheck.save(function(err){

      cb(err);
    });
  }
};

module.exports = completeFormSubmission;
