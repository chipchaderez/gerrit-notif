var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var groups = require('./groups.js');
var async = require('async');

module.exports = function (connections, options, cb) {
  async.series([
    async.apply(validateParams, options),
    async.apply(groups.validateThemeAllowedForUser, connections, options.restrictToUser, options._id),
    async.apply(validateThemeNotInUseByApps),
    deleteTheme
  ], cb);

  function validateParams(options, cb) {
    var val = validate(options);
    val.has('_id', function (failed){
      if (failed) {
        return cb(new Error("Invalid parameters. No theme Id specified. "));
      } else {
        return cb(undefined);
      }
    });
  }

  //Themes associated with app should not be deleted.
  function validateThemeNotInUseByApps(cb){
    var appThemeModel = models.get(connections.mongooseConnection, models.MODELNAMES.APP_THEMES);

    appThemeModel.count({"theme" : options._id}, function(err, countAppsUsingTheme){
      if(err) return cb(err);

      if(countAppsUsingTheme > 0){
        return cb(new Error("Cannot delete theme in use by apps. Apps Using this theme" + countAppsUsingTheme));
      }

      return cb();
    });
  }

  function deleteTheme(cb){
    var themeModel = models.get(connections.mongooseConnection, models.MODELNAMES.THEME);

    var themeId = options._id;
    themeModel.findById(themeId).remove().exec(function(err, theme){
      if(err) return cb(err);

      if(theme !== null){
        groups.removeThemeFromAllGroups(connections, themeId, function () {
          return cb(undefined, JSON.stringify(theme));
        });
      } else {
        return cb(new Error("No theme matches appId " + options.appId));
      }
    });
  }
};
