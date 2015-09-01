var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var async = require('async');
var _ = require('underscore');
var groups = require('./groups.js');
var logger = require('../common/logger.js').getLogger();
var misc = require('../common/misc.js');


/**
 *
 * @param connections
 * @param options
 * @param cb
 * @description
 * get a populated list if forms based on an array of formids. Validates the user has access to the forms via groups api
 */


module.exports = function getPopulatedFormsList(connections,options, cb){

  logger.debug("getPopulatedFormsList");

  var Form = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);
  var Field = models.get(connections.mongooseConnection, models.MODELNAMES.FIELD);

  async.waterfall([
    function validateParams(callback){
      logger.debug( "validateParams");
      var val = validate(options);
      val.has("formids",function (failed){
        if(failed){
          logger.debug("validateParams failed ", failed);
          return callback(failed);
        }
        else{
          return callback(undefined,options.formids);
        }
      });
    },
    function checkAccess(formids, callback){
      logger.debug("checkAccess started ");
        if(! formids || !_.isArray(formids)){
          logger.debug("checkAccess failed formids not array");
          return callback(new Error("formids must be an array"));
        }
        async.waterfall([
          function getFormsForUser (callback){
            groups.getFormsForUser(connections, options.restrictToUser, function (err, allowedForms) {
              logger.debug("checkAccess allowed forms");
              logger.debug("checkAccess allowed formids " ,formids);
              if(err) return callback(err);
              else if(null === allowedForms){
                return callback(undefined, formids);
              }
              else {
                async.each(formids,function (id, cb){
                   if(allowedForms.indexOf(id) !== -1){
                     cb();
                   }else{
                     cb("access to form " + id + " not allowed");
                   }
                },callback);
              }
            });
          }],function (err){
          logger.debug( "checkAccess finished ");
            callback(err, formids);
          })
    },
    function populateForms(formIds, callback){
      var query =   {"_id":{ $in: formIds}};
      Form.find(query).populate("pages", "-__v").populate("pageRules", "-__v").populate("fieldRules", "-__v").select("-__v").exec(function (err, formResults){
        if(err) return callback(err);
        Form.populate(formResults, {"path": "pages.fields", "model": Field, "select": "-__v"}, function(err){
          if(err) return callback(err);

          async.map(formResults, function(fullyPopulatedForm, formCb){
            misc.pruneAdminFields(options, fullyPopulatedForm, function(prunedForm){
              formCb(null, prunedForm);
            });
          }, function(err, prunedForms){
            callback(undefined, prunedForms);
          });
        });
      });
    }],
    function returnResult(err, forms){
      if(err) return cb(err);
      else{
        var returnJson = {"forms":[]};
        async.each(forms, function (f,c){
          returnJson.forms.push(f.toJSON());
          c();
        },function done(){
          cb(undefined, returnJson);
        });
      }
    });
};
