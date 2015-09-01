var models = require('../common/models.js')();
var validation = require('../common/validate.js');
var groups = require('./groups.js');
var async = require('async');
var logger = require('../common/logger.js').getLogger();

module.exports = function () {
  return {
    updateAppConfig: updateAppConfig,
    createAppConfig: createAppConfig,
    getAppConfig: getAppConfig,
    deleteAppConfig: deleteAppConfig,
    setAppConfig: setAppConfig
  };

  /*
   * updateAppConfig(connections, options, appConfig, cb)
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
   *    appConfig: {
   *      appId: id of app
   *      "client": {
   *         "logging": {
   *           "enabled": {type: Boolean, default: false}
   *         }
   *       },
   *       "cloud": {
   *         "logging": {
   *           "enabled": {type: Boolean, default: false}
   *         }
   *       }
   *    }
   *
   *    cb  - callback function (err)
   *
   */
  function validateParams(connections, options, appConfig, paramsList, cb) {
    var validate = validation(appConfig);
    async.series([
      function(cb) {
        paramsList.push(cb);
        validate.has.apply(validate, paramsList);
      },
      function(cb) {
        groups.validateAppAllowedForUser(connections, options.restrictToUser, appConfig.appId, cb);
      }
    ], cb);
  }

  function updateAppConfig(connections, options, appConfig, cb) {
    logger.debug('updateAppConfig()');
    validateParams(connections, options, appConfig, ["appId", "client", "cloud"], function(err) {
      if (err) return cb(err);

      var conn = connections.mongooseConnection;
      var appConfigModel = models.get(conn, models.MODELNAMES.APP_CONFIG);

      logger.debug('updateAppConfig() - validated about to search for: ', appConfig.appId);
      appConfigModel.findOne({appId:appConfig.appId}).exec(function (err, config) {
        if (err) return cb(err);
        if (!config) {
          logger.warn('updateAppConfig() - appConfig not found for: ', appConfig.appId);
          return cb(new Error('appConfig not found'));
        } else {
          var prop;
          if(appConfig.client){
            for(prop in appConfig.client){
              if(appConfig.client.hasOwnProperty(prop)){
                config.client[prop] = appConfig.client[prop];
              }
            }
          }
          if(appConfig.cloud){
            for(prop in appConfig.cloud){
              if(appConfig.cloud.hasOwnProperty(prop)){
                config.cloud[prop] = appConfig.cloud[prop];
              }
            }
          }
          logger.debug('updateAppConfig() - appConfig for: ', appConfig.appId, ', being updated to: ', config);
          config.save(function (err, config) {
            if (err) return cb(err);
            logger.debug('updateAppConfig() - appConfig saved, returning :', config.toJSON());
            return cb(undefined, config.toJSON());
          });
        }
      });
    });
  }

  /*
   * setAppConfig(connections, options, appConfig, cb)
   *
   * create or update an appconfig
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
   *    appConfig: {
   *      appId: id of app
   *      "client": {
   *         "logging": {
   *           "enabled": {type: Boolean, default: false}
   *         }
   *       },
   *       "cloud": {
   *         "logging": {
   *           "enabled": {type: Boolean, default: false}
   *         }
   *       }
   *    }
   *
   *    cb  - callback function (err)
   *
   */
  function setAppConfig(connections, options, appConfig, cb) {
    logger.debug('setAppConfig()');
    validateParams(connections, options, appConfig, ["appId", "client", "cloud"], function(err) {
      if (err) return cb(err);
      var conn = connections.mongooseConnection;
      var appConfigModel = models.get(conn, models.MODELNAMES.APP_CONFIG);

      logger.debug( 'setAppConfig() - validated about to search for: ', appConfig.appId);
      appConfigModel.findOne({appId:appConfig.appId}).exec(function (err, config) {
        if (err) return cb(err);
        if (config) {
          var prop;
          if(appConfig.client){
            for(prop in appConfig.client){
              if(appConfig.client.hasOwnProperty(prop)){
                config.client[prop] = appConfig.client[prop];
              }
            }
          }
          if(appConfig.cloud){
            for(prop in appConfig.cloud){
              if(appConfig.cloud.hasOwnProperty(prop)){
                config.cloud[prop] = appConfig.cloud[prop];
              }
            }
          }
          logger.debug( 'setAppConfig() - appConfig already exists for: ', appConfig.appId, ', updating to: ', appConfig);

        } else {
          logger.debug( 'setAppConfig() - appConfig for: ', appConfig.appId, ', being created to: ', appConfig);
          config = new appConfigModel(appConfig);
        }
        config.save(function (err, config) {
          if (err) return cb(err);
          logger.debug( 'setAppConfig() - appConfig saved, returning :', config.toJSON());
          return cb(undefined, config.toJSON());
        });
      });
    });
  }

  /*
   * createAppConfig(connections, options, appConfig, cb)
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
   *    appConfig: {
   *      appId: id of app
   *      "client": {
   *         "logging": {
   *           "enabled": {type: Boolean, default: false}
   *         }
   *       },
   *       "cloud": {
   *         "logging": {
   *           "enabled": {type: Boolean, default: false}
   *         }
   *       }
   *    }
   *
   *    cb  - callback function (err)
   *
   */
  function createAppConfig(connections, options, appConfig, cb) {
    logger.debug('createAppConfig()');
    validateParams(connections, options, appConfig, ["appId", "client", "cloud"], function(err) {
      if (err) return cb(err);
      var conn = connections.mongooseConnection;
      var appConfigModel = models.get(conn, models.MODELNAMES.APP_CONFIG);

      logger.debug('createAppConfig() - validated about to search for: ', appConfig.appId);
      appConfigModel.findOne({appId:appConfig.appId}).exec(function (err, config) {
        if (err) return cb(err);
        if (config) {
          logger.warn('createAppConfig() - appConfig already exists for: ', appConfig.appId);
          return cb(new Error('appConfig already exists'));
        } else {
          logger.debug('createAppConfig() - appConfig for: ', appConfig.appId, ', being created to: ', appConfig);
          var newAppConfig = new appConfigModel(appConfig);
          newAppConfig.save(function (err, config) {
            if (err) return cb(err);
            logger.debug('createAppConfig() - appConfig saved, returning :', config.toJSON());
            return cb(undefined, config.toJSON());
          });
        }
      });
    });
  }

  /*
   * getAppConfig(connections, options, appConfig, cb)
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
   *    appConfig: {
   *      appId: id of the app
   *    }
   *
   *    cb  - callback function (err)
   *
   */
  function getAppConfig(connections, options, appConfig, cb) {
    logger.debug('getAppConfig()');
    validateParams(connections, options, appConfig, ["appId"], function(err) {
      if (err) return cb(err);
      var conn = connections.mongooseConnection;
      var appConfigModel = models.get(conn, models.MODELNAMES.APP_CONFIG);
      appConfigModel.findOne({appId: appConfig.appId}, function (err, config) {
        if (err) return cb(err);
        if (!config) {
          logger.warn('getAppConfig() - creating default, since appConfig not found for: ', appConfig.appId);
          var newAppConfig = new appConfigModel({appId: appConfig.appId, client: {}, cloud: {}});
          logger.warn('getAppConfig() - creating default, since appConfig not found for: ', newAppConfig);

          newAppConfig.save(function (err, config) {
            if (err) return cb(err);
            logger.warn('getAppConfig() - created default: ',config.toJSON());
            return cb(undefined, config.toJSON());
          });
        } else {
          logger.debug('getAppConfig() - returning :', config.toJSON());
          return cb(undefined, config.toJSON());
        }
      });
    });
  }

  /*
   * deleteAppConfig(connections, options, appConfig, cb)
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
   *    appConfig: {
   *      appId: id of the app
   *    }
   *
   *    cb  - callback function (err)
   *
   */
  function deleteAppConfig(connections, options, appConfig, cb) {
    logger.debug('deleteAppConfig()');
    validateParams(connections, options, appConfig, ["appId"], function(err) {
      if (err) return cb(err);
      var conn = connections.mongooseConnection;
      var appConfigModel = models.get(conn, models.MODELNAMES.APP_CONFIG);
      logger.debug('deleteAppConfig() - validated about to search for: ', appConfig.appId);
      appConfigModel.findOne({appId:appConfig.appId}).exec(function (err, config) {
        if (err) return cb(err);
        if (!config) {
          logger.warn('deleteAppConfig() - appConfig not found for: ', appConfig.appId);
          return cb(new Error('appConfig not found'));
        } else {
          logger.debug('deleteAppConfig() - deleting: ', appConfig.appId);
          config.remove(cb);
        }
      });
    });
  }
};
