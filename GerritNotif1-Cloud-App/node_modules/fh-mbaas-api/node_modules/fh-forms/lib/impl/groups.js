var async = require('async');
var _ = require('underscore');
var util = require('util');
var models = require('../common/models.js')();
var validation = require('./../common/validate');

exports.getAllGroups = getAllGroups;
exports.getGroup = getGroup;
exports.updateGroup = updateGroup;
exports.createGroup = createGroup;
exports.deleteGroup = deleteGroup;

exports.getFormsForUser = getFormsForUser;
exports.getAppsForUser = getAppsForUser;
exports.getThemesForUser = getThemesForUser;

exports.validateAppAllowedForUser = validateAppAllowedForUser;
exports.validateFormAllowedForUser = validateFormAllowedForUser;
exports.validateThemeAllowedForUser = validateThemeAllowedForUser;

exports.removeFormFromAllGroups = removeFormFromAllGroups;
exports.removeThemeFromAllGroups = removeThemeFromAllGroups;
exports.removeAppFromAllGroups = removeAppFromAllGroups;
exports.removeUserFromAllGroups = removeUserFromAllGroups;

exports.addThemeToUsersGroups = addThemeToUsersGroups;
exports.addAppToUsersGroups = addAppToUsersGroups;
exports.addFormToUsersGroups = addFormToUsersGroups;

var GROUP_MODEL_NAME_FIELD = "name";
var GROUP_MODEL_FORMS_FIELD = "forms";
var GROUP_MODEL_USERS_FIELD = "users";
var GROUP_MODEL_APPS_FIELD = "apps";
var GROUP_MODEL_THEMES_FIELD = "themes";
var GROUP_MODEL_DATA_FIELDS = [GROUP_MODEL_FORMS_FIELD, GROUP_MODEL_USERS_FIELD, GROUP_MODEL_APPS_FIELD, GROUP_MODEL_THEMES_FIELD];

function getFormsForUser(connections, userToRestrictTo, cb) {
  return getDataForUser(connections, GROUP_MODEL_FORMS_FIELD, userToRestrictTo, cb);
}

function getAppsForUser(connections, userToRestrictTo, cb) {
  return getDataForUser(connections, GROUP_MODEL_APPS_FIELD, userToRestrictTo, cb);
}

function getThemesForUser(connections, userToRestrictTo, cb) {
  return getDataForUser(connections, GROUP_MODEL_THEMES_FIELD, userToRestrictTo, cb);
}

function getDataForUser(connections, data, userToRestrictTo, cb) {
  if(!userToRestrictTo) {
    return cb(undefined, null);   // return no restrictions
  }

  var conn = connections.mongooseConnection;
  var groupsModel = models.get(conn, models.MODELNAMES.GROUPS);
  var query = {users: userToRestrictTo};
  groupsModel.find(query).select(data).exec(function (err, dataList) {
    if (err) return cb(err);
    // we'll have an array of {_id:XXX, data: [] } at this point
    async.map(dataList, function (item, cb) {
      return cb(undefined, item[data]);    // extract the data array (data is one of: users, apps, themes, forms)
    }, function (err, results) {
      if (err) return cb(err);
      var forms = _.flatten(results);      // flatten it.
      async.map(forms, function(form, cb) {
        return cb(undefined, form.toString());
      }, function (err, stringifiedFormIds) {
        if (err) return cb(err);
        return cb(null, _.uniq(stringifiedFormIds));
      });
    });
  });
}

function addThemeToUsersGroups(connections, restrictToUser, themeId, cb) {
  return addDataToUsersGroups(connections, GROUP_MODEL_THEMES_FIELD, restrictToUser, themeId, cb);
}

function addAppToUsersGroups(connections, restrictToUser, appId, cb) {
  return addDataToUsersGroups(connections, GROUP_MODEL_APPS_FIELD, restrictToUser, appId, cb);
}

function addFormToUsersGroups(connections, restrictToUser, formId, cb) {
  return addDataToUsersGroups(connections, GROUP_MODEL_FORMS_FIELD, restrictToUser, formId, cb);
}

