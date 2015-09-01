module.exports = function () {
  var models = require('../common/models.js')();
  var validate = require('../common/validate.js');
  var async = require('async');
  var groups = require('./groups.js');
  var appforms = require('./appforms.js');

  function findForms(connections, listOfIds, cb) {
    var Form = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);

    var query;
    if (listOfIds) {
      query = {_id: { $in: listOfIds}};
    } else {    // if list not passed, get all forms
      query = {};
    }

    Form.find(query).exec(function (err, ok){
      cb(err, ok);
    });
  }

  function getForms(connections, options, cb) {

    var foundAppForms;
    var resJSON;
    var formStatistics = {}; //Form statistics is

    async.series([validateParams, getFormsForAppId, buildFormStatistics, constructResultJSON], function(err){
      if(err) {
        return cb(err);
      } else {
        return cb(undefined, resJSON);
      }
    });

    function buildFormStatistics(cb){

      if(options.notStats) return cb();

      var startOfToday = new Date().setHours(0,0,0,0);


      //If not getting all of the forms, do not populate statistics...
      if(!options.getAllForms){
        return cb();
      }

      groups.getAppsForUser(connections, options.restrictToUser, function (err, allowedApps) {
        if(err) return cb(err);
        var submissionsTotalQuery = {"status": "complete"};
        var submissionsTodayQuery = {"status": "complete", "submissionCompletedTimestamp" : {"$gte" : startOfToday}};
        var appFormCountQuery = {};


        if(allowedApps){
          submissionsTodayQuery.appId = {"$in" : allowedApps};
          submissionsTotalQuery.appId = {"$in" : allowedApps};
          appFormCountQuery.appId = {"$in" : allowedApps};
        }


        async.eachSeries(foundAppForms, function(appForm, cb){
          submissionsTotalQuery.formId = appForm._id;
          submissionsTodayQuery.formId = appForm._id;
          appFormCountQuery.forms = appForm._id;
          formStatistics[appForm._id] = {};
          formStatistics[appForm._id].appsUsingForm = 0;
          formStatistics[appForm._id].submissionsToday = 0;
          formStatistics[appForm._id].submissionsTotal = 0;

          var Submission = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
          Submission.count(submissionsTotalQuery).exec(function(err, submissionsTotal){
            if(err) return cb(err);

            formStatistics[appForm._id].submissionsTotal = submissionsTotal;

            Submission.count(submissionsTodayQuery).exec(function(err, submissionsToday){
              if(err) return cb(err);

              formStatistics[appForm._id].submissionsToday = submissionsToday;


              var AppForm = models.get(connections.mongooseConnection, models.MODELNAMES.APP_FORMS);
              AppForm.count(appFormCountQuery).exec(function(err, appsUsingForm){
                if(err) return cb(err)
                formStatistics[appForm._id].appsUsingForm = appsUsingForm;

                cb();
              });
            });
          });
        }, cb);
      });
    }

    function validateParams(cb){
      var val = validate(options);

      //If the getAllForms parameter is set to true, then the appId will not be included.
      if(options.getAllForms === true){
        return cb();
      }

      val.has("appId", function(failed){
        if(failed){
          return cb(new Error("Invalid parameters to getForms. No AppId Specified."));
        } else {
          return cb();
        }
      });
    }

    function getFormsForAppId(cb){
      if(!options.getAllForms){
        findAppForms(cb);
      } else {
        findAllForms(cb);
      }
    }

    function findAppForms(cb){
      var restrictToUser = options.restrictToUser;
      var appid = options.appId;
      appforms.getAppFormsWithPopulatedForms(connections, restrictToUser, appid, function (err, forms) {
        if(forms !== null){
          foundAppForms = forms;
        }
        return cb();
      });
    }

    function findAllForms(cb){

      groups.getFormsForUser(connections, options.restrictToUser, function (err, allowedForms) {

        findForms(connections, allowedForms, function(err, forms) {

          if(err) return cb(err);

          if(forms !== null){
            foundAppForms = forms;
          }

          return cb();
        });
      });
    }

    function constructResultJSON(cb){
      var res = {"forms": []};
      if(foundAppForms){

        //There is a form associated with the
        async.eachSeries(foundAppForms, function(foundAppForm, cb){
          var formEntry = {"_id": undefined, "formName": undefined, "lastUpdated" : undefined, "description" : ""};
          formEntry._id = foundAppForm._id;
          formEntry.name = foundAppForm.name;
          formEntry.lastUpdated = foundAppForm.lastUpdated.toUTCString();
          formEntry.lastUpdatedTimestamp = foundAppForm.lastUpdated.getTime();
          formEntry.lastUpdatedBy = foundAppForm.lastUpdatedBy;
          formEntry.createdBy = foundAppForm.createdBy || foundAppForm.lastUpdatedBy; //to allow for forms created before the addition of created by. When this form is updated a createdBy will be added
          formEntry.createdOn = foundAppForm.createdOn;

          if(foundAppForm.description){
            formEntry.description = foundAppForm.description;
          }


          //If getting all the forms, need to submit statistics... TODO currently dummy data.
          if(options.getAllForms === true && ! options.notStats){
            formEntry.appsUsingForm = formStatistics[foundAppForm._id].appsUsingForm;
            formEntry.submissionsToday = formStatistics[foundAppForm._id].submissionsToday;
            formEntry.submissionsTotal = formStatistics[foundAppForm._id].submissionsTotal;
          }

          res.forms.push(formEntry);

          return cb();
        }, function(err){
          resJSON = res;
          return cb(err);
        });
      } else {
        resJSON = res;
        return cb();
      }
    }
  }

  return {
    getForms: getForms,
    findForms: findForms
  };
};
