var mongoose = require('mongoose');
var models = require('../lib/common/models.js')();
var Db = require('mongodb').Db;
var validate = require('./common/validate.js');
var getForms = require('./impl/getForms.js')();
var groups = require('./impl/groups.js');
var notification = require('./impl/notification.js');
var appConfig = require('./impl/appConfig.js')();
var logfns = require('../lib/common/logger.js');
var logWrapper = require('./common/logWrapper');
var deleteAppReferences = require('./impl/deleteAppRefrences.js');
var EventEmitter = require('events').EventEmitter;

var forms = {
  connections: {},

  initConnection : function(options, cb) {
    var self = this;
    var uri = options.uri;
    var key = options.key || uri;

    notification.initNotifications(function (err){
      if(err) return cb(err);

      if( self.connections[key] ) {
        return cb(undefined, self.connections[key]);
      }
      var paramValidation = validate(options);

      paramValidation.has("uri", function(failed){
        if(failed) return cb(new Error("Invalid Params: " + JSON.stringify(failed)));

        Db.connect(uri, function(err, databaseConn){
          if(err) return cb(err);

          var connections =  {
            "databaseConnection": databaseConn,
            "mongooseConnection": mongoose.createConnection(uri)
          };

          self.connections[key] = connections;

          models.init(connections.mongooseConnection); //Initialise the models on the created mongoose connection.

          return cb(undefined, connections); //Successfull completion of connection, no error returned.
        });
      });
    });
  },

  tearDownConnection : function(options, cb) {
    var self = this;
    var uri = options.uri;
    var key = options.key || uri;


    if( self.connections[key] ) {
      self.connections[key].mongooseConnection.close(function(err){
        if(err) console.log(err);

        self.connections[key].databaseConnection.close(function(err){
          if(err) console.log(err);

          delete self.connections[key];

          notification.disconnect(function (err) {
            return cb(err);
          });
        });
      });
    } else  {
      cb(null);
    }
  },

  getForms: function(options, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);


      return getForms.getForms(connections, options, cb);
    });
  },


  submissionSearch: function (options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/searchSubmissions.js').submissionSearch(connections, options, params, cb);
    });
  },


  getForm: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/getForm.js')(connections, options, cb);
      });
  },

  getAllForms: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      options.getAllForms = true;
      return getForms.getForms(connections, options, cb);
    });
  },

  deleteForm : function(options, cb){
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return require('./impl/deleteForm.js')(connections, options, cb);
    });
  },

  getTheme: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);


      if(options.appId){
        return require('./impl/getThemeForApp.js')(connections, options, cb);
      } else {
        return require('./impl/getTheme.js')(connections, options, cb);
      }
    });
  },

  getAppTheme: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return require('./impl/getThemeForApp.js')(connections, options, cb);
    });
  },

  setAppTheme: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return require('./impl/setThemeForApp.js')(connections, options, cb);
    });
  },

  updateTheme : function(options, themeData, cb){
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/updateTheme.js')(connections, options, themeData, cb);
    });
  },

  deleteTheme : function(options, cb){
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return require('./impl/deleteTheme.js')(connections, options, cb);
    });
  },

  getThemes : function(options, cb){
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/getThemes.js')(connections, options, cb);
    });
  },

  updateForm: function(options, formData, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/updateForm.js')(connections, options, formData, cb);
    });
  },

// forms.getSubmissions({"uri": mongoUrl}, {"appId" : req.params.appId, "formId": req.params.formId}, function(err, results){
  getSubmissions: function (options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/getSubmissions.js')(connections, options, params, cb);
    });
  },

// forms.getSubmission({"uri": mongoUrl}, {"_id" : req.params.submissionId}, function(err, result){
  getSubmission: function (options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/getSubmission.js')(connections, options, params, cb);
    });
  },

  deleteSubmission: function (options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/deleteSubmission.js')(connections, options, params, cb);
    });
  },

