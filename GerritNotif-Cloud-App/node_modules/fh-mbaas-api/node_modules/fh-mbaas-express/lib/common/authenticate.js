var request = require('request');

/**
 *
 * @param req
 * @param res
 * @param params
 * @return {Object}
 */

var authorizationCache = {

};

module.exports = function(req, res, params) {
  var apiKey = process.env.FH_APP_API_KEY;
  var authConfig = (params && params.authConfig) || process.env.FH_ENDPOINT_CONFIG;

  // connect seems to lowercase headers??
  var APP_HEADER_KEY = "x-fh-auth-app";
  var USER_HEADER_KEY = "x-fh-auth-user";
  var APP_KEY_PARAM_KEY = "appkey";
  var USER_KEY_PARAM_KEY = "userkey";

  var SERVICE_ID_KEY = 'x-request-with';

  var OVERRIDES_KEY = "overrides";
  var DEFAULT_KEY = "default";
  var UNAUTHORISED_HTTP_CODE = 401;

  /**
   * private
   */
  function authenticateAppApiKey(cb) {
    var sentApiKey = getAppApiKey();
    if (!sentApiKey || !apiKey) {
      return cb({
        code: UNAUTHORISED_HTTP_CODE,
        message: "no app api key found"
      });
    }
    if (sentApiKey !== apiKey) {
      return cb({
        code: UNAUTHORISED_HTTP_CODE,
        message: "invalid key"
      });
    } else {
      return cb();
    }
  }

  function isServiceApp() {
    return process.env.FH_SERVICE_APP === 'true';
  }

  function resolveServiceVars() {
    var vars = {
      service_app: null,
      service_app_public: null,
      service_authorised_projects: [],
      project_id: null,
      accessor: null
    };

    if (process.env['FH_SERVICE_APP']) {
      vars.service_app = isServiceApp();
    }

    if (process.env['FH_SERVICE_APP_PUBLIC']) {
      vars.service_app_public = (process.env['FH_SERVICE_APP_PUBLIC'] === 'true');
    }

    if (process.env['FH_SERVICE_AUTHORISED_PROJECTS']) {
      vars.service_authorised_projects = process.env['FH_SERVICE_AUTHORISED_PROJECTS'].split(',');
    }

    if (process.env['FH_WIDGET']) {
      vars.project_id = process.env['FH_WIDGET'];

      // Add ourself as an authorisedProject, since we should be able to call ourself
      // Dynamic docs in the Studio will also use this ID.
      vars.service_authorised_projects.push(vars.project_id);
    }

    if (req.headers.hasOwnProperty(SERVICE_ID_KEY)) {
      vars.accessor = req.headers[SERVICE_ID_KEY];
    }

    return vars;
  }

  function verifyServiceAuthorisation() {
    // Not a service
    if (!isServiceApp()) return true;

    var envs = resolveServiceVars();

    // Global/public services do not require auth
    if (envs.service_app_public) return true;

    if (typeof envs.service_app !== 'undefined' && typeof envs.service_app_public !== 'undefined' && typeof envs.service_authorised_projects !== 'undefined' && typeof envs.accessor !== 'undefined') {
      // Perms check
      if (envs.service_authorised_projects.indexOf(envs.accessor) != -1) {
        return true;
      }
    }

    // No access
    return false;
  }

  function getAppApiKey() {
    var headers = req.headers;
    if (headers.hasOwnProperty(APP_HEADER_KEY)) return headers[APP_HEADER_KEY];
    // Form data sends these through as strings, not JSON objects & we can't set headers
    if (params && params['__fh.' + APP_KEY_PARAM_KEY]) {
      return params['__fh.' + APP_KEY_PARAM_KEY];
    }
    if (params && params.__fh) {  // move this check to last since __fh will now be added to all requests
      return params.__fh[APP_KEY_PARAM_KEY];
    }
    return undefined;
  }

  function getUserApiKey() {
    var headers = req.headers;
    if (headers.hasOwnProperty(USER_HEADER_KEY)) {
      return headers[USER_HEADER_KEY];
    }
    // Form data sends these through as strings, not JSON objects & we can't set headers
    if (params && params['__fh.' + USER_KEY_PARAM_KEY]) {
      return params['__fh.' + USER_KEY_PARAM_KEY];
    }
    if (params && params.__fh) {  // move this check to last since __fh will now be added to all requests
      return params.__fh[USER_KEY_PARAM_KEY];
    }
    return undefined;
  }

  function processAuth(authType, cb) {
    switch (authType) {
      case "https":
        cb();
        break;
      case "appapikey":
        authenticateAppApiKey(cb);
        break;
      default:
        cb({
          code: UNAUTHORISED_HTTP_CODE,
          message: "unknown auth type " + authType
        });
        break;
    }
  }


  return {
    /**
     *
     * @param endpoint
     * @param cb
     * @return {*}
     *
     * checks the authConfig set when the was last started for the endpoint being called and
     * checks if the requester is allowed to access this endpoint.
     */
    "authenticate": function(endpoint, cb) {
      if (!verifyServiceAuthorisation()) {
        return cb({
          code: 401,
          message: "You do not have permission to access this service."
        });
      }

      //if there is no auth config then assume nothing has been setup for this app yet and continue as normal.
      if (!authConfig) {
        return cb();
      }
      if ('string' === typeof authConfig) {
        try {
          authConfig = JSON.parse(authConfig);
        } catch (e) {
          return cb({
            code: 503,
            message: "failed to parse auth config " + e.message
          });
        }
      }
      var overrides = authConfig[OVERRIDES_KEY];
      var defaultOpt = authConfig[DEFAULT_KEY];
      //if there is a config set for this option process it.
      if (typeof overrides === 'object' && (overrides.hasOwnProperty(endpoint) || overrides.hasOwnProperty('*'))) {
        var enpointConfig = overrides[endpoint] || overrides['*'];
        //there is a config for this endpoint it must have a security property otherwise we cannot decide how to proceed.

        if ('object' === typeof enpointConfig && enpointConfig.hasOwnProperty("security")) {
          var authType = enpointConfig.security.trim();
          processAuth(authType, cb);
        } else {
          return cb({
            code: 503,
            message: " internal error"
          });
        }
      } else {
        //fall back to config default
        processAuth(defaultOpt, cb);
      }
    },
    /**
     *
     * @param requestedPerm
     * @param cb
     * @returns {*}
     */
    "authorise": function(requestedPerm, cb) {
      //switch off for local db or if explicitly told to
      if (process.env.FH_USE_LOCAL_DB || process.env.FH_SKIP_MBAAS_AUTH) {
        return cb();
      }
      var userApiKey = getUserApiKey();
      var appApiKey = getAppApiKey();
      var millicore = process.env.FH_MILLICORE;
      var millicoreProt = process.env.FH_MILLICORE_PROTOCOL || "https";
      var env = process.env.FH_ENV;

      if (!appApiKey || !userApiKey) {
        return cb({
          code: 401,
          message: "unauthorised"
        });
      }
      if (!env || !millicore) {
        return cb({
          code: 503,
          "message": ""
        });
      }
      var now = new Date().getTime();

      //check cache
      if (authorizationCache.hasOwnProperty(userApiKey)) {
        var cache = authorizationCache[userApiKey];
        //cache not timed out return cb else auth again
        if (cache.timeout > now) {
          if (cache.auth) return cb();
          else {
            cb({
              code: 401,
              "message": ""
            });
          }
        }
      }

      var authEndpoint = millicoreProt + "://" + millicore + "/box/api/mbaas/admin/authenticateRequest?appApiKey=" + appApiKey + "&env=" + env + "&requestedPerm=" + requestedPerm;

      var headers = {};
      headers[USER_HEADER_KEY.toUpperCase()] = userApiKey;
      request.get({
        "url": authEndpoint,
        headers: headers
      }, function(err, res, data) {
        var cacheLength = now + (1000 * 60 * 60);
        if (err) {
          return cb(err);
        }

        if (res.statusCode === 200) {
          authorizationCache[userApiKey] = {
            "timeout": cacheLength,
            "auth": true
          };
          return cb();
        } else {
          authorizationCache[userApiKey] = {
            "timeout": cacheLength,
            "auth": false
          };
          cb({
            code: 401,
            "message": ""
          });
        }
      });
    }
  };
};
