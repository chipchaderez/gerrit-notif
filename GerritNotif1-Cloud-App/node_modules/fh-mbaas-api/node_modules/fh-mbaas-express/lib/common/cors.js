var cors = require('cors');

var options = {
  'methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'credentials': true,
  //cache the preflight response for 1 days so that the browser will not make preflight request for every cloud call
  'maxAge': 60*60*24
  //do not specify headers. CORS module will then use the 'access-control-request-headers' header value from the request object. 
  //This way we don't need to update this module everytime when the client module adding new headers.
};

module.exports = function(){
  return cors(options);
};