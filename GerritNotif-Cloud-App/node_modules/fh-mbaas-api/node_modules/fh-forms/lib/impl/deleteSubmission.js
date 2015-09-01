var models = require('../common/models.js')();

/*
 * deleteSubmission(connections, options, appId, cb) *
 *   connections: {
 *     mongooseConnection: ...
 *     databaseConnection: ... *   }
 *
 *   options: {
 *     uri: db connection string,
 *   }
 *   params: {
 *     _id: submission ID of submission to retrieve
 *   }
 *   cb - callback function (err)
  */
module.exports = function deleteSubmission(connections, options, params, cb) {
  var formSubmissionModel = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);

  formSubmissionModel
  .findOne({"_id" : params._id})
  .remove()
  .exec(cb);
};
