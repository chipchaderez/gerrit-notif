var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var db = require('./db.js');

function registerRoute() {
  var register = new express.Router();
  register.use(cors());
  register.use(bodyParser());

  // POST REST endpoint - note we use 'body-parser' middleware above to parse the request body in this route.
  // This can also be added in application.js
  // See: https://github.com/senchalabs/connect#middleware for a list of Express 4 middleware
  register.post('/', function(req, res) {
    console.log(new Date(), 'In register route POST / req.body=', req.body);
    var username = req.body.gerrit_username;
    var data = { gerrit_server: req.body.gerrit_server, interval: req.body.interval, notifications: req.body.notifications };
    db.put({key: username, value: data}, function (err, data) {
      console.log(new Date(), 'data:', data);
    });
    res.json({msg: 'success'});
  });

  return register;
}

module.exports = registerRoute;
