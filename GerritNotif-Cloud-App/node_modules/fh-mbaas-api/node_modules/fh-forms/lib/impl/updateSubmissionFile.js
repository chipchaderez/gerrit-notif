var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var fhgridfs = require("fh-gridfs").MongoFileHandler;
var async = require("async");
var fs = require("fs");
var mime = require("mime");

var updateSubmissionFile = function(connections, options, cb) {

  var submissionToUpdate;
  var foundFileValue;
  var FormSubmission = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
  var fileSavedResult;
  var fileHandler = new fhgridfs();
  var submissionFieldIndex, filePlaceholderIndex;

  options = options || {};

  var submission = options.submission || {};
  var fileDetails = submission.fileDetails || {};



  async.series([validateParams, findSubmission, findPlaceholder, saveFileStream, deleteOldFile, updateSubmission], function(err){
    if(err) return cb(err);

    var resultJSON = {};
    resultJSON.status = 200;
    return cb(undefined, resultJSON);
  });

  function validateParams(cb){
    var validateSubmissionDetails = validate(submission);
    var validateFileDetails = validate(fileDetails);

    validateSubmissionDetails.has("fieldId", "submissionId", "fileGroupId", "fileStream", "fileDetails", function(failed){
      if(failed) {
        return cb(new Error("Invalid params to updateSubmissionFile " + JSON.stringify(failed)));
      }

      validateFileDetails.has("fileName", "hashName", "fileType", function(failed){
        if(failed){
          return cb(new Error("Invalid file params to updateSubmissionFile" + JSON.stringify(failed)));
        }

        return cb();
      });
    });
  }

  function findSubmission(cb){

    FormSubmission.findOne({"_id": submission.submissionId}, function(err, foundSubmission){
      if(err) return cb(err);

      if(foundSubmission === null){
        return cb(new Error("No submission matching ID: " + submission.submissionId));
      }

      submissionToUpdate = foundSubmission;

      return cb();
    });
  }

  function findPlaceholder(cb){

    var foundFieldsToUpdate = submissionToUpdate.formFields.filter(function(formField){
      return formField.fieldId.toString() === submission.fieldId.toString();
    });

    if(foundFieldsToUpdate.length === 0){
      return cb(new Error("No field with id " + submission.fieldId + " exists in submission with id " + submission.submissionId));
    }

    var foundFieldValues = foundFieldsToUpdate[0].fieldValues.filter(function(fieldValue){
      return fieldValue.groupId.toString() === submission.fileGroupId.toString();
    });

    if(foundFieldValues.length === 0){
      return cb(new Error("No file with id " + submission.fileGroupId + " exists in the submission with id " + submission.submissionId));
    }


    var indexOfField = -1;
    for(var formFieldIndex = 0; formFieldIndex < submissionToUpdate.formFields.length ; formFieldIndex++){
      if(submissionToUpdate.formFields[formFieldIndex].fieldId.toString() === submission.fieldId.toString()){
        indexOfField = formFieldIndex;
        break;
      }
    }

    if(indexOfField === -1){
      return cb(new Error("No field with id " + submission.fieldId + " exists in submission " + submissionToUpdate._id));
    }

    submissionFieldIndex = indexOfField;

    foundFileValue = foundFieldValues[0];

    var submissionEntry = submissionToUpdate.formFields[indexOfField];

    var indexOfFilePlaceholder = -1;

    for(var i = 0; i < submissionEntry.fieldValues.length; i++){
      if(submissionEntry.fieldValues[i].hashName.toString() === fileDetails.hashName.toString()){
        indexOfFilePlaceholder = i;
        break;
      }
    }

    if(indexOfFilePlaceholder === -1){
      return cb(new Error("No file with id " + submission.hashName + " exists in field " + submission.fieldId + " for submission " +  submissionToUse._id));
    }

    filePlaceholderIndex = indexOfFilePlaceholder;

    return cb();
  }

  function saveFileStream(cb){
    //Path to the file is passed, create a read stream
    var submittedFileStream = fs.createReadStream(submission.fileStream);
    submittedFileStream.pause();

    var fileNameToSave = fileDetails.fileName;
    var fileGroupId = submission.fileGroupId;

    var fileExtension = mime.extension(fileDetails.fileType);

    if(fileNameToSave.indexOf("." + fileExtension) === -1){
      fileNameToSave += "." + fileExtension; 
    }

    var saveFileOptions = {"groupId" : fileGroupId};

    if(submission.decodeBase64){
      saveFileOptions.decodeBase64 = true;
    }

    fileHandler.saveFile(connections.databaseConnection, fileNameToSave , submittedFileStream, saveFileOptions, function(err, saveResult){
      if(err) return cb(err);

      fileSavedResult = saveResult;

      if(submission.keepFile){
        return cb();
      } else {
        fs.unlink(submission.fileStream, function(err){
          if(err) console.log(err);
          return cb();
        });
      }
    });
  }

  function deleteOldFile(cb){

    if(fileSavedResult.version > 1){
      fileHandler.deleteFile(connections.databaseConnection, {"groupId" : submission.fileGroupId, "version": fileSavedResult.version - 1}, cb);
    } else {
      return cb();
    }
  }

  function updateSubmission(cb){
    submissionToUpdate.formFields[submissionFieldIndex].fieldValues[filePlaceholderIndex].fileName = fileSavedResult.fileName;
    submissionToUpdate.formFields[submissionFieldIndex].fieldValues[filePlaceholderIndex].fileType = fileSavedResult.contentType;
    submissionToUpdate.markModified("formFields");
    submissionToUpdate.save(cb);
  }
}


module.exports.updateSubmissionFile = updateSubmissionFile;