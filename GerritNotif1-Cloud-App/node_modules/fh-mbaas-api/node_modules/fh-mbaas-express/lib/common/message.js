var messaging_enabled = process.env.FH_AMQP_APP_ENABLED;
var messaging_user = process.env.FH_AMQP_USER;
var message_pass = process.env.FH_AMQP_PASS;
var messaging_nodes =   process.env.FH_AMQP_NODES;
var messaging_max_cons = process.env.FH_AMQP_CONN_MAX || 10;
var messaging_vhost = process.env.FH_AMQP_VHOST;
var messaging_exchange ="fh-events";
var amqpManager;
var retAmqp;


module.exports = function (){
  //first time requed set up singletons
  function connect(cb){
    if (messaging_enabled && messaging_enabled !== "false" && ! retAmqp) {
      var clusterNodes = [];
      var nodes = (messaging_nodes && messaging_nodes.split) ? messaging_nodes.split(",") : [];
      var vhost = "";
      if(messaging_vhost && messaging_vhost.trim() !== "/"){
        vhost = messaging_vhost.trim();
        if(vhost.indexOf("/") !== 0){
          vhost = "/" + vhost;
        }
      }
      for(var i=0; i < nodes.length; i++){
        var node = nodes[i].trim();
        node = "amqp://"+messaging_user+":"+message_pass+"@"+node+vhost;
        clusterNodes.push(node);
      }


      var conf = {
        "enabled": messaging_enabled,
        "clusterNodes": clusterNodes,
        "maxReconnectAttempts": messaging_max_cons
      };

      var amqpjs = require('fh-amqp-js');
      amqpManager = new amqpjs.AMQPManager(conf);
      amqpManager.connectToCluster();
      amqpManager.on('ready', function(){
        console.info('amqp connected');
      });
      amqpManager.on("error", function(err){
        console.warn('amqp error', err);
      });
      
      var retObj = {};
      retObj["createErrorMessage"] = function (err){
        err = err || {};
        return {
          "uid": process.env.FH_INSTANCE,
          "timestamp": new Date().getTime(),
          "eventType": "CRASHED",
          "eventClass": "APP_STATE",
          "eventLevel": "ERROR",
          "domain": process.env.FH_DOMAIN,
          "appName":process.env.FH_APPNAME,
          "env": process.env.FH_ENV || "",
          "updatedBy":"System",
          "dyno": "",
          "details": {"message": "app crashed", "error": err.message, "stackTrace": err.stack}
        };
      };

      retObj["sendErrorMessage"] = function (err , cb){
        var message = retObj.createErrorMessage(err);
        amqpManager.publishTopic(messaging_exchange, "fh.events.nodeapp.app.crashed", message, function (err) {
          //ignore errors
          cb();
        });
      };

      cb(undefined,retObj);

    }else if(messaging_enabled && messaging_enabled !== "false" && retAmqp){
      cb(undefined,retAmqp);
    }else{
      cb({"message":"messaging not enabled","code":503});
    }
  }
  
  connect(function (er, conn){
     retAmqp = conn;
  });


  return {
    "getAmqp": function (cb){
      connect(cb);
    },
    "getAmqpManager": function (){
      return amqpManager;
    }
  };
};