function addDataToUsersGroups(connections, data, restrictToUser, valueToAdd, cb) {
  if(!restrictToUser) {
    return cb();   // just return - no user specified
  }
  if(! valueToAdd) return cb("no value specified to add to the users group");

  var conn = connections.mongooseConnection;
  var groupsModel = models.get(conn, models.MODELNAMES.GROUPS);
  var query = {users: restrictToUser};
  var push = {};
  push[data] = valueToAdd;
  groupsModel.update(query, {$push: push}, {multi: true}, function(err, numAffected) {
    if (err) return cb(err);
    return cb(undefined, numAffected);
  });
}

function validateAppAllowedForUser(connections, restrictToUser, appId, cb) {
  return validateDataAllowedForUser(connections, GROUP_MODEL_APPS_FIELD, restrictToUser, appId, cb);
}

function validateFormAllowedForUser(connections, restrictToUser, formId, cb) {
  return validateDataAllowedForUser(connections, GROUP_MODEL_FORMS_FIELD, restrictToUser, formId, cb);
}

function validateThemeAllowedForUser(connections, restrictToUser, themeId, cb) {
  return validateDataAllowedForUser(connections, GROUP_MODEL_THEMES_FIELD, restrictToUser, themeId, cb);
}

function validateDataAllowedForUser(connections, data, restrictToUser, valueToCheck, cb) {
  if(!restrictToUser) {
    return cb();   // return valid - no restrictions
  }

  var conn = connections.mongooseConnection;
  var groupsModel = models.get(conn, models.MODELNAMES.GROUPS);
  var query = {users: restrictToUser};
  query[data] = valueToCheck;
  groupsModel.find(query).select(GROUP_MODEL_NAME_FIELD).exec(function (err, dataList) {
    if (err) return cb(err);
    // we'll have an array of {_id:XXX, name: "AAAA" } at this point if valid
    if (dataList && dataList.length > 0) {
      return cb(); // return valid - found user and valueToCheck in a group
    } else {
      return cb(new Error("No access to " + data + ": " + valueToCheck + ", for user: " + restrictToUser + ", not allowed due to group permissions"));
    }
  });
}

/*
 * getAllGroups(connections, options, cb)
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
 *    cb  - callback function (err)
 *
 */

function getAllGroups(connections, options, cb) {
  var conn = connections.mongooseConnection;
  var groupsModel = models.get(conn, models.MODELNAMES.GROUPS);
  groupsModel.find().exec(function (err, groupsList) {
    if (err) return cb(err);
    return cb(null, groupsList || []); // Note: purposely returning empty array here for now, maybe this should be null instead?
  });
}

function removeFormFromAllGroups(connections, formId, cb) {
  return removeDataEntityFromAllGroups(connections, GROUP_MODEL_FORMS_FIELD, formId, cb);
}

function removeThemeFromAllGroups(connections, themeId, cb) {
  return removeDataEntityFromAllGroups(connections, GROUP_MODEL_THEMES_FIELD, themeId, cb);
}

function removeAppFromAllGroups(connections, appId, cb) {
  return removeDataEntityFromAllGroups(connections, GROUP_MODEL_APPS_FIELD, appId, cb);
}

function removeUserFromAllGroups(connections, userId, cb) {
  return removeDataEntityFromAllGroups(connections, GROUP_MODEL_USERS_FIELD, userId, cb);
}

function contains(ary, item) {
  return (ary.indexOf(item) >= 0);
}

function validString(dataValue) {
  var ret = false;
  var str = dataValue.toString();
  if(("string" === typeof str) && (str.length > 0)) {
    ret = true;
  }
  return ret;
}

/*
 * removeDataEntityFromAllGroups(connections, options, cb)
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
 *    cb  - callback function (err, groupList)  groupList : groups removed from
 *
 */
function removeDataEntityFromAllGroups(connections, dataField, dataValue, cb) {
  if(!contains(GROUP_MODEL_DATA_FIELDS, dataField)) {
    return cb(new Error('Invalid group field specified: ' + util.inspect(dataField)));
  } else if (!validString(dataValue)) {
    return cb(new Error('Invalid value specified for field: ' + util.inspect(dataValue)));
  }

  var conn = connections.mongooseConnection;
  var groupsModel = models.get(conn, models.MODELNAMES.GROUPS);
  var query = {};
  query[dataField] = dataValue;
  groupsModel.find(query).exec(function (err, groupsList) {
    if (err) return cb(err);
    var groupsToUpdate = groupsList || [];
    var groupsUpdated = [];
    async.each(groupsToUpdate, function (group, cb) {
      var where = group[dataField].indexOf(dataValue);
      if(where < 0) {
        return cb(new Error('value (already found) missing from groups field: ' + util.inspect(group[dataField])));
      }
      group[dataField].splice(where, 1);
      group.markModified(dataField);
      groupsUpdated.push({_id: group._id.toString(), name: group.name});
      group.save(cb);
    }, function (err) {
      if (err) return cb(err);
      return cb(null, groupsUpdated);
    });
  });
}

