var util = require('util');
var events = require('events');
var _ = require('underscore');

var logger;

var logit = {
  setLevel : function (level){
    logger.level = level;
  },
  info: function () {
    logger.info.apply(logger, arguments);
    this.emitEvents('info', _.toArray(arguments));
  },
  trace: function () {
    logger.trace.apply(logger, arguments);
    this.emitEvents('trace', _.toArray(arguments));
  },
  debug: function () {
    logger.debug.apply(logger, arguments);
    this.emitEvents('debug', _.toArray(arguments));
  },
  warn: function () {
    logger.warn.apply(logger, arguments);
    this.emitEvents('warn', _.toArray(arguments));
  },
  error: function () {
    logger.error.apply(logger, arguments);
    this.emitEvents('error', _.toArray(arguments));
  },
  emitEvents: function (event, args) {
    this.events.emit(event, args);
    this.events.emit('*', event, args);
  },
  events: new events.EventEmitter()
};

function setLogger(newLogger) {
  var oldLogger = logger;
  logger = newLogger;
  return oldLogger;
}

function dummyErrorListener() {
  // when an event called "error" is emitted in node.js without something listening, node exits.
  // Since we want to use an event called error, we add this dummy listener to the event, which avoids
  // the default behavior for this case
}

function getLogger() {

  if(!logger) {
    logger = basicConsoleLogger;
  }

  logit.events.removeListener('error', dummyErrorListener);
  logit.events.addListener('error', dummyErrorListener);

  return logit;
}

var basicConsoleLogger = {
  ERROR: 0,
  WARNING: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
  level: 0,

  log: function (){
    var self = this;
    var thisLevel = _.first(arguments) || self.ERROR;
    if(thisLevel <= self.level) {
      var args = _.rest(arguments);
      var strs = _.map(args, function(item) {
        return util.inspect(item, {depth:8});
      });
      console.log("" + thisLevel + ": ", strs.join(', '));
    }
  },

  info: function () {
    var args = [this.INFO];
    this.log.apply(this, args.concat(arguments));
  },

  debug: function () {
    var args = [this.DEBUG];
    this.log.apply(this, args.concat(arguments));
  },

  warn: function () {
    var args = [this.WARNING];
    this.log.apply(this, args.concat(arguments));
  },

  error: function () {
    var args = [this.ERROR];
    this.log.apply(this, args.concat(arguments));
  },

  trace: function () {
    var args = [this.TRACE];
    this.log.apply(this, args.concat(arguments));
  }
}

module.exports = {
  setLogger: setLogger,
  getLogger: getLogger
};
