var async = require('async');
var reportingclient=require('fh-reportingclient');

var msg = new reportingclient.Reporting({host:"somehost",cluster:"development",msgServer: {logMessageURL: "https://somdomain.feedhenry.net/msg/TOPIC"}, backupFiles: {fileName: "/Users/mmurphy/src/work/fh-reportingclienttest/backup.log"}, recoveryFiles: {fileName: "/work/fh-reportingclienttest/recov.log"}});

async.forEachSeries(
  ["Hello World 1", "Hello World 2", "Hello World 3"],
  function (item, cb) {
    msg.logMessage("tester", {text: item}, function (err, results) {
      console.log("sent: " + item);
      console.log("err: " + JSON.stringify(err));
      async.forEachSeries(results, function (resultItem, callback) {
        console.log("handler: " + JSON.stringify(resultItem.handler) + ", status: " + JSON.stringify(resultItem.result.status));
        return callback();
      }, function () {
	cb(err);
      });
    });
  },
  function (err) {
    console.log("Finished.");
  });
