var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var async = require('async');

var FIELD_TYPES_INCLUDED_IN_SUMMARY = ["text", "textarea", "number", "emailAddress", "dropdown", "radio", "dateTime"];
var NUM_FIELDS_INCLUDED_IN_SUMMARY = 3;
var REGEX_CHARS = ["\\",".","+","*","?","[","^","]","$","(",")","{","}","=","!","<",">","|",":","-",'"'];   //NOTE it is important the \\ is the first element of the array otherwise you end up with double escapes


exports.submissionSearch = function submissionSearch(connections, options, params, cb) {
  var formSubmissionModel = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
  var fieldModel = models.get(connections.mongooseConnection, models.MODELNAMES.FIELD);
  var formModel = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);

  function validateParams (cb){
    validate(params).has("formId","clauseOperator","queryFields",cb);
  }


  validateParams(function (err){
    if(err) return cb(err);
    exports.queryBuilder(params, function (err, query) {

      function resolveAppName(appId) {
        var name = "Unknown";
        if(appId && params.appMap && params.appMap[appId]) {
          name = params.appMap[appId].name;
        }
        return name;
      }

      function reformatFormIdAndName(submission, cb) {
        submission.formName = submission.formId.name;
        submission.formId = submission.formId._id;
        return cb(undefined, submission);
      }

      formSubmissionModel
        .find(query)
        .sort({submissionStartedTimestamp: -1})
        .populate({"path": "formId", "model": formModel, "select": "name"})
        .populate({"path": "formFields.fieldId", "model": fieldModel, "select": "-__v"})
        .exec(function(err, foundSubmissions){
          if(err) return cb(err);
          var retSubmissions = [];
          async.each(
            foundSubmissions,
            function(item, cb) {
              var submission = JSON.parse(JSON.stringify(item));
              if(err) return cb(err);

              reformatFormIdAndName(submission, function (err, submission) {
                if(err) return cb(err);
                submission.appName = resolveAppName(submission.appId);

                function restrict(submission, rcb) {
                  if (params.wantRestrictions === false) return rcb(null, submission);
                  restrictSubmissionForSummary(submission, rcb);
                }

                restrict(submission, function (err, restrictedSubmission) {
                  if(err) return cb(err);
                  retSubmissions.push(restrictedSubmission);
                  return cb();
                });
              });
            }, function (err) {
              if (err) return cb(err);
              return cb(undefined, {submissions: retSubmissions});
            }
          );
        });

    });
  });
};



/*
 { $and: [
 { formFields: { $elemMatch: {
 fieldId: "527d4539639f521e0a000006",
 fieldValues: { $not: { $regex: ".*dammit.*"}}
 }}},
 { formFields: { $elemMatch: {
 fieldId: "527d4539639f521e0a000007",
 fieldValues: { $gt: "hello"}
 }}},
 { formFields: { $elemMatch: {
 fieldId: "527d4539639f521e0a000006",
 fieldValues: { $not: { $regex: ".*dammit.*"}}
 }}},
 ]}
 */

// http://docs.mongodb.org/manual/reference/operator/query/

//formFields: [{fieldId: "dfkjdsf", fieldValues:["one","two"]}]

// $regex  Selects documents where values match a specified regular expression.
// 
// Name  Description
// $gt Matches values that are greater than the value specified in the query.
// $gte  Matches values that are equal to or greater than the value specified in the query.
// $in Matches any of the values that exist in an array specified in the query.
// $lt Matches values that are less than the value specified in the query.
// $lte  Matches values that are less than or equal to the value specified in the query.
// $ne Matches all values that are not equal to the value specified in the query.
// $nin  Matches values that do not exist in an array specified to the query.
// Logical
// Name  Description
// $or Joins query clauses with a logical OR returns all documents that match the conditions of either clause.
// $and  Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.
// $not  Inverts the effect of a query expression and returns documents that do not match the query expression.
// $nor  

// $regex provides four option flags:
// 
// i toggles case insensitivity, and allows all letters in the pattern to match upper and lower cases.
// m toggles multiline regular expression. Without this option, all regular expression match within one line.
// If there are no newline characters (e.g. \n) or no start/end of line construct, the m option has no effect.
// x toggles an “extended” capability. When set, $regex ignores all white space characters unless escaped or included in a character class.
// Additionally, it ignores characters between an un-escaped # character and the next new line, so that you may include comments in complicated patterns. This only applies to data characters; white space characters may never appear within special character sequences in a pattern.
// The x option does not affect the handling of the VT character (i.e. code 11.)
// New in version 1.9.0.
// 
// s allows the dot (e.g. .) character to match all characters including newline characters.
// $regex only provides the i and m options for the native JavaScript regular expression objects (e.g. /acme.*corp/i). To use x and s you must use the “$regex” operator with the “$options” syntax.
// 
// To combine a regular expression match with other operators, you need to use the “$regex” operator. For example:
// 
// db.collection.find( { field: { $regex: /acme.*corp/i, $nin: [ 'acmeblahcorp' ] } } );
// 


