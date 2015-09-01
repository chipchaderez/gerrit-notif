var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var misc = require('../common/misc.js');
var async = require('async');
var groups = require('./groups.js');

var getForm = function(connections, options, cb) {
  async.waterfall([validateParams, getFormUsingId, constructResultJSON], function(err, resultJSON){
    return cb(err, resultJSON);
  });

  function validateParams(cb){
    var paramsValidator = validate(options);

    if(!options.getAllForms){
      paramsValidator.has("_id", function(failure){
        if(failure){
          return cb(new Error("Invalid params to getForm. FormId Not specified"));
        } else {
          return cb(undefined, options._id.toString());
        }
      });
    } else {
      return cb(undefined, null);
    }
  }

  function getFormUsingId(formId, cb){
    var Form = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);
    var Field = models.get(connections.mongooseConnection, models.MODELNAMES.FIELD);
    var query = {};

    groups.getFormsForUser(connections, options.restrictToUser, function (err, allowedForms) {
      if (err) return cb(err);

      if (!options.getAllForms) {      // single form requested
        query = {"_id": formId};
        if (allowedForms) {            // if this user is restricted
          if (allowedForms.indexOf(formId) < 0) {   // check if requested if in allowed list
            return cb(new Error("Not allowed access to that form: " + formId));
          }
        }
      } else {
        if (options.getAllForms && allowedForms) {
          query._id = { $in: allowedForms};
        } else {
          query = {};
        }
      }

      Form.find(query).populate("pages", "-__v").populate("pageRules", "-__v").populate("fieldRules", "-__v").select("-__v").exec(function(err, formResults){
        if(err) return cb(err);


        if((formResults === null || formResults === undefined) && (!options.getAllForms)){
          return cb(new Error("No form exists matching id " + options._id));
        }

        //Now have a form with all pages, pageRules and fieldRules populated
        Form.populate(formResults, {"path": "pages.fields", "model": Field, "select": "-__v"}, function(err, updatedForms){
          if(err) return cb(err);

          cb(undefined, updatedForms);
        });
      });
    });
  }

  function constructResultJSON(populatedForms, cb){
    var resultJSON;

    if(!options.getAllForms){
      if (populatedForms.length === 0) return cb(null, null);
      if(populatedForms.length !== 1){
        return cb(new Error("Invalid number of forms returned " + populatedForms.length));
      }
    } else {
      resultJSON = {"forms" : []};
    }

    async.eachSeries(populatedForms, function(formToReturn, cb){
      var fullyPopulatedForm = formToReturn.toJSON();

      /**
       * If not showing admin fields, prune them out.
       */
      misc.pruneAdminFields(options, fullyPopulatedForm, function(prunedForm){
        fullyPopulatedForm = prunedForm;

        if(options.export){
          delete fullyPopulatedForm._id;
          for(var it=0; it < fullyPopulatedForm.pages.length; it++){
            delete fullyPopulatedForm.pages[it]._id;
            for(var fi=0; fi < fullyPopulatedForm.pages[it].fields.length; fi++){
              delete fullyPopulatedForm.pages[it].fields[fi]._id;
            }
          }
        }else{
          //Generating a handy page ref to use for getting page numbers.
          var genratedRefs = misc.generatePageAndFieldRefs(fullyPopulatedForm);
          var pageRef = genratedRefs.pageRef;
          var fieldRef = genratedRefs.fieldRef;
          fullyPopulatedForm.pageRef = pageRef;
          fullyPopulatedForm.fieldRef = fieldRef;
          fullyPopulatedForm.lastUpdatedTimestamp = fullyPopulatedForm.lastUpdated.getTime();
        }


        if(!options.getAllForms){
          resultJSON = fullyPopulatedForm;
        } else {
          resultJSON.forms.push(fullyPopulatedForm);
        }

        return cb();
      });
    }, function (err) {
      if (err) return cb(err);
      return cb(undefined, resultJSON);
    });
  }

};

module.exports = getForm;
