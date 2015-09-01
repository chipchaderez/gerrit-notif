var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var async = require('async');


var getSubmissionStatus = function(connections, options, cb) {
  var FormSubmission = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
  var Field = models.get(connections.mongooseConnection, models.MODELNAMES.FIELD);

  var submission = options.submission;
  var submissionToCheck;
  var fieldsToCheck = [];
  var pendingFiles = [];
  var submissionStatus = "pending";
  var alreadyComplete;

  if(!submission){
    return cb(new Error("No submission entered"));
  }

  var submissionValidation = validate(submission);

  submissionValidation.has("submissionId", function(failure){
    if(failure) return cb(new Error(failure));

    async.series([findSubmission, checkSubmissionComplete], function(err){
      if(err) return cb(err);

      var resultJSON = {};

      resultJSON.pendingFiles = pendingFiles;
      resultJSON.status = submissionStatus;

      return cb(undefined, resultJSON);
    });

    function findSubmission(cb){
      FormSubmission.findOne({"_id" : submission.submissionId},function(err, foundSubmission){
        if(err) return cb(err);

        if(foundSubmission === null){
          return cb(new Error("Submission with id " + submission.submissionId + " not found"));
        }

        if(foundSubmission.status === "complete"){//Submission already marked as complete -- no need to check again.
          submissionStatus = "complete";
          alreadyComplete = true;
          return cb();
        }

        FormSubmission.populate(foundSubmission, {"path": "formFields.fieldId", "model": Field, "select": "-__v"}, function(err, updatedSubmission){
          if(err) return cb(err);

          if(updatedSubmission === null){
            return cb("No submission matches id " + submission.submissionId);
          }

          submissionToCheck = updatedSubmission;

          return cb();
        });
      });
    }

    function checkSubmissionComplete(cb){
      //For the submission to be complete, any files it contains must have been saved.

      if(alreadyComplete === true){
        return cb();
      }

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
          var filesWaitingToBeUploaded = formField.fieldValues.filter(function(fieldValue){
            return fieldValue.groupId === null || fieldValue.groupId === undefined;
          });

          async.each(filesWaitingToBeUploaded, function(fileToBeUploaded, cb){
            pendingFiles.push(fileToBeUploaded.hashName);
            return cb();
          }, cb);
        }, cb);
      });
    }
  });
}

module.exports = getSubmissionStatus;