var FeedhenryReporting = require('fh-reportingclient');

/**
 Creates a message with format which is either sent to the messaging server and the backup log or if failes then
 just the backup log
 **/

//expects {topic:""} plus
function sendReport(opts) {
  if('object' !== typeof opts){
    return;
  }
  //process.env.FH_MESSAGING_ENABLED set as a string
  if(process.env.FH_MESSAGING_ENABLED !== "true"){
    return;
  }
  process.nextTick(function () {
    var topic = opts.topic || "notopic",
    logMessageURL = process.env.FH_MESSAGING_SERVER,
    report;
    switch (topic) {
      case "fhact":
        report = createFHActReport(opts);
        break;
      case "fhweb":
        report = createFHWebReport(opts);
        break;
      default:
        report = createFHActReport(opts);
        break;
    }

    // bugfix 3102: make realtime sending configurable
    var realTimeLoggingEnabled = false;
    if (process.env.FH_MESSAGING_REALTIME_ENABLED && (process.env.FH_MESSAGING_REALTIME_ENABLED === 'true' ||
    process.env.FH_MESSAGING_REALTIME_ENABLED === true)) {
      realTimeLoggingEnabled = true;
    }
    
    if (process.env.OPENSHIFT_FEEDHENRY_REPORTER_IP){
      logMessageURL = 'http://' + process.env.OPENSHIFT_FEEDHENRY_REPORTER_IP + ':' + process.env.OPENSHIFT_FEEDHENRY_REPORTER_PORT;
      logMessageURL += '/sys/admin/reports/TOPIC';
    }

    var msgconfig = {
      host:process.env.FH_MESSAGING_HOST,
      cluster:process.env.FH_MESSAGING_CLUSTER,
      msgServer: {
        logMessageURL: logMessageURL
      },
      backupFiles: {
        fileName: process.env.FH_MESSAGING_BACKUP_FILE
      },
      recoveryFiles: {
        fileName: process.env.FH_MESSAGING_RECOVERY_FILE
      },
      realTimeLoggingEnabled: realTimeLoggingEnabled
    };
    var msg;

    try {
      if (report) { //if no report could be made nothing is logged. This can only happen if no options obj sent
        msg = new FeedhenryReporting.Reporting(msgconfig);
        msg.logMessage(topic, report, function (err, results) {
        });
      }
    } catch (e) {
      //asuming we don't want anything to break if reporting failes
    }
  });
};


function createFHActReport (opts) {
  var report ={};
  if (opts.hasOwnProperty('fullparams')) {
    var fullparams = opts.fullparams;
    var  _fh = fullparams.__fh || {};
    var  ip = fullparams.ipAddress || "";

    //report body
    report = {
      guid:process.env.FH_INSTANCE,
      appid:process.env.FH_WIDGET,
      domain:process.env.FH_DOMAIN,
      bytes:fullparams.bytes,
      cached:false,
      cuid:_fh.cuid || "",
      destination:_fh.destination || "",
      agent: fullparams.agent,
      'function':fullparams.funct || "",
      ipAddress:ip,
      scriptEngine:"node",
      'status':fullparams.status || "",
      time:fullparams.time || 0,
      startTime : fullparams.start,
      endTime : fullparams.end,
      'version':_fh.version || 0};
  }
  return report;
}

function createFHWebReport (opts) {
  return {
    guid:process.env.FH_INSTANCE,
    appid:process.env.FH_WIDGET,
    cuid:"",
    bytes:opts.bytes || 0,
    conns:0,
    destination:opts.destination || "",
    domain:process.env.FH_DOMAIN,
    ipAddress:"",
    referrer:"",
    start:opts.start || 0,
    status:opts.status || 0,
    time:opts.time || 0,
    url:opts.url || "",
    version:0
  };
}

exports.createFHWebReport = createFHWebReport;
exports.createFHActReport = createFHActReport;
exports.sendReport = sendReport;
