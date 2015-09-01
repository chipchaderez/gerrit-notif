var headersUtils = require('./headers');
module.exports = function(response){


  return {
    "forms": {
      "getForm" : function(responseContent){
        this.respondJSON(responseContent);
      },
      "getForms" : function(responseContent){
        this.respondJSON(responseContent);
      },
      "getTheme" : function(responseContent){
        this.respondJSON(responseContent);
      },
      "submitFormData" : function(responseContent){
        this.respondJSON(responseContent);
      },
      "submitFormFile" : function(responseContent){
        this.respondJSON(responseContent);
      },
      "getSubmissionStatus" : function(responseContent){
        this.respondJSON(responseContent);
      },
      "getSubmission": function(responseContent){
        this.respondJSON(responseContent);
      },
      "getSubmissionFile": function(responseContent){
        //This contains an object describing the file stream
        var headers = headersUtils({"Cache-Control": "no-cache", "Content-Type": "application/json"});
        if(responseContent.stream){
          headers["Content-Type"] = responseContent.type;//Setting the file content type. Mime types are set by the file handler.
          headers["Transfer-Encoding"] = "chunked";
          headers["Content-Length"] = responseContent.length;
          response.writeHead(200, headers);
          responseContent.stream.pipe(response);
          responseContent.stream.resume();//Unpausing the stream as it was paused by the file handler
        } else {
          this.respondError(404, "File not found");
        }
      },
      "completeSubmission" : function(responseContent){
        this.respondJSON(responseContent);
      },
      "getConfig" : function(responseContent){
        this.respondJSON(responseContent);
      },
      "respondJSON" : function(responseContent){
        var headers = headersUtils({"Cache-Control": "no-cache", "Content-Type": "application/json"});

        response.writeHead(200, headers);
        response.end(JSON.stringify(responseContent));
      },
      "respondError" : function(errCode, errorMessage){
        var headers = headersUtils({"Cache-Control": "no-cache", "Content-Type": "application/json"});
        var error = {
          "message":errorMessage,
          "code":errCode
        };
        response.writeHead(errCode, headers);
        response.end(JSON.stringify(error));
      }
    }
  }
}