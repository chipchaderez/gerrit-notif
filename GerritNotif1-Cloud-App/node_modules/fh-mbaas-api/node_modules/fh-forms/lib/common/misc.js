var async = require('async');
var _ = require('underscore');
var mbaasFileUrlTemplate = "/mbaas/forms/:appId/submission/:submissionId/file/:fileGroupId";

function generatePageAndFieldRefs(formDefinition){
  var pageRef = {};
  var fieldRef = {};

  for(var pageIndex = 0; pageIndex < formDefinition.pages.length; pageIndex++){
    pageRef[formDefinition.pages[pageIndex]._id] = pageIndex;

    for(var fieldIndex = 0; fieldIndex < formDefinition.pages[pageIndex].fields.length; fieldIndex++){
      fieldRef[formDefinition.pages[pageIndex].fields[fieldIndex]._id] = {};
      fieldRef[formDefinition.pages[pageIndex].fields[fieldIndex]._id].page = pageIndex;
      fieldRef[formDefinition.pages[pageIndex].fields[fieldIndex]._id].field = fieldIndex;
    }
  }

  return {"pageRef" : pageRef, "fieldRef": fieldRef};
}

function mapSubmissionValsToFormsFields(submission, formJson, cb){
  var FILE_UPLOAD_URL = "/api/v2/forms/submission/file/";    //not sure what to do with this value
  if(! submission){
    return cb("no submission passed");
  }else if(! formJson){
    return cb("no form definition found in submission");
  }

  /**
   * The field definition can either be in the submission that has a populated fieldId,
   * Or the field definition is an admin field that is in the formSubmitted agains.
   * As this field is not included in a client submission, a scan of the formSubmitted against must be made.
   * @param field
   * @param formJSON
   */
  function addAdminFieldToSubmission(field){
    if(!field){
      return;
    }

    //Full field object is used in the return as existing fields are populated already.
    var subObject = {
      fieldId : field,
      fieldValues: []
    };

    submission.formFields.push(subObject);
  }

  async.mapSeries(formJson.pages, function(page, mcb0) {

    async.mapSeries(page.fields, function(field, mcb1) {
      var subFieldMatch = _(submission.formFields).find(function(subField) {
        //match the submission field to the existing formField
        var matched = subField.fieldId._id.toString() === field._id.toString(); // need toString() as ids are objects
        if(matched){
          subField.matched = true;
        }
        return matched;
      });
      if(subFieldMatch){
        field.values =  subFieldMatch.fieldValues || [];
      } else {
        field.values= [];
        addAdminFieldToSubmission(field);
      }
      switch(field.type) {
        case 'photo':
        case 'signature':
          async.map(field.values, function(val, mcb2) {
            val.url = FILE_UPLOAD_URL + val.groupId+"?rand=" + Math.random();
            val.mbaasUrl = mbaasFileUrlTemplate;
            mcb2();
          }, mcb1);
          break;
        case 'file':
          field.values.forEach(function(val) {
            if(null !== val){
              val.downloadUrl = FILE_UPLOAD_URL + val.groupId;
              val.mbaasUrl = mbaasFileUrlTemplate;
            }
          });
          return mcb1();
        default:
          return mcb1();
      }
    }, mcb0);
  },function (err){
     submission.formSubmittedAgainst = formJson;
     cb(err, submission);
  });
}

function pruneAdminFields(options, fullyPopulatedForm, cb){
  var prunedPages = [];

  /**
   * If admin fields are to be shown, then don't prune admin fields.
   */
  if(options.showAdminFields){
    return cb(fullyPopulatedForm);
  }

  async.each(fullyPopulatedForm.pages, function(page, pageCb){
    var updatedFields = [];
    async.each(page.fields, function(field, fieldCb){
      if(!field.adminOnly){
        updatedFields.push(field);
      }
      fieldCb();
    }, function(){
      page.fields = updatedFields;
      prunedPages.push(page);
      pageCb();
    });
  }, function(){
    fullyPopulatedForm.pages = prunedPages;
    cb(fullyPopulatedForm);
  });
}


exports.generatePageAndFieldRefs = generatePageAndFieldRefs;
exports.mapSubmissionValsToFormsFields = mapSubmissionValsToFormsFields;
exports.pruneAdminFields = pruneAdminFields;