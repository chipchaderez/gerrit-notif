var fhamqpjs = require('fh-amqp-js');
var util = require('util');

var amqpManager;

var fh_amqp_exchange_appforms = "fh-appforms";
var retAmqp = {
  "FH_EXCHANGE": fh_amqp_exchange_appforms
};


var fh_amqp_cluster_node_pattern = "amqp://{{user}}:{{pass}}@{{nodes}}/{{vhost}}";

function isDefinedStr(param) {
  return (typeof param !== 'undefined') && (param !== null) && (param.length > 0);
}

module.exports = function () {
  var fh_amqp_enabled = process.env.FH_AMQP_APP_ENABLED || false;
  var fh_amqp_user = process.env.FH_AMQP_USER;
  var fh_amqp_pass = process.env.FH_AMQP_PASS;
  var fh_amqp_nodes = process.env.FH_AMQP_NODES;
  var fh_amqp_conn_max = process.env.FH_AMQP_CONN_MAX;
  var fh_amqp_vhost = process.env.FH_AMQP_VHOST;
  var fh_forms_notifications_enabled = process.env.FH_APPFORMS_NOTIFICATIONS_ENABLED;

  var fh_amqp_cluster_node;
  var fh_amqp_cluster_nodes = [
  ];
  if ("true" === fh_amqp_enabled &&
    isDefinedStr(fh_amqp_user) &&
    isDefinedStr(fh_amqp_pass) &&
    isDefinedStr(fh_amqp_nodes) &&
    isDefinedStr(fh_amqp_conn_max) &&
    isDefinedStr(fh_amqp_vhost)
  ) {
    var nodes = fh_amqp_nodes.split(",");
    for(var i=0; i < nodes.length; i++){
      fh_amqp_cluster_node = fh_amqp_cluster_node_pattern.
        replace('{{user}}', fh_amqp_user).
        replace('{{pass}}', fh_amqp_pass).
        replace('{{nodes}}', nodes[i]).
        replace('{{vhost}}', fh_amqp_vhost);
      fh_amqp_cluster_nodes.push(fh_amqp_cluster_node);
    }

  }



  var amqpConfig = 
  {
    "enabled": fh_amqp_enabled,
    "clusterNodes": fh_amqp_cluster_nodes,
    "maxReconnectAttempts": fh_amqp_conn_max
  };

  var self = {
    "startUp": function (cb){
      //once amqpManager is in place connections to the cluster should be handled by fh-amqp-js
      if ("true" === fh_amqp_enabled && "true" === fh_forms_notifications_enabled) {
        if (! amqpManager) {
          amqpManager = new fhamqpjs.AMQPManager(amqpConfig);
          amqpManager.connectToCluster();
          //set up singleton obj
          retAmqp.amqpManager = amqpManager;

          retAmqp.publishMessage = function(topic, message){
            if(amqpConfig.enabled && amqpManager){

              amqpManager.publishTopic(fh_amqp_exchange_appforms, topic, message, function(err){
                if (err) console.error("amqp:" + util.inspect(err));
              });
            }
          };

          /**
           * disconnect
           */
          retAmqp.disconnect = function(){
            if(amqpManager && amqpManager.disconnect){
              try{
                amqpManager.disconnect(); 
              }catch(e){
                console.warn('error when disconnect amqp: ' + util.inspect(e));
              }
            }
          };

          amqpManager.on("error", function(err){
            console.warn("amqp: AMQP connection failed: " + util.inspect(err));
          });

          amqpManager.on("ready", function(){
            console.info('amqp: AMQP connected');
          });
        }
        return cb(undefined,retAmqp);
      } else { 
        // fh_amqp_enabled === false
        return cb(undefined, {
          publishMessage: function(){},
          disconnect: function(){}
        });
      }
    },

    "getAmqpManager": function (){
      if(amqpConfig.enabled === true &&  ! amqpManager){
        throw {"message":"amqpservice.startUp has not been called","code":503,"name":"MissingService"};
      }
      return retAmqp;
    }
  };
  return self;

};
