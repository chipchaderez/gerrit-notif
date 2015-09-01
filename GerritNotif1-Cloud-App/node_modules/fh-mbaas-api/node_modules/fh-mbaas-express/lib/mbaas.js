var express = require('express');
var bodyParser = require('body-parser');
var paramsUtils = require('./cloud/params');
var authentication = require('./common/authenticate');
var headersUtils = require('./common/headers');
var cors = require('./common/cors');
var util = require('util');
var reqValidator = require("./common/requestValidator");
var responseGenerator = require("./common/responseGenerator");
var async = require('async');
var multer = require('multer');

var fh;
var mBaaS;

function applyAuth(req, res,api,role,callback){
  var params = req.params;
  async.series([
    function (callback) {
      // TODO FIXME authentication(req, res, params).authenticate(api, callback);
      callback();
    },
    function (callback) {
      if ("db" === api) {
        authentication(req, res, params).authorise("AppCloudDB", callback);
      }
      else {
        callback();
      }
    }],callback);
}

function handleRequest(req, res) {
  var params = {},
      api = req.params.api,
      func = req.params.func;

//  console.log('ROUTER - api: ', api, ", func: " , func);
//  console.log('ROUTER - mBaaS: ', mBaaS);

  params = paramsUtils.normalise(params, req);

  params.authConfig = {
    overrides: {
      '*': { security: 'appapikey' }
    }
  };

  async.series([
    function (callback) {
      // TODO FIXME authentication(req, res, params).authenticate(api, callback);
      callback();
    },
    function (callback) {
      if ("db" === api) {
        authentication(req, res, params).authorise("AppCloudDB", callback);
      }
      /* will need to differentiate between CMS Administrator and CMS Editor
       * else if ("cms" === api) {
       *   authentication(req, res, params).authorise("AppCloudCMS", callback);
       * }
       */
      else {
        callback();
      }
    },function(callback){
      if (("db" === api) && (mBaaS.hasOwnProperty(api))) {   // TODO this (and following else) is a hack, need a generic way of referencing mBaaS endpoints
        mBaaS[api](params, callback);
      } else if (("cms" === api) && (mBaaS.hasOwnProperty(api)) && (mBaaS[api].hasOwnProperty(func))) {
//        console.log('API - calling mBaas - api: ', api, ", func: ", func);
//        console.log('API - calling mBaas - params: ', params);

        mBaaS[api][func](params, function (err, result) {
//          console.log('API - callback mBaas - api: ', api, ", func: ", func, ", err: ", err, ", result: ", result);
          return callback(err, result);
        });
      }else{
        callback({code:404,"message":"endpoint not found"});
      }

    }
  ], function (err, datas){
    if(err){
      endResponseCallback(req,res,err);
    }else{
      if(datas && datas[2]){
        endResponseCallback(req,res,undefined,datas[2]);
      }else{
        endResponseCallback(req,res);
      }
    }
  });
}

function endResponseCallback(req, res,err, ok) {
  var headers = headersUtils({"Cache-Control": "no-cache", "Content-Type": "application/json"});
  if (err) {
    res.writeHead(err.code || 500, headers);
    //we need to do this as JSON.stringify wont get the property values of an Error object as the properties are non enumarable... Thanks js.
    var error = {
      "message":err.message || "unknown error",
      "code":err.code || 500
    };
    res.end(JSON.stringify(error));
  } else if (ok) {// If there is a response, need to decide if a file needs to be streamed from the database.

    if(ok.stream){ // A stream object is returned if the download is a file.
      if (ok.type && ok.length){
        headers["Content-Type"] = ok.type;//Setting the file content type. Mime types are set by the file handler.
        headers["Transfer-Encoding"] = "chunked";
        headers["Content-Length"] = ok.length;
        res.writeHead(200, headers);
      }else if (ok.stream.on){ // if our stream supports event bindings, forward our headers that way
        ok.stream.on('response', function(response){
          res.writeHead(response.statusCode, response.headers);
        });
      }

      ok.stream.pipe(res);
      ok.stream.resume();//Unpausing the stream as it was paused by the file handler
    } else if (ok instanceof Buffer){
      // when fh-db is in local mode rather than net_db it can return a buffer - let's handle that
      headers['Content-type'] = "application/zip";
      headers['Content-disposition'] = "attachment; filename=collections.zip";
      res.end(ok);
    }else {
      res.writeHead(200, headers);
      res.end(JSON.stringify(ok));
    }
  }else{
    res.writeHead(200, headers);
    res.end("");
  }
}

function handleError(err, res){
  var headers = headersUtils({"Cache-Control": "no-cache", "Content-Type": "application/json"});
  res.writeHead(err.code || 500, headers);
  //we need to do this as JSON.stringify wont get the property values of an Error object as the properties are non enumarable... Thanks js.
  var error = {
    "message":err.message || "unknown error",
    "code":err.code || 500
  };
  res.end(JSON.stringify(error));
}

