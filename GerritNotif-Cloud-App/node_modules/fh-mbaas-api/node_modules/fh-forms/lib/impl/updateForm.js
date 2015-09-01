var async = require('async');
var models = require('../common/models.js')();
var validation = require('./../common/validate');
var _ = require('underscore');
var groups = require('./groups.js');

/*
 * updateForm(connections, options, formData, cb)
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
 *    formData: {
 *       name: name of form string
 *       description: description of form string
 *    }
 *
 *    cb  - callback function (err, newDataDocument)
 *
 */
module.exports = function updateForm(connections, options, formData, cb) {
  formData = formData || {};
  formData.ruleDeletionFlags = formData.ruleDeletionFlags || {};
  var validate = validation(formData);
  var conn = connections.mongooseConnection;
  var formModel = models.get(conn, models.MODELNAMES.FORM);
  var pageModel = models.get(conn, models.MODELNAMES.PAGE);
  var fieldModel = models.get(conn, models.MODELNAMES.FIELD);
  var fieldRuleModel = models.get(conn, models.MODELNAMES.FIELD_RULE);
  var pageRuleModel = models.get(conn, models.MODELNAMES.PAGE_RULE);
  var form;

  function validateParams(cb) {
    //Validating basic parameters.
    validate.has("name","description",function(err){
      if(err){
        return cb(err);
      }

      //Validating field codes -- not async.
      var fieldCodeError = validatefieldCodes();

      if(fieldCodeError){
        return cb(fieldCodeError);
      }

      validateDuplicateName(cb);
    });
  }

  /**
   * User Field codes must be unique within a form.
   *
   * All field codes must have a length > 0, otherwise don't save the form.
   *
   * No asynchronous functionality in this function.
   * @param cb
   */
  function validatefieldCodes(){
    //Flag for finding a duplicate field code
    var duplicateFieldCode = false;
    var invalidFieldCode = false;
    var fieldCodes = {};

    formData.pages = _.map(formData.pages, function(page){
      page.fields = _.map(page.fields, function(field){
        var fieldCode = field.fieldCode;

        //If not set, then just return the field.
        if(fieldCode === null || typeof(fieldCode) === "undefined"){
          return field;
        }

        //Checking for duplicate field code. It must be a string.
        if(typeof(fieldCode) === "string"){
          //If the length of the code is 0, then don't save it.
          if(fieldCode.length === 0){
            delete field.fieldCode;
          } else {
            //Checking for duplicate field code
           if(fieldCodes[fieldCode]){
             duplicateFieldCode = true;  //Flagging the field as duplicate
           } else {
             fieldCodes[fieldCode] = true;
           }
          }
        } else {
          invalidFieldCode = true; //Field codes must be a string.
        }

        return field;
      });

      return page;
    });

    if(duplicateFieldCode){
      return new Error("Duplicate Field Codes Detected. Field Codes Must Be Unique In A Form.");
    }

    if(invalidFieldCode){
      return new Error("Invalid Field Code. Field Codes Must Be A String.");
    }

    //All valid. can proceed to saving the form.
    return undefined;
  }

  /**
   * Validating form duplicate names.
   */
  function validateDuplicateName(cb){
    var formId = formData._id;
    var formName = formData.name;

    if(!formName){
      return cb(new Error("No form name passed"));
    }

    var query = {};

    //If there is a form id, then the query to the form model must exclude the current form id that is being updated.
    if(formId){
      query.name = formName;
      //Excluding the formId that is being updated.
      query["_id"] = {"$nin": [formId]};
    } else { //Just checking that the form name exists as a form is being created
      query.name = formName;
    }

    formModel.count(query, function(err, count){
      if(err){
        return cb(err);
      }

      //If the number of found forms is > 0, then there is another form with the same name. Do not save the form.
      if(count > 0){
        return cb(new Error("Form with name " + formName + " already exists found."));
      } else {//No duplicates, can proceed with saving the form.
        return cb();
      }
    });
  }

  function updateField(fieldToUpdate, cb) {
    var fieldToUpdateClone = JSON.parse(JSON.stringify(fieldToUpdate));
    var idToUpdate = fieldToUpdateClone._id;
    delete fieldToUpdateClone._id; // remove the _id field so we can update


    fieldModel.findOne({_id: idToUpdate}, function(err, foundField){
      if(err) return cb(err);

      if(foundField === null){
        return cb(new Error("No Field Matches id " + idToUpdate));
      }

      for(var key in fieldToUpdateClone){
        foundField[key] = fieldToUpdateClone[key];
      }


      foundField.save(function(err){
        if(err) return cb(err);

        return cb(err, idToUpdate);
      });
    });
  }

  function createField(fieldToCreate, cb) {
    var field = new fieldModel(fieldToCreate);
    field.save(function(err, doc) {
      if(err) return cb(err);
      return cb(undefined, doc._id);
    });
  }

  function updateOrCreateField(fieldToUpdateOrCreate, cb) {
    if(fieldToUpdateOrCreate._id) {
      updateField(fieldToUpdateOrCreate, cb);
    } else {
      createField(fieldToUpdateOrCreate, cb);
    }
  }

  function updateCreateFields(fields, cb) {
    var inFields = fields || [];
    var fieldsToAdd = [];
    async.eachSeries(inFields, function (fieldToUpdateOrCreate, cb) {
      updateOrCreateField(fieldToUpdateOrCreate, function (err, id) {
        if(err) return cb(err);
        fieldsToAdd.push(id);
        return cb();
      });
    }, function(err) {
      return cb(err, fieldsToAdd);
    });
  }

  function doCreatePage(trackPageIds, pageToCreate, cb) {
    var pageModel = models.get(conn, models.MODELNAMES.PAGE);
    async.waterfall([
      function(cb) {
        var err;
        if(pageToCreate._id) {
          err = {"code": 400, "message": "New page should not have _id field"};
        }
        return cb(err, pageToCreate.fields);
      },
      updateCreateFields,
      function(fieldsToAdd, cb) {
        var cloneOfPage = JSON.parse(JSON.stringify(pageToCreate));
        cloneOfPage.fields = fieldsToAdd;
        var page = new pageModel(cloneOfPage);
        page.save(function(err, doc) {
          if(err) return cb(err);
          trackPageIds.push(doc._id); 
          return cb();
        });
      }
    ], function (err) {
      return cb(err);
    });
  }

  function doCreate(formData, cb) {
    var pageIds = [];
    var pages = formData.pages || [];
    async.eachSeries(
      pages,
      async.apply(doCreatePage, pageIds),
      function(err){
        if(err) return cb(err);
        form = new formModel({
          "updatedBy": options.userEmail,
          "name": formData.name,
          "createdBy":options.userEmail,
          "createdOn": new Date(),
          "description": formData.description,
          "pages": pageIds,
          "subscribers": formData.subscribers
        });
        return cb(undefined, form);
      }
    );
  }

  //sorts the forms pagess into updates, deletes and creations
  function sortPages(form, postedPages, cb){
    var dbPageIds = form.pages || [];
    var idSorted = [];
    var toAdd = [];
    var toDelete = [];

    async.parallel([
      function mapDBIds (callback){
        async.map(dbPageIds, function (it,cb){
             cb(undefined, it.toString());
        }, callback);
      },
      function mapPostedIds (callback){
        async.map(postedPages,function (f,c){
          var theId = f._id;
          if(theId){
            var strValue = theId.toString();
            idSorted[theId] = f;
            delete idSorted[theId]._id; // remove the _id field so we can update later
            c(undefined, strValue);
          }
          else{
            toAdd.push(f);
            c();
          }
        },callback);
      }
    ], function done(err, oks){
      if(err){
        cb(err);
      }else{
        var inDB = oks[0];
        async.filter(oks[1], function(item, cb) {
          return cb(!!item);
        }, function(toUpdate) {
          toDelete = _.difference(inDB,toUpdate);
          cb(undefined, form, toDelete, toAdd, toUpdate, idSorted);
        });
      }
    });
  }

  function deletePages(form, toDelete, toAdd, toUpdate, idSorted, cb){
    async.each(toDelete, function deletePage (delId, callback){
     pageModel.findByIdAndRemove(delId,function (err){
       if(err){
         callback(err);
       }else{
         var index = form.pages.indexOf(delId);
         if(-1 !== index){
           form.pages.splice(index,1);
           callback();
         }
       }
     });
    }, function (err) {
      return cb(err, form, toAdd, toUpdate, idSorted);
    });
  }

  function createPages(form, toAdd, toUpdate, idSorted, cb){
    async.eachSeries(toAdd, function createPage (item, callback){
      var localItem = JSON.parse(JSON.stringify(item));
      updateCreateFields(localItem.fields, function (err, fieldIds) {
        if(err) return callback(err);
        localItem.fields = fieldIds; // replace field objects with field ids
        var f = new pageModel(localItem);
        f.save(function (err, ok){
          if(err) callback(err);
          else{
            form.pages.push(ok._id);
            callback();
          }
        });
      });
    }, function (err) {
      return cb(err, form, toUpdate, idSorted);
    });
  }

  function updatePages(form, toUpdate, idSorted, cb) {
    async.each(toUpdate, function updatePage (item, callback){
      var localItem = JSON.parse(JSON.stringify(idSorted[item]));
      updateCreateFields(localItem.fields, function (err, fieldIds) {
        if(err) return callback(err);
        localItem.fields = fieldIds; // replace field objects with field ids

        pageModel.findOne({_id: item}, function(err, foundPage){
          if(err) return cb(err);

          if(foundPage === null){
            return cb(new Error("No page matches id " + item));
          }

          for(var key in localItem){
            foundPage[key] = localItem[key];
          }

          foundPage.save(callback);
        });
      });
    }, function (err) {
      return cb(err);
    });  
  }

  /*
   Checking rule targets are still valid -- if not, rule is deleted
   */
  function updateRules(form, cb) {
    //Compiling a list of field and page ids to check for
    var formPages = [];
    var fieldRulesToDelete = [];
    var pageRulesToDelete = [];

    /**
     * Object of invalid fields that is built up by scanning the rules.
     * @type {{
       *   fieldId: true
       * }}
     */
    var invalidFields = {

    };

    /**
     * This form model will be up-to-date with the latest data passed in the request.
     */
    formModel.populate(form, {"path": "pages", "model": pageModel, "select": "-__v -fieldOptions._id"}, function(err){
      if(err){
        return cb(err);
      }

      formModel.populate(form, {"path": "pages.fields", "model": fieldModel, "select": "-__v"}, function(err){
        if(err){
          return cb(err);
        }

        formPages = form.pages;

        async.parallel([
          function(fieldRuleCb){
            async.each(form.fieldRules, async.apply(scanForInvalidFields, models.MODELNAMES.FIELD_RULE), fieldRuleCb);
          },
          function(pageRuleCb){
            async.each(form.pageRules, async.apply(scanForInvalidFields, models.MODELNAMES.PAGE_RULE), pageRuleCb);
          }
        ], function(err){
          if(err){
            return cb(err);
          }

          //Update the form object
          async.series([
            updateFormRules,
            updateOrDeleteRules
          ], cb)
        });
      });

    });

    function scanForInvalidFields(type, rule, callback){
      var targetField = rule.targetPage ? rule.targetPage : rule.targetField;
      /**
       * A field target is not valid if it does not exist in the form or it is an adminOnly field.
       * @param fieldOrPageIdToCheck
       * @param pages
       * @returns {boolean}
       */
      function isFieldStillValidTarget(fieldOrPageIdToCheck, pages, cb){
        var fieldExistsInForm = false;
        var invalidPages = _.filter(pages, function(page){
          var currentPageId = page._id.toString();

          if(currentPageId === fieldOrPageIdToCheck){
            fieldExistsInForm = true;
          }
          var invalidFieldList = _.filter(page.fields, function(field){
            var currentFieldId = field._id.toString();
            if(currentFieldId === fieldOrPageIdToCheck){
              //Current field exists
              fieldExistsInForm = true;

              //Field is admin only, therefore it is an invalid target for a rule.
              if(field.adminOnly){
                return true;
              } else {
                return false;
              }
            } else{
              return false;
            }
          });

          //If the invalidFieldList is > 0, it means that one of the fields was invalid.
          return invalidFieldList.length > 0;
        });

        var invalidField = invalidPages.length > 0;

        //Invalid if either the field is invalid, or it does not exist in the form.
        if(invalidField === true || !fieldExistsInForm){
          return cb(true);
        } else {
          return cb();
        }
      }

      async.each(targetField, function(targetField, cb){
        targetField = targetField.toString();

        //Checking if the field target field is invalid
        isFieldStillValidTarget(targetField, formPages, function(invalidField){
          if(invalidField){
            invalidFields[targetField] = true;
          }
          return cb();
        });
      }, function(){
        async.each(rule.ruleConditionalStatements, function(ruleConStatement, ruleCb){
          var sourceId = ruleConStatement.sourceField;
          sourceId = sourceId.toString();

          isFieldStillValidTarget(sourceId, formPages, function(invalidField){
            if(invalidField){
              invalidFields[sourceId] = true;
            }
            ruleCb();
          });
        }, callback);
      });
    }

    function updateOrDeleteRules(cb){
      //Updating each of the rules to account for any fields removed. Can't just simply delete them.

      async.parallel([
        function updateFieldRulesInDb(cb){
          async.each(form.fieldRules, function(formFieldRule, cb){
            var fieldRuleId = formFieldRule._id.toString();
            fieldRuleModel.findOne({"_id": fieldRuleId}, function(err, fieldRule){
              if(err){
                return cb(err);
              }

              if(fieldRule === null){
                return cb(new Error("No field rule with id " + fieldRuleId + " found."));
              }

              //Update the ruleConditionalStatements and targets of the rule.
              fieldRule.ruleConditionalStatements = formFieldRule.ruleConditionalStatements;
              fieldRule.targetField = formFieldRule.targetField;
              fieldRule.save(cb);
            });
          }, cb);
        },
        function updatePageRulesInDb(cb){
          async.each(form.pageRules, function(formPageRule, cb){
            var pageRuleId = formPageRule._id.toString();
            pageRuleModel.findOne({"_id": pageRuleId}, function(err, pageRule){
              if(err){
                return cb(err);
              }

              if(pageRule === null){
                return cb(new Error("No page rule with id " + pageRuleId + " found."));
              }

              //Update the ruleConditionalStatements and targets of the rule.
              pageRule.ruleConditionalStatements = formPageRule.ruleConditionalStatements;
              pageRule.save(cb);
            });
          }, cb);
        },
        function deleteFieldRules(cb){
          async.eachSeries(fieldRulesToDelete, function(fieldRuleId, cb){
            fieldRuleModel.findOne({"_id": fieldRuleId}, function(err, fieldRule){
              if(err){
                return cb(err);
              }

              if(fieldRule !== null){
                fieldRule.remove(cb);
              } else {
                return cb();
              }
            });
          }, cb);
        },
        function deletePageRules(cb){
          async.eachSeries(pageRulesToDelete, function(pageRuleId, cb){
            pageRuleModel.findOne({"_id": pageRuleId}, function(err, pageRule){
              if(err){
                return cb(err);
              }

              if(pageRule !== null){
                pageRule.remove(cb);
              } else {
                return cb();
              }
            });
          }, cb);
        }
      ], cb);
    }

    //Need to delete any rules that are to be deleted
    function updateFormRules(cb){

      //If a rule contains a field that is flagged for rule deletion, it is added to this list.
      var rulesFlaggedForDeletion = {};

      //Filters out any conditional statements that are no longer valid.
      function filterConditionalStatements(rule){
        return _.filter(rule.ruleConditionalStatements, function(ruleCondStatement){
          var sourceField = ruleCondStatement.sourceField.toString();

          if(invalidFields[sourceField]){
            /**
             * If the user flagged the field in this rule for deletion, flag the rule for deletion.
             */
            if(formData.ruleDeletionFlags[sourceField]){
              rulesFlaggedForDeletion[rule._id] = true;
            }
            return false;
          } else {
            return true;
          }
        });
      }

      var updatedFieldRules = _.map(form.fieldRules, function(fieldRule){
        var filteredConditionalStatements = filterConditionalStatements(fieldRule);
        var filteredTargets = _.filter(fieldRule.targetField, function(targetField){
          if(invalidFields[targetField]){
            return false;
          } else {
            return true;
          }
        });

        fieldRule.ruleConditionalStatements = filteredConditionalStatements;
        fieldRule.targetField = filteredTargets;
        return fieldRule;
      });

      var updatedPageRules = _.map(form.pageRules, function(pageRule){
        var filteredConditionalStatements = filterConditionalStatements(pageRule);

        pageRule.ruleConditionalStatements = filteredConditionalStatements;
        return pageRule;
      });

      fieldRulesToDelete = _.filter(updatedFieldRules, function(fieldRule){
        var targetFields = fieldRule.targetField;
        var conditionalStatements = fieldRule.ruleConditionalStatements;
        var fieldRuleId = fieldRule._id.toString();

        return targetFields.length === 0 || conditionalStatements.length === 0 || rulesFlaggedForDeletion[fieldRuleId];
      });

      pageRulesToDelete = _.filter(updatedPageRules, function(pageRule){
        var conditionalStatements = pageRule.ruleConditionalStatements;
        var pageRuleId = pageRule._id.toString();

        return conditionalStatements.length === 0 || rulesFlaggedForDeletion[pageRuleId];
      });

      fieldRulesToDelete = _.map(fieldRulesToDelete, function(fieldRule){
        return fieldRule._id.toString();
      });

      pageRulesToDelete = _.map(pageRulesToDelete, function(pageRule){
        return pageRule._id.toString();
      });

      //Now have all the rules that need to be deleted, these rules need to be removed from the field and page rules
      updatedFieldRules = _.filter(updatedFieldRules, function(updatedFieldRule){
        return fieldRulesToDelete.indexOf(updatedFieldRule._id.toString()) === -1;
      });


      updatedPageRules = _.filter(updatedPageRules, function(updatedPageRule){
        return pageRulesToDelete.indexOf(updatedPageRule._id.toString()) === -1;
      });

      form.fieldRules = updatedFieldRules;
      form.pageRules = updatedPageRules;

      return cb();
    }
  }

  function doUpdate(formData, cb) {
    formModel.findById(formData._id).populate("fieldRules pageRules").exec(function (err, doc) {
      if (err) return cb(err);


      var postedPages = formData.pages || [];
      //as this is an update and there is no doc to update bail out
      if (!doc) {
        return cb(new Error("A form id was passed but not form was found for that id"));
      }


      //what to do if no form found
      async.waterfall([
        async.apply(sortPages, doc, postedPages),
        deletePages,
        createPages,
        updatePages,
        async.apply(updateRules, doc)
      ], function (err) {
        if (err) cb(err);

        doc.updatedBy = options.userEmail;
        doc.name = formData.name;
        doc.description = formData.description;
        form = doc;
        return cb(err, doc);
      });
    });

  }

  async.series([
    validateParams,
    function (cb) {
      if(formData._id) {
        groups.validateFormAllowedForUser(connections, options.restrictToUser, formData._id, function (err) {
          if (err) return cb(err);
          doUpdate(formData, cb);
        });
      } else {
        doCreate(formData, function (err, form) {
          if (err) return cb(err);
          groups.addFormToUsersGroups(connections, options.restrictToUser, form._id.toString(), function (err) {
            if (err) return cb(err);
            return cb(undefined, form);
          });
        });
      }
    }
  ], function (err) {
    if (err) return cb(err);

    form.lastUpdated = new Date();
    form.markModified("lastUpdated");
    form.save(cb);
  });
};