var queryMap = {
  "does not contain": queryBuilderDoesNotContain,
  "contains": queryBuilderContains,
  "is equal to": queryBuilderIsEqualTo,
  "is greater than": queryBuilderIsGreaterThan,
  "is less than": queryBuilderIsLessThan,
  "is at": queryBuilderIsAt,
  "is before": queryBuilderIsBefore,
  "is after": queryBuilderIsAfter,
  "is": queryBuilderIs,
  "is not": queryBuilderIsNot,
  "begins with": queryBuilderBeginsWith,
  "ends with": queryBuilderEndsWith
};

function escapeForRegex(value){
  for(var i=0; i < REGEX_CHARS.length; i++){
    var regexChar = REGEX_CHARS[i];
    if(value && value.indexOf(regexChar) !== -1){
      value = value.replace(new RegExp("\\" + regexChar,"g"),"\\" + regexChar);
    }
  }
  return value;
}

function parseNumberValue(val){
  var testVal = (val - 0);
  if(testVal === val){ //set to == on purpose as the value could be a string
    return parseFloat(val);
  }
  return val;
}

function queryBuilderDoesNotContain(clause) {
  var patt = new RegExp(".*" + escapeForRegex(clause.value) + ".*$");
  return { "$not": patt};
}

function queryBuilderContains(clause) {
  return new RegExp(".*" + escapeForRegex(clause.value) + ".*$");
}

function queryBuilderBeginsWith(clause) {
  return new RegExp("^" + escapeForRegex(clause.value) + ".*$");
}

function queryBuilderEndsWith(clause) {
  return new RegExp(".*" + escapeForRegex(clause.value) + "$");
}

function queryBuilderIsEqualTo(clause) {
  if(clause && clause.metaName && "deviceIPAddress" === clause.metaName){
    return clause.value;
  }
  return parseNumberValue(clause.value); // numbers come in as a string
}

function queryBuilderIsGreaterThan(clause) {
  return  { "$gt": parseNumberValue(clause.value)};                    //numbers come in as as string
}

function queryBuilderIsLessThan(clause) {
  return  { "$lt": parseNumberValue(clause.value)};        //numbers come in as a string
}

function queryBuilderIsAt(clause) {
  return clause.value;        // dates will come in as strings
}

function queryBuilderIsBefore(clause) {
  return { "$lt": clause.value};    // dates will come in as a string
}

function queryBuilderIsAfter(clause) {
  return { "$gt": clause.value}; //dates will come in as a string
}

function queryBuilderIs(clause) {
  return clause.value;
}

function queryBuilderIsNot(clause) {
  return { "$ne": clause.value};
}

function constructValueQuery(clause , cb) {
  if(queryMap[clause.restriction]) {
    var res = queryMap[clause.restriction](clause);
    return cb(undefined, res);
  }else{
    return cb("Unknown Restriction " + clause.restriction);
  }
}

exports.queryBuilder = function buildQuery(params, cb) {
  var query = {};
  query["$and"] = [];
  query["$and"].push({"status": "complete"});
  if (params.appId) {
    query["$and"].push({"appId": params.appId});
  }
  if (params.formId) {
    query["$and"].push({"formId": params.formId});
  }
  if(params.queryMeta && params.queryMeta.clauses) {
    async.eachSeries(params.queryMeta.clauses, function (metaQuery,cb) {
      var add = {};
      constructValueQuery(metaQuery, function (err, valQuery){
        if(err) return cb(err);
        else {
          add[metaQuery.metaName] = valQuery;
          query["$and"].push(add);
          cb();
        }
      });
    });
  }

  var clauses = [];
  async.eachSeries(params.queryFields.clauses, function (clause, cb) {
    var mongoClause = {"formFields": {}};
    constructValueQuery(clause, function (err, fieldVals){
      if(err) return cb(err);
      else{
        var fieldValues = fieldVals;
        mongoClause["formFields"]["$elemMatch"] = {fieldId: clause.fieldId, fieldValues: fieldValues};
        clauses.push(mongoClause);
        return cb();
      }
    });

  }, function (err) {
    if(err) return cb(err);

    var formFieldsSubQuery = {};
    if (params.clauseOperator && params.clauseOperator.toLowerCase() === "and") {
      if(clauses.length > 0) {
        formFieldsSubQuery["$and"] = clauses;
      }
    } else if (params.clauseOperator && params.clauseOperator.toLowerCase() === "or"){
      if(clauses.length > 0) {
        formFieldsSubQuery["$or"] = clauses;
      }
    }else{
      cb("unknown clauseOperator passed");
    }
    query["$and"].push(formFieldsSubQuery);
    return cb(undefined, query);
  });
};




function restrictSubmissionForSummary(submission, cb) {
  var formFields = submission.formFields;
  var restrictedFormFields = [];
  delete submission.formFields;
  submission.formFields = restrictedFormFields;
  async.eachSeries(formFields, function (formField, cb) {
    var finishFlag;
    if(FIELD_TYPES_INCLUDED_IN_SUMMARY.indexOf(formField.fieldId.type) >= 0) {
      restrictedFormFields.push(formField);
      if(restrictedFormFields.length === NUM_FIELDS_INCLUDED_IN_SUMMARY) {
        finishFlag = "limit reached";
      }
    }
    return cb(finishFlag);
  }, function (err) {
    var retErr = err;

    if (retErr && retErr === "limit reached") {
      retErr = undefined;
    }
    if(retErr) return cb(retErr);

    return cb(undefined, submission);
  });
}

exports.escapeForRegex = escapeForRegex;
