var _ = require('underscore');
var parseHeaders = require('../common/parseFHHeaders');
/*
 Normalises the params object from a few different request types,
 so the cloud code function is presented with one unified params object
 */

 module.exports = {
  normalise : function(params, req){

    if (typeof req.body !== "undefined"){
      if (typeof req.body === 'string'){
        try{
          req.body = JSON.parse(req.body);
        }catch(err){
          // Ignore errors - we'll treat it as string
        }

      }
      params = _.extend(params, req.body);
    }

    if (req.query != null) {
      if( req.query.params != null) {
        try {
          params = _.extend(params, JSON.parse(req.query.params));
          params._callback = req.query._callback;
        } catch (e) {
          // "params" parameter is not a JSON object - may be a coincidence that we got a
          // standard GET request with a parameter called "params". Just use the req.query
          // obect as the params
          params = _.extend(params, req.query);
        }
      }
      else {
        params = _.extend(params, req.query);
      }

      this.jsonp(params, req);
    }

    if (typeof req.files !== 'undefined' && !_.isEmpty(req.files)){
      params.files = req.files;
    }

    //latest version of native SDKs will send the data previously in __fh as headers (each prefixed with X-FH-). Try to find them now for authentication
    params.__fh = params.__fh || {};
    var fhdata = parseHeaders(req.headers);
    if(fhdata){
      params.__fh = _.extend(params.__fh, fhdata);
    }

    if(req.query && req.query.fh_headers){
      //IE8 will send headers as a query string called "fh_headers" for cross domain calls
      var fhheaders = parseHeaders(req.query.fh_headers);
      if(fhheaders){
        params.__fh = _.extend(params.__fh, fhheaders);
      }
    }

    return params;
  },
  /*
   for js sdk, some jsonp requests will stringiy the request data and send as a query param called _jsonpdata
   if we see it, parse it as json and send to the request
   */
  jsonp : function(params, req){
    if(req.query._jsonpdata){
      var jsonpdata = null;
      try{
        jsonpdata = JSON.parse(decodeURIComponent(req.query._jsonpdata));
        params = _.extend(params, jsonpdata);
      } catch (e){
        params._jsonpdata = req.query._jsonpdata;
      }
    }
    return params;
  },

  parseFHParams: function(req) {
    if(req.fh_params && req.fh_params._parsed){
      return req.fh_params;
    }
    var p = {};
    p = module.exports.normalise(p, req);
    req.fh_params = p;
    req.fh_params._parsed = true;
    return p;
  }
 };
