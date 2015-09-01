var util = require('util');
var messaging = require('./common/message.js')();
var request = require('request');

function errorHandler() {
  process.on('uncaughtException', function (err) {
    err = err || {};
    errHandler(err, null, null, null);
  });

  return errHandler;

  function errHandler(err, req, res, next){
    console.log("Internal error: " + util.inspect(err));
    console.error("Internal error: " + util.inspect(err));
    if (err && err.stack) console.error(util.inspect(err.stack));

    var error = {
      msg: "Internal error: " + err,
      error: util.inspect(err)
    };
    if (res) {
      res.statusCode = 500;
      res.end(JSON.stringify(error));
    }
    
    // If we're in Openshift, the FeedHenry Cartridge will have an IP set as env var
    if (process.env.OPENSHIFT_FEEDHENRY_REPORTER_IP){
      return postErrorToReporter(error, function(err){
        shutdown(1);
      });
    }else{
      return putErrorOnBus(error, function(err){
        shutdown(1);
      });  
    }
  }
}

function putErrorOnBus(mess, cb){
  messaging.getAmqp(function(err, amqpInst){
    //ignoring err as only interested in if we have a connection
    if(amqpInst){
      amqpInst.sendErrorMessage(mess, cb);
    }else{
      process.nextTick(function() {
        return cb();
      });
    }
  });
};

function postErrorToReporter(mess, cb){
  var url = 'http://' + process.env.OPENSHIFT_FEEDHENRY_REPORTER_IP + ':' + process.env.OPENSHIFT_FEEDHENRY_REPORTER_PORT;
  url += '/sys/admin/notifications';
  mess.type = 'DYNOMAN_CORE_APP_CRASH';
  request({
    method : 'POST',
    url : url,
    json : mess
  }, function(error, response, body){
    return cb();
  });
}

function shutdown(code) {
  process.nextTick(function() {
    var c = code? code: 1;

    // TODO - look into graceful app shutdown here..
    process.exit(c);
  });
};

exports.errorHandler = errorHandler;
