var models = require('../common/models.js')();
var async = require('async');
var groups = require('./groups.js');

module.exports = function (connections, options, cb) {
  var restrictToUser = options.restrictToUser;

  async.waterfall([
    async.apply(validateParams, options),
    getThemes,
    getAppsUsingTheme,
    generateReturnJSON
  ], cb);

  function validateParams(options, cb) {
    return cb();
  }

  function getThemes(cb){
    var themeModel = models.get(connections.mongooseConnection, models.MODELNAMES.THEME);

    groups.getThemesForUser(connections, restrictToUser, function (err, allowedThemes) {
      if(err) return cb(err);
      var query = {};
      if (allowedThemes) {
        query._id = {$in: allowedThemes};
      }
      themeModel.find(query).exec(function(err, themes){
        if(err) return cb(err);

        if(themes === null){
          themes = [];
        }
        return cb(undefined, {themes: themes}, allowedThemes);
      });
    });
  }

  function getAppsUsingTheme(themes, allowedThemes, cb){
    var appThemeModel = models.get(connections.mongooseConnection, models.MODELNAMES.APP_THEMES);

    groups.getAppsForUser(connections, restrictToUser, function (err, allowedApps) {
      if(err) return cb(err);

      var query = {};
      if (allowedThemes) {
        query.theme = {$in: allowedThemes};
      }
      if (allowedApps) {
        query.appId = {$in: allowedApps};
      }
      appThemeModel.find(query).select("-_id").exec(function(err, appThemes){
        if(err) return cb(err);

        if(appThemes === null){
          appThemes = [];
        }

        themes.appThemes = appThemes;
        return cb(undefined, themes);
      });
    });
  }


  function generateReturnJSON(themesAndApps, cb){
    var themesArray = [];

    themesAndApps.themes.forEach(function(themeDef){

      themeDef = themeDef.toJSON();

      var appsUsingTheme = themesAndApps.appThemes.filter(function(appTheme){
        return appTheme.theme.toString() === themeDef._id.toString();
      });

      if(appsUsingTheme === null){
        appsUsingTheme = [];
      }

      themeDef.appsUsingTheme = appsUsingTheme.length;
      themeDef.apps = appsUsingTheme;

      themesArray.push(themeDef);
    });

    return cb(undefined, {"themes" :themesArray});
  }
};
