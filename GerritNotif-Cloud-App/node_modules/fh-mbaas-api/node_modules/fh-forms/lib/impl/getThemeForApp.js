var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var async = require('async');
var groups = require('./groups.js');

var getTheme = function(connections, options, cb) {
  var restrictToUser = options.restrictToUser;

  async.waterfall([
    validateParams, 
    function (appId, cb) {
      groups.validateAppAllowedForUser(connections, restrictToUser, appId, function (err) {
        if(err) return cb(err);
        return cb(undefined, appId);
      });
    },
    getThemeForAppId
  ], function(err, theme) {
    if(err) {
      return cb(err);
    } else {
      cb(undefined, theme);
    }
  });

  function validateParams(cb){
    var val = validate(options);
    val.has("appId", function(failed){
      if(failed){
        return cb(new Error("Invalid parameters. No appId specified. "));
      } else {
        return cb(undefined, options.appId);
      }
    });
  }

  function getThemeForAppId(appId, cb){
    var AppThemes = models.get(connections.mongooseConnection, models.MODELNAMES.APP_THEMES);

    AppThemes.findOne({"appId" : appId}).populate("theme", "-__v").select("-__v -_id").exec(function(err, appTheme){
      if(err) return cb(err);

      if(appTheme !== null && appTheme.theme !== null){
        groups.validateThemeAllowedForUser(connections, restrictToUser, appTheme.theme._id, function (err) {
          if(err) return cb(err);
          return cb(undefined, appTheme.theme.toJSON());
        });
      } else {
        return cb();
      }
    });
  }
};

module.exports = getTheme;