//module.exports = connect().use(connect.bodyParser()).use(cors()).use(
//  connect.router(function (app) {
var app = express.Router();
    app.use(cors());
    app.use(multer({ dest: '/tmp'}));
    app.use(bodyParser({"limit": "10mb"}));

    app.post('/:api', handleRequest);

    app.post('/sync/:datasetId', function(req, res) {
      var params = {};
      var dataset_id = req.params.datasetId;
      var params = paramsUtils.normalise(params, req);

      fh.sync.invoke(dataset_id, params, function(err, ok) {
        return endResponseCallback(req, res, err, ok);
      });
    });


    app.get('/forms/:appId', function(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);
        requestValidator.forms.getForms(function(err, ok){
          if(err) return handleError(err, res);

          //Parameters are valid and parsed
          fh.forms.getForms(ok, function(err, result){
            if(err) return handleError(err, res);

            //No error, handleSuccess
            var responseHandler = responseGenerator(res);
            responseHandler.forms.getForms(result);
          });
        });
      });
    });

    app.get('/forms/:appId/theme', function(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);
        requestValidator.forms.getTheme(function(err, ok){
          if(err) return handleError(err, res);

          //Parameters are valid and parsed
          fh.forms.getTheme(ok, function(err, result){
            if(err) return handleError(err, res);

            //No error, handleSuccess
            var responseHandler = responseGenerator(res);
            responseHandler.forms.getTheme(result);
          });
        });
      });
    });

    function getConfig(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);
        requestValidator.forms.getConfig(function(err, ok){
          if(err) return handleError(err, res);

          //Parameters are valid and parsed
          fh.forms.getAppClientConfig(ok, function(err, result){
            if(err) return handleError(err, res);

            //No error, handleSuccess
            var responseHandler = responseGenerator(res);
            responseHandler.forms.getConfig(result);
          });
        });
      });
    }
    app.get('/forms/:appId/config/:deviceId', getConfig);
    app.get('/forms/:appId/config', getConfig);

    app.get('/forms/:appId/:formId', function(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);

        requestValidator.forms.getForm(function(err, ok){
          if(err) return handleError(err, res);

          //Parameters are valid and parsed
          fh.forms.getForm(ok, function(err, result){
            if(err) return handleError(err, res);

            //No error, handleSuccess
            var responseHandler = responseGenerator(res);
            responseHandler.forms.getForm(result);
          });
        });
      });
    });

    app.post('/forms/:appId/:formId/submitFormData', function(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);
        requestValidator.forms.submitFormData(function(err, ok){
          if(err) return handleError(err, res);

          //Parameters are valid and parsed
          fh.forms.submitFormData(ok, function(err, result){
            if(err) return handleError(err, res);

            //No error, handleSuccess
            var responseHandler = responseGenerator(res);
            responseHandler.forms.submitFormData(result);
          });
        });
      });
    });

    app.post('/forms/:appId/:submitId/:fieldId/:fileId/submitFormFile', function(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);
        requestValidator.forms.submitFormFile(function(err, ok){
          if(err) return handleError(err, res);

          //Parameters are valid and parsed
          fh.forms.submitFormFile(ok, function(err, result){
            if(err) return handleError(err, res);

            //No error, handleSuccess
            var responseHandler = responseGenerator(res);
            responseHandler.forms.submitFormFile(result);
          });
        });
      });
    });

    app.post('/forms/:appId/:submitId/:fieldId/:fileId/submitFormFileBase64', function(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);
        requestValidator.forms.submitFormFileBase64(function(err, ok){
          if(err) return handleError(err, res);

          //Parameters are valid and parsed
          fh.forms.submitFormFile(ok, function(err, result){
            if(err) return handleError(err, res);

            //No error, handleSuccess
            var responseHandler = responseGenerator(res);
            responseHandler.forms.submitFormFile(result);
          });
        });
      });
    });

    /**
     * Endpoint for getting submissions on-devices.
     */
    app.get('/forms/:appId/submission/:submitId', function(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);

        requestValidator.forms.getSubmission(function(err, ok){
          if(err) return handleError(err, res);

          fh.forms.getSubmission(ok, function(err, result){
            if(err){
              return handleError(err, res);
            }

            var responseHandler = responseGenerator(res);
            responseHandler.forms.getSubmission(result);
          });
        });
      });
    });

    /**
     * Endpoint for getting submissions files.
     */
    app.get('/forms/:appId/submission/:submitId/file/:fileGroupId', function(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);

        requestValidator.forms.getSubmissionFile(function(err, ok){
          if(err) return handleError(err, res);

          fh.forms.getSubmissionFile(ok, function(err, result){
            if(err){
              return handle(err, res);
            }

            var responseHandler = responseGenerator(res);
            responseHandler.forms.getSubmissionFile(result);
          });
        });
      });
    });

    app.get('/forms/:appId/:submitId/status', function(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);
        requestValidator.forms.getSubmissionStatus(function(err, ok){
          if(err) return handleError(err, res);

          //Parameters are valid and parsed
          fh.forms.getSubmissionStatus(ok, function(err, result){
            if(err) return handleError(err, res);

            //No error, handleSuccess
            var responseHandler = responseGenerator(res);
            responseHandler.forms.getSubmissionStatus(result);
          });
        });
      });
    });


    app.post('/forms/:appId/:submitId/completeSubmission', function(req, res){
      var requestValidator = reqValidator(req);

      applyAuth(req, res, "forms", undefined, function(err, ok){
        if(err) return handleError(err, res);
        requestValidator.forms.completeSubmission(function(err, ok){
          if(err) return handleError(err, res);

          //Parameters are valid and parsed
          fh.forms.completeSubmission(ok, function(err, result){
            if(err) return handleError(err, res);

            //No error, handleSuccess
            var responseHandler = responseGenerator(res);
            responseHandler.forms.completeSubmission(result);
          });
        });
      });
    });


    app.all('/*', function (req, res) {
      res.end("Only POST to supported mBaaS APIs are supported. See http://docs.feedhenry.com for more")
    });

module.exports = function(fhMbaasApi) {
  fh = fhMbaasApi;

  mBaaS = {
    db: fh.db,
    forms: fh.forms
  };

  return app;
}