/*
 * updateGroup(connections, options, group, cb)
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
 *    group: {
 *      _id: id of the group
 *      name: string
 *      users: ['userid1', 'userid2', ...]
 *      forms: ['formid1', 'formid2', ...]
 *      apps: ['appid1', 'appid2', ...]
 *      themes: ['themeid1', 'themeid2', ...]
 *    }
 *
 *    cb  - callback function (err)
 *
 */
function updateGroup(connections, options, groupParams, cb) {
  var validate = validation(groupParams);
  function validateParams(cb) {
    validate.has("_id", GROUP_MODEL_NAME_FIELD, GROUP_MODEL_USERS_FIELD, GROUP_MODEL_FORMS_FIELD, GROUP_MODEL_APPS_FIELD, GROUP_MODEL_THEMES_FIELD, cb);
  }
  validateParams(function(err) {
    if (err) return cb(err);
    var conn = connections.mongooseConnection;
    var groupsModel = models.get(conn, models.MODELNAMES.GROUPS);

    groupsModel.findOne({_id:groupParams._id}).exec(function (err, group) {
      if (err) return cb(err);
      if (!group) {
        return cb(new Error('group not found'));
      } else {
        group.name = groupParams.name;
        group.users = groupParams.users;
        group.forms = groupParams.forms;
        group.apps = groupParams.apps;
        group.themes = groupParams.themes;
        group.save(function (err, group) {
          if (err) return cb(err);
          return cb(undefined, group.toJSON());
        });
      }
    });
  });
}

/*
 * createGroup(connections, options, group, cb)
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
 *    group: {
 *      name: string
 *      users: ['userid1', 'userid2', ...]
 *      forms: ['formid1', 'formid2', ...]
 *      apps: ['appid1', 'appid2', ...]
 *      themes: ['themeid1', 'themeid2', ...]
 *    }
 *
 *    cb  - callback function (err)
 *
 */
function createGroup(connections, options, groupParams, cb) {
  var validate = validation(groupParams);
  function validateParams(cb) {
    validate.has(GROUP_MODEL_NAME_FIELD, GROUP_MODEL_USERS_FIELD, GROUP_MODEL_FORMS_FIELD, GROUP_MODEL_APPS_FIELD, GROUP_MODEL_THEMES_FIELD, function (err) {
      if (err) return cb(err);
      validate.hasno("_id", cb);
    });
  }
  validateParams(function(err) {
    if (err) return cb(err);
    var conn = connections.mongooseConnection;
    var groupsModel = models.get(conn, models.MODELNAMES.GROUPS);
    var newGroup = new groupsModel(groupParams);
    newGroup.save(function (err, group) {
      if (err) return cb(err);
      return cb(undefined, group.toJSON());
    });
  });
}

/*
 * getGroup(connections, options, groupParams, cb)
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
 *    groupParams: {
 *      _id: id of the group
 *    }
 *
 *    cb  - callback function (err)
 *
 */
function getGroup(connections, options, groupParams, cb) {
  var validate = validation(groupParams);
  function validateParams(cb) {
    validate.has("_id", cb);
  }
  validateParams(function(err) {
    if (err) return cb(err);
    var conn = connections.mongooseConnection;
    var groupsModel = models.get(conn, models.MODELNAMES.GROUPS);
    groupsModel.findById(groupParams._id, cb);
  });
}

/*
 * deleteGroup(connections, options, group, cb)
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
 *    group: {
 *      _id: id of the group
 *    }
 *
 *    cb  - callback function (err)
 *
 */
function deleteGroup(connections, options, groupParams, cb) {
  var validate = validation(groupParams);
  function validateParams(cb) {
    validate.has("_id", cb);
  }
  validateParams(function(err) {
    if (err) return cb(err);
    var conn = connections.mongooseConnection;
    var groupsModel = models.get(conn, models.MODELNAMES.GROUPS);
    groupsModel.findById(groupParams._id).remove(cb);
  });
}
