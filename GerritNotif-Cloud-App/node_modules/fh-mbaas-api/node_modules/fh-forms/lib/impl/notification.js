var logger = require('../common/logger.js').getLogger();
var amqpService = require('./amqpservice.js');
var _ = require('underscore');
var amqp;
var amqpManager;
var formEventListeners = [];

exports.constants = {
  FORM_EVENT_SUBMISSION_STARTED: "submissionStarted",
  FORM_EVENT_SUBMISSION_COMPLETED: "submissionComplete"
}

var HOST_PLACEHOLDER = "--#host#--";

exports.registerEventListener = function(listener){
  //Don't want duplicate versions of an event object to be present. Prevents accidently calling the event twice.
  formEventListeners.push(listener);
  formEventListeners = _.uniq(formEventListeners);
};

exports.deregisterListener = function(listener){
  formEventListeners = _.without(formEventListeners, listener);
};

//Emitting a form event for the user to listen for in the $fh.forms cloud API.
exports.emitFormEvent = function(event, eventParams){
  _.each(formEventListeners, function(formEventListener){
    formEventListener.emit(event, eventParams);
  });
};

exports.initNotifications = function (cb) {
  if(amqp) return cb();
  if(!amqpManager) {
    amqpManager = amqpService();
  }
  amqpManager.startUp(function (err, pamqp) {
    if(err) return cb(err);
    amqp = pamqp;
    return cb();
  });
};

exports.disconnect = function (cb) {
  if(amqp) {
    amqp.disconnect();
  }
  return cb();
};

var FH_EVENT_SUBMISSION_RECEIVED = "fh.appforms.submissions.submission-received";

exports.sendNotification = function sendNotification(connections, completeStatus, cb) {
  var options = {_id: completeStatus.formSubmission.formId};

  require('./getNotifications.js')(connections, options, function (err, subscribers) {
    if (err) return cb(err);

    logger.trace('sendNotification() - subscribers: ', subscribers);
    if(subscribers && subscribers.subscribers && subscribers.subscribers.length > 0) {
      var addresses = subscribers.subscribers.join(',');
      var msg = buildSubmissionReceivedMessage(addresses, subscribers.formName, completeStatus.formSubmission);
      logger.debug('sending submission notification message to: ' + addresses + ', for submissionid: ' + msg.formId);
      logger.trace('submission notification for submissionid: ' + msg.formId + ', message: ' + JSON.stringify(msg));

      amqp.publishMessage(FH_EVENT_SUBMISSION_RECEIVED, msg);
    }

    return cb();
  });
};

exports.buildSubmissionReceivedMessage = buildSubmissionReceivedMessage; // export for tests
function buildSubmissionReceivedMessage(subscribers, formName, formSubmission) {
  var msg = {};
  msg.subscribers = subscribers;
  msg.formId = formSubmission.formId;
  msg.appId = formSubmission.appId;
  msg.attachmentUrl = getAttachmentUrl(formSubmission._id);
  msg.formName = formName || "UNKNOWN FORM NAME";
  msg.submissionStatus = formSubmission.status;
  msg.appEnvironment = formSubmission.appEnvironment;
  msg.submissionStarted = formSubmission.submissionStartedTimestamp;
  msg.submissionCompleted = formSubmission.submissionCompletedTimestamp;
  msg.submissionId = formSubmission._id;
  msg.deviceIPAddress = formSubmission.deviceIPAddress;
  msg.deviceId = formSubmission.deviceId;
  msg.submittedFields = [];

  subFields = formSubmission.formFields;
  for(var i =0; i< subFields.length; i+=1) {
    var subField = "";
    subField = subFields[i].fieldId.name + ": ";
    for (var j=0; j<subFields[i].fieldValues.length; j += 1) {
      if(j!==0) {
        subField += ", ";
      }
      subField += getStringValue(subFields[i].fieldValues[j], subFields[i].fieldId.type);
    }
    msg.submittedFields.push(subField);
  }
  return msg;
}

function getAttachmentUrl(id) {
  return HOST_PLACEHOLDER + '/api/v2/forms/submission/' + id + '.pdf';
}

function getStringValue(valueObj, type) {
  // if photo/file/sig return URL
  if (["photo", "signature", "file"].indexOf(type) >= 0) {
    return HOST_PLACEHOLDER + "/api/v2/forms/submission/file/" + valueObj.groupId;
  }

  if ("checkboxes" === type) {
    if (valueObj.selections) {
      return "(" + valueObj.selections.join(',') + ")";
    }
    else {
      return "()";
    }
  }

  if (["location", "locationMap"].indexOf(type) >= 0) {
    if (valueObj.lat) {
      return "(" + valueObj.lat + ',' + valueObj.long + ")";
    } else if (valueObj.zone) {
      return "(" + valueObj.zone + ' ' + valueObj.eastings + ', ' + valueObj.northings + ")";
    }
    else {
      return JSON.stringify(valueObj);
    }
  }

  if ("object" === typeof valueObj) {  // should only be strings left at this point, leaving thsi here to catch newly added field types in the future
      return JSON.stringify(valueObj);
  }

  // TOTO if checkbox return selections
  return valueObj.toString();
}
