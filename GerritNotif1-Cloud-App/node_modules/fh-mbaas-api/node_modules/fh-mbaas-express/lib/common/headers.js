var pkg = require('../../package.json'),
version = pkg.version;

module.exports = function(headers, contentType) {
  var newHeaders = headers || {};
  if (newHeaders['Content-Type'] == undefined && contentType){
    newHeaders['Content-Type'] = contentType;
  }
  if (newHeaders['Access-Control-Allow-Origin'] == undefined){
    newHeaders['Access-Control-Allow-Origin'] = "*";
  }

  // IOS 6 hotfix: http://stackoverflow.com/questions/12506897/is-safari-on-ios-6-caching-ajax-results
  if (newHeaders['Cache-Control'] == undefined){
    newHeaders['Cache-Control'] = "no-cache";
  }

  if (newHeaders['X-FH-Api-Version'] == undefined){
    newHeaders['X-FH-Api-Version'] = version;
  }

  return newHeaders;
};