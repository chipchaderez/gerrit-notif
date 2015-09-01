var _ = require('underscore');
module.exports = function(headers){
  var fhdata = _.reduce(headers, function(data, headervalue, headerkey){
    if(headerkey.toLowerCase().indexOf("x-fh-") > -1){
      var parts = headerkey.split("-");
      var entryKey = parts[parts.length-1];
      try{
        data[entryKey] = JSON.parse(headervalue);
      }catch(e){
        data[entryKey] = headervalue;
      }
    }
    return data;
  }, {});
  return _.size(fhdata) > 0 ? fhdata : null;
}