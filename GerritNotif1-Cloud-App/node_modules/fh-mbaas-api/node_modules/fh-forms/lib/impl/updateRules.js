var async = require('async');
var models = require('../common/models.js')();
var validation = require('./../common/validate');
var groups = require('./groups.js');

var Rules = {
  FIELD_RULE: 'fieldRules',
  PAGE_RULE: 'pageRules'
};

exports.updateFieldRules = updateFieldRules;
exports.updatePageRules = updatePageRules;

/*
 * updateFieldRules(connections, options, formData, cb)
 *
 *    connections: {
 *       mongooseConnection: ...
 *    }
 *
 *    options: {
 *       uri:       db connection string,
 *       userEmail: user email address string
 *    }
 *
 *    fieldRules: {
 *      formId: id of parent form
 *      rules: fieldrules
 *    }
 *
 *    cb  - callback function (err)
 *
 */

function updateFieldRules(connections, options, fieldRules, cb) {
  var validate = validation(fieldRules);
  function validateParams(cb) {
    validate.has("formId","rules",cb);
  }
  validateParams(function(err) {
    if (err) return cb(err);
    groups.validateFormAllowedForUser(connections, options.restrictToUser, options.formId, function (err) {
      if (err) return cb(err);

      var conn = connections.mongooseConnection;
      var formModel = models.get(conn, models.MODELNAMES.FORM);
      var fieldRulesModel = models.get(conn, models.MODELNAMES.FIELD_RULE);
      doRulesUpdate(connections, options, fieldRules, formModel, fieldRulesModel, Rules.FIELD_RULE, cb);
    });
  });
}

/*
 * updatePageRules(connections, options, formData, cb)
 *
 *    connections: {
 *       mongooseConnection: ...
 *    }
 *
 *    options: {
 *       uri:       db connection string,
 *       userEmail: user email address string
 *    }
 *
 *    pageRules: {
 *      formId: id of parent form
 *      rules: pagerules
 *    }
 *
 *    cb  - callback function (err)
 *
 */

function updatePageRules(connections, options, pageRules, cb) {
  var validate = validation(pageRules);
  function validateParams(cb) {
    validate.has("formId","rules",cb);
  }
  validateParams(function(err) {
    if (err) return cb(err);
    groups.validateFormAllowedForUser(connections, options.restrictToUser, options.formId, function (err) {
      if (err) return cb(err);
      var conn = connections.mongooseConnection;
      var formModel = models.get(conn, models.MODELNAMES.FORM);
      var pageRulesModel = models.get(conn, models.MODELNAMES.PAGE_RULE);
      doRulesUpdate(connections, options, pageRules, formModel, pageRulesModel, Rules.PAGE_RULE, cb);
    });
  });
}

function doRulesUpdate(connections, options, rules, formModel, rulesModel, ruleType, cb){
  var form;

  // iterate through the form field rules vs the new rules
  function createRules(rules, cb) {
    function addRule(fieldRule, addRuleCallback) {
      if (fieldRule._id) return addRuleCallback();
      var fr = new rulesModel(fieldRule);
      fr.save(function(err, frdoc) {
        if(err) return addRuleCallback(err);
        form[ruleType].push(frdoc);
        return addRuleCallback(null, frdoc);
      });
    }

    async.mapSeries(rules, addRule, cb);
  }

  // process any updates
  function updateRules(rules, cb) {
    function updateRule(fieldRule, cb1) {
      if (!fieldRule._id) return cb1();

      var id = fieldRule._id;
      var fr = JSON.parse(JSON.stringify(fieldRule));
      delete fr._id;

      rulesModel.findOne({_id: id}, function(err, ruleToUpdate){
        if(err) return cb1(err);

        if(ruleToUpdate === null){
          return cb1(new Error("No " + ruleType + " rule matches id " + id));
        }

        for(var saveKey in fr){
          ruleToUpdate[saveKey] = fr[saveKey];
        }

        ruleToUpdate.save(cb1);
      });
    }

    async.mapSeries(rules, updateRule, cb);
  }

  // process any deletes
  function deleteRules(rules, cb) {
    var idsToRemove = [];
    form[ruleType].forEach(function(frId) {
      var found = false;
      for (var i=0; i<rules.length; i++) {
        var r = rules[i];
        if (r._id && frId.equals(r._id)) {
          found = true;
          break;
        }
      }
      if (found === false) {
        idsToRemove.push(frId);
      }
    });

    function deleteRule(fieldRuleId, cb1) {
      rulesModel.findByIdAndRemove(fieldRuleId, cb1);
    }
    async.mapSeries(idsToRemove, deleteRule, cb);
  }

  function doUpdate(rules, cb) {
    async.series([
      function(cb1) {
        deleteRules(rules.rules, cb1)
      },
      function(cb1) {
        createRules(rules.rules, cb1)
      },
      function(cb1) {
        updateRules(rules.rules, cb1)
      }
    ],function (err){
        form.updatedBy = options.userEmail;
        form.lastUpdated = new Date();
        return cb(err);
      });
  }

  formModel.findById(rules.formId).exec(function (err, doc) {
    if (err) return cb(err);
    form = doc;

    async.series([
      function (cb1) {
        doUpdate(rules, cb1);
      }
    ], function (err) {
         if (err) return cb(err);
         form.save(function(err){
           if (err) return cb(err);

           // return the doc fieldrules
           formModel.findById(rules.formId).populate(ruleType).exec(function (err, doc) {
             if (err) return cb(err);
             return cb(null, doc[ruleType]);
           });
         });
       });
  });
}