// forms.getSubmissionFile({"uri": mongoUrl}, {"_id" : req.params.fileGroupId}, function(err, result){
  getSubmissionFile: function (options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/getSubmissionFile.js')(connections, options, params, cb);
    });
  },

  submitFormData: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);


      return require('./impl/submitFormData.js')(connections, options, cb);
    });
  },

  submitFormFile: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);


      return require('./impl/submitFormFile.js')(connections, options, cb);
    });
  },

  completeFormSubmission: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);


      return require('./impl/completeFormSubmission.js')(connections, options, cb);
    });
  },

  getSubmissionStatus: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);


      return require('./impl/getSubmissionStatus.js')(connections, options, cb);
    });
  },

  updateSubmission : function(options, cb){
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      // create & update submission both use same impl
      return require('./impl/submitFormData.js')(connections, options, cb);
    });
  },

  updateSubmissionFile : function(options, cb){
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);


      return require('./impl/updateSubmissionFile.js').updateSubmissionFile(connections, options, cb);
    });
  },

  updateFieldRules: function(options, fieldRules, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/updateRules.js').updateFieldRules(connections, options, fieldRules, cb);
    });
  },

  updatePageRules: function(options, pageRules, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/updateRules.js').updatePageRules(connections, options, pageRules, cb);
    });
  },

  getNotifications : function(options, cb){
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/getNotifications.js')(connections, options, cb);
    });
  },

  updateNotifications : function(options, subscribers, cb){
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/updateNotifications.js')(connections, options, subscribers, cb);
    });
  },

  getFormApps: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/formapps.js').getFormApps(connections, options, cb);
    });
  },

  getPopulatedFormList: function (options, cb){
    var self = this;
    self.initConnection(options,function (err, connections){
      if(err) return cb(err);
      return require('./impl/getPopulatedFormsList.js')(connections, options, cb);
    })
  },

  updateAppForms: function(options, appForms, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/appforms.js').updateAppForms(connections, options, appForms, cb);
    });
  },

  getAppFormsForApp: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/appforms.js').getAppFormsForApp(connections, options, cb);
    });
  },

  getAllAppForms: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);

      return require('./impl/appforms.js').getAllAppForms(connections, options, cb);
    });
  },

  getAllAppsForUser: function (options, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return groups.getAppsForUser(connections, options.restrictToUser, function (err, allowedApps) {
        if(err) return cb(err);
        return cb(undefined, allowedApps);
      });
    });
  },

  getAllGroups: function (options, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return groups.getAllGroups(connections, options, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  getGroup: function (options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return groups.getGroup(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  updateGroup: function (options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return groups.updateGroup(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  addAppToUsersGroups : function (options,params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return groups.addAppToUsersGroups(connections,params.restrictToUser,params.appId, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  createAppConfig: function (options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return appConfig.createAppConfig(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  updateAppConfig: function (options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return appConfig.updateAppConfig(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  getAppConfig: function (options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return appConfig.getAppConfig(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  setAppConfig: function (options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return appConfig.setAppConfig(connections, options, params, cb);
    });
  },

  deleteAppConfig: function (options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return appConfig.deleteAppConfig(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  getAppClientConfig: function (options, cb) {
    var self = this;
    var params = {appId: options.appId}; 
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return appConfig.getAppConfig(connections, options, params, function (err, result) {
        if (err) {
          return cb(err);
        }
        var clientConfig = result.client;
        var config_admin_user = false;
        if (options.deviceId && clientConfig.config_admin_user && (clientConfig.config_admin_user.length > 0)) {
          config_admin_user = deviceInClientAdminUserList(options.deviceId, clientConfig.config_admin_user);
        }
        clientConfig.config_admin_user = config_admin_user;
        return cb(undefined, clientConfig);

        function deviceInClientAdminUserList(deviceId, deviceList) {
          return deviceList.indexOf(deviceId) >= 0;
        }
      });
    });
  },

  createGroup: function (options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return groups.createGroup(connections, options, params, cb);
    });
  },

  deleteGroup: function (options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return groups.deleteGroup(connections, options, params, cb);
    });
  },

  deleteAppRefrences: function (options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if(err) return cb(err);
      return deleteAppReferences.deleteAppRefrences(connections, options, params, cb);
    });
  },

  deleteSubmissions : function (options, params, cb){
    cb();
  },

  setLogger: function (logger) {
    return logfns.setLogger(logger);
  },

  registerListener: function(listener, cb){
    if(!(listener instanceof EventEmitter)){
      return cb(new Error("registerListener: Listener Must Be an instance of EventEmitter."));
    }

    notification.registerEventListener(listener);
    return cb();
  },

  deregisterListener: function(listener){
    if(!(listener instanceof EventEmitter)){
      return cb(new Error("deregisterListener: Listener Must Be an instance of EventEmitter."));
    }

    notification.deregisterListener(listener);
  }
};


logWrapper.addLoggingToFunctions(forms, "forms.", ["deleteAppRefrences", "setLogger", "initConnection"]);

module.exports = forms;
