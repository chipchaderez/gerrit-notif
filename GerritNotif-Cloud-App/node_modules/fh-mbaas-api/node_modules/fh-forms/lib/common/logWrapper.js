var _ = require('underscore');
var logger = require('./logger.js').getLogger();

module.exports = (function (){

  function addLoggingToFunctions(forms, funcNamePrefix, blacklist) {

    function log_fn_start(funcName, args) {
      var rest = _.rest(args); // get the rest of the args
      rest = _.initial(rest);  // remove the callback function from the logged args
      logger.debug(funcNamePrefix + funcName + '() - args: ', rest);
    }

    function log_fn_callback(funcName, args) {
      var err = _.first(args);
      var results = _.rest(args);
      if(err) {
        logger.error(funcNamePrefix + funcName + '() - err:', err); 
      } else {
        logger.debug(funcNamePrefix + funcName + '() - results: ', results);
      }
    }

    function wrapMainFunction(funcName, oldFunc, forms) {
      return function () {
        log_fn_start(funcName, arguments);
        var oldcb = _.last(arguments);
        var args;
        if (oldcb instanceof Function) {  // if callback specified, replace it with wrapped version
          args = _.initial(arguments);
          var newcb = wrapCallbackFunction(funcName, oldcb)
          args.push(newcb);
        } else {
          args = arguments;
        }
        oldFunc.apply(forms, args);
      };
    }

    function wrapCallbackFunction (funcName, oldCallback) {
      return function () {
        log_fn_callback(funcName, arguments);
        oldCallback.apply(this, arguments);
      }
    }

    var allFuncNames = _.functions(forms);
    var funcNamesNotInBlacklist = _.difference(allFuncNames,blacklist);
    _.each(funcNamesNotInBlacklist, function (funcName) {
      var oldfn = forms[funcName]; 
      forms[funcName] = wrapMainFunction(funcName, oldfn, forms);
    });
  }

  return {
    addLoggingToFunctions: addLoggingToFunctions
  };

}());
