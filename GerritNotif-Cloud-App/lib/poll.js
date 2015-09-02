var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var db = require('./db.js');
var request = require('request');

function pollRoute() {
    var poll = new express.Router();
    poll.use(cors());
    poll.use(bodyParser());

    // POST REST endpoint - note we use 'body-parser' middleware above to parse the request body in this route.
    // This can also be added in application.js
    // See: https://github.com/senchalabs/connect#middleware for a list of Express 4 middleware
    poll.post('/', function (req, res) {
        console.log(new Date(), 'In poll route POST / req.body=', req.body);
        var username = req.body.gerrit_username;
        db.get(username, function (err, userdata) {
            if (!userdata) {
                // try again next poll
                return;
            }
            console.log(new Date(), 'userdata:', userdata);
            var gerrit_server = userdata.gerrit_server;
            var notifications = userdata.notifications;

            var url = "http://" + gerrit_server + "/changes/?q=owner:" + username + "&o=LABELS&n=10";
            var changes = userdata.changes || [];
            console.log("url: " + url);
            request.get(url, function (error, response, body) {
                if (error) {
                     console.log("Encountered an error: " + error);
                     res.json({msg: error.message, changes: changesToNotify});
                     return;
                }
                var newChanges = JSON.parse(body.slice(4));
                console.log("body:" + JSON.stringify(changes));

                var changesToNotify = getChangesToNotify(changes, newChanges, notifications);

                // store changes in db
                userdata.changes = newChanges;
                db.put({key: username, value: userdata}, function (err, userdata) {
                    console.log(new Date(), 'userdata:', userdata);
                });

                res.json({msg: 'success', changes: changesToNotify});
            });
        });
    });

    return poll;
}

function getChangesToNotify(changes, newChanges, notifications) {
    var changesToNotify = [];
    var idToScoreMap = [];
    var idToStatusMap = [];
    var idToUpdatedMap = [];

    var isNotificationEnabled = false;
    if (notifications.indexOf("score") != -1 ||
    notifications.indexOf("updated") != -1 || 
    notifications.indexOf("status") != -1) {
      console.log("notification was enabled");
      isNotificationEnabled = true;
    }

    if (isNotificationEnabled) {
        changes.forEach(function(change) {
          if (notifications.indexOf("score") != -1) {
            console.log("notification enabled for score");
            idToScoreMap[change.id] = getScoreByChange(change);
          }
          if (notifications.indexOf("updated") != -1) {
            console.log("notification enabled for updated patch");
            idToUpdatedMap[change.id] = change["updated"];
          }
          if (notifications.indexOf("status") != -1) {
            console.log("notification enabled for status");
            idToStatusMap[change.id] = change["status"];
          }
      });

      newChanges.forEach(function(newChange) {
          var changeScore = idToScoreMap[newChange.id];
          var newChangeScore = getScoreByChange(newChange);
          var showUpdated = true;
          if (changeScore != null && changeScore != newChangeScore) {
            console.log("new score has been updated");
            newChange.score = newChangeScore;
            changesToNotify.push(newChange);
            showUpdated = false;
          }
          var changedStatus = idToStatusMap[newChange.id];
          var newChangeStatus = newChange["status"];
          if (changedStatus != null && changedStatus != newChangeStatus) {
            console.log("Status " + changedStatus + " has been updated to " + newChangeStatus);
            newChange.newStatus = newChangeStatus;
            changesToNotify.push(newChange);
            showUpdated = false;
          }
          var changedUpdated = idToUpdatedMap[newChange.id];
          var newChangeUpdated = newChange["updated"];
          if (showUpdated && changedUpdated != null && changedUpdated != newChangeUpdated) {
            console.log("Patch has been updated at " + newChangeUpdated);
            newChange.newUpdated = newChangeUpdated.slice(0,19);
            changesToNotify.push(newChange);
          }
      });
    }

    return changesToNotify;
}

function getScoreByChange(change) {
    var codeReview = change["labels"]["Code-Review"];
    console.log("Maor : " + codeReview);
    if (codeReview["approved"])
        return 2;
    else if (codeReview["rejected"])
        return -2;
    else if (codeReview["value"])
        return codeReview["value"];
    else
        return 0;
}

console.log('start server');
module.exports = pollRoute;
