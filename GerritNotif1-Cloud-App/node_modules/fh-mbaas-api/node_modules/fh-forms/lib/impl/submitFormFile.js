var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var fhgridfs = require("fh-gridfs").MongoFileHandler;
var async = require("async");
var fs = require("fs");
var mime = require("mime");

//options {:fileid, :submissionId, :fieldId, :fileStream, :fileName}

var submitFormFile = function(connections, options, cb) {

  var FormSubmission = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
  var submissionToUse;
  var submissionFieldIndex;
  var filePlaceholderIndex;
  var savedFileGroupId;
  var submission = options.submission;
  var fileHandler = new fhgridfs();


  if(!submission){
    return cb(new Error("No data submitted"));
  }

  var validateOptions = validate(submission);
  validateOptions.has("fileId", "submissionId", "fieldId", "fileStream", function(failure){
    if(failure) return cb(failure);

    if(!fs.existsSync(submission.fileStream)){
      return cb(new Error("File upload does not exist, aborting."));
    }

    async.series([getSubmission, findPlaceholder, saveFileStream, updateSubmission], function(err){
      if(err) return cb(err);

      var resultJSON = {};
      resultJSON.status = 200;
      resultJSON.savedFileGroupId = savedFileGroupId;
      resultJSON.formSubmission = submissionToUse.toJSON();

      return cb(undefined, resultJSON);
    });
  });

  function getSubmission(cb){
    FormSubmission.findOne({"_id": submission.submissionId}, function(err, foundSubmission){
      if(err) return cb(err);

      if(foundSubmission === null || foundSubmission === undefined){
        return cb(new Error("No submission found matching submission id " + submission.submissionId));//TODO -- Need to do error codes
      }

      //Submission found, find the fileId
      submissionToUse = foundSubmission;
      return cb();
    });
  }

  function findPlaceholder(cb){

    var indexOfField = -1;
    for(var formFieldIndex = 0; formFieldIndex < submissionToUse.formFields.length ; formFieldIndex++){
      if(submissionToUse.formFields[formFieldIndex].fieldId.toString() === submission.fieldId.toString()){
        indexOfField = formFieldIndex;
        break;
      }
    }

    if(indexOfField === -1){
      return cb(new Error("No field with id " + submission.fieldId + " exists in submission " + submissionToUse._id));
    }

    submissionFieldIndex = indexOfField;

    var submissionEntry = submissionToUse.formFields[indexOfField];

    var indexOfFilePlaceholder = -1;

    for(var i = 0; i < submissionEntry.fieldValues.length; i++){
      if(submissionEntry.fieldValues[i].hashName.toString() === submission.fileId.toString()){
        indexOfFilePlaceholder = i;
        break;
      }
    }

    if(indexOfFilePlaceholder === -1){
      return cb(new Error("No file with id " + submission.fileId + " exists in field " + submission.fieldId + " for submission " +  submissionToUse._id));
    }

    filePlaceholderIndex = indexOfFilePlaceholder;
    return cb();
  }

  function saveFileStream(cb){
    //Path to the file is passed, create a read stream
    var submittedFileStream = fs.createReadStream(submission.fileStream);
    submittedFileStream.pause();

    var fileDetails = submissionToUse.formFields[submissionFieldIndex].fieldValues[filePlaceholderIndex];

    var fileNameToSave = fileDetails.fileName;
    var fileExtension = mime.extension(fileDetails.fileType);

    if(fileNameToSave.indexOf("." + fileExtension) === -1){
      fileNameToSave += "." + fileExtension;
    }

    var saveFileOptions = {};

    if(submission.decodeBase64){
      saveFileOptions.decodeBase64 = true;
    }

    fileHandler.saveFile(connections.databaseConnection, fileNameToSave , submittedFileStream, saveFileOptions, function(err, saveResult){
      if(err) return cb(err);

      savedFileGroupId = saveResult.groupId.toString();

      if(submission.keepFile){
        return cb();
      } else {
        fs.unlink(submission.fileStream, function(err){
          if(err) console.error(err);
          return cb();
        });
      }
    });
  }

  function updateSubmission(cb){
    //Form file saved, now the submission can be updated to the groupId belonging to the file

    submissionToUse.formFields[submissionFieldIndex].fieldValues[filePlaceholderIndex].groupId = savedFileGroupId;
    submissionToUse.markModified("formFields");
    submissionToUse.save(cb);

  }
};

module.exports = submitFormFile;
