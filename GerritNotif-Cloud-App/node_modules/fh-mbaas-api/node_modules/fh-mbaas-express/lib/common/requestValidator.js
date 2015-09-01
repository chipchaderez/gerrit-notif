
module.exports = function(request){

  return {
    "forms": {
      "getForm" : function(cb){
        var params = {};

        //Get the content body for normal parameters
        var reqParameters = request.params;

        if(!reqParameters.formId){
          return cb(new Error("No formId in request to getForm"));
        }

        if(!reqParameters.appId){
          return cb(new Error("No appId in request to getForm"));
        }

        params.appClientId = reqParameters.appId;
        params._id = reqParameters.formId;

        return cb(undefined, params);
      },
      "getForms" : function(cb){
        var params = {};

        //Get the content body for normal parameters
        var reqParameters = request.params;

        if(!reqParameters.appId){
          return cb(new Error("No appId in request to getForm"));
        }

        params.appClientId = reqParameters.appId;

        //All the parameters that are needed are present. //submission built
        return cb(undefined, params);
      },
      "getConfig" : function(cb){
        var params = {};

        //Get the content body for normal parameters
        var reqParameters = request.params;

        if(!reqParameters.appId){
          return cb(new Error("No appId in request to getConfig"));
        }
        
        if(!reqParameters.deviceId){
          return cb(new Error("No deviceId in request to getConfig"));
        }

        params.deviceId = reqParameters.deviceId;
        params.appClientId = reqParameters.appId;

        return cb(undefined, params);
      },
      "getTheme" : function(cb){
        var params = {};

        //Get the content body for normal parameters
        var reqParameters = request.params;

        if(!reqParameters.appId){
          return cb(new Error("No appId in request to getForm"));
        }

        params.appClientId = reqParameters.appId;
        //All the parameters that are needed are present. //submission built
        return cb(undefined, params);
      },
      "submitFormData" : function(cb){
        var params = {};

        //Get the content body for normal parameters
        var reqParameters = request.params;
        var reqBody = request.body || {};

        if(!reqParameters.formId){
          return cb(new Error("No formId in request to submitFormData"));
        }

        if(!reqParameters.appId){
          return cb(new Error("No appId in request to getForm"));
        }

        params.appClientId = reqParameters.appId;
        params.submission = reqBody; //-- body of the post request is the content of the form.
        params.submission.deviceIPAddress = this.getIPofClient();

        //All the parameters that are needed are present. //submission built
        return cb(undefined, params);
      },
      "submitFormFileBase64" : function(cb){
        this.submitFormFile(function(err, ok){
          if(err){
            return cb(err);
          }

          ok.submission.decodeBase64 = true;
          return cb(err, ok);
        });
      },
      "submitFormFile" : function(cb){
        var params = {};
        params.submission = {};

        //Get the content body for normal parameters
        var reqParameters = request.params;
        var filesInRequest = request.files;

        if(!reqParameters.submitId){
          return cb(new Error("No sumbission id specified for submitFormFile"));
        }

        if(!reqParameters.fileId){
          return cb(new Error("No file id specified for submitFormFile"));
        }

        if(!reqParameters.fieldId){
          return cb(new Error("No field id specifed for submitFormFile"));
        }


        if(!filesInRequest){
          return cb(new Error("No files submitted for submitFormFile"));
        }

        if(!reqParameters.appId){
          return cb(new Error("No appId in request to getForm"));
        }

        params.appClientId = reqParameters.appId;
        //All requried parameters exist, build the submission request.

        params.submission.submissionId = reqParameters.submitId;
        params.submission.fileId = reqParameters.fileId;
        params.submission.fieldId = reqParameters.fieldId;

        for(var fileEntry in filesInRequest){
          params.submission.fileStream = filesInRequest[fileEntry].path;
          params.submission.fileName = filesInRequest[fileEntry].name;// In this case, the name is the hash name "filePlaceHolder325346234234634646"
        }

        return cb(undefined, params);
      },
      "getSubmissionStatus" : function(cb){
        var params = {};

        //Get the content body for normal parameters
        var reqParameters = request.params;

        if(!reqParameters.submitId){
          return cb(new Error("No submission id specified for getSubmissionStatus"));
        }

        if(!reqParameters.appId){
          return cb(new Error("No appId in request to getForm"));
        }

        params.appClientId = reqParameters.appId;
        params.submission = {};
        params.submission.submissionId = reqParameters.submitId;

        return cb(undefined, params);
      },
      "getSubmission" : function(cb){
        var params = {};

        var reqParameters = request.params;

        if(!reqParameters.submitId){
          return cb(new Error("No submission id specified for getSubmission"));
        }

        if(!reqParameters.appId){
          return cb(new Error("No app id specified for getSubmission"));
        }


        params.submissionId = reqParameters.submitId;
        params.appClientId = reqParameters.appId;

        return cb(undefined, params);
      },
      "getSubmissionFile": function(cb){
        var params = {};

        var reqParameters = request.params;

        if(!reqParameters.submitId){
          return cb(new Error("No submissionId specified for getSubmissionFile"));
        }

        if(!reqParameters.fileGroupId){
          return cb(new Error("No file Id specified for getSubmissionFile"));
        }

        params._id = reqParameters.fileGroupId;

        return cb(undefined, params);
      },
      "completeSubmission" : function(cb){
        var params = {};

        //Get the content body for normal parameters
        var reqParameters = request.params;

        if(!reqParameters.submitId){
          return cb(new Error("No submission id specified for completeSubmission"));
        }

        if(!reqParameters.appId){
          return cb(new Error("No appId in request to getForm"));
        }

        params.appClientId = reqParameters.appId;
        params.submission = {};
        params.submission.submissionId = reqParameters.submitId;

        return cb(undefined, params);
      },
      "getIPofClient" : function () {
        var ret =  "nonset"; // default value

        if (request.headers && request.headers['x-forwarded-for']) {
          ret = request.headers['x-forwarded-for'];  // this may be a comma seperated list of addresses added by proxies and load balancers
        } else if (request.connection && request.connection.remoteAddress) {
          ret = request.connection.remoteAddress;
        }

        return ret;
      }
    }
  }
}