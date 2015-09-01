module.exports = function (passed){

  return{
    "has": function (){
      var cb;
      var failed;

      if(!passed || ('object' !== typeof passed)){
        failed = {"message":"there were no params passed"};
      }
      for(var i=0; i<arguments.length; i++){
        if("function" === typeof arguments[i]){
          cb = arguments[i];
        }
        else if(passed && !passed.hasOwnProperty(arguments[i])){
          failed = (failed) ? failed : {"code":400};
          failed[arguments[i]]  = "missing param: " + arguments[i];
        }
      }
      if(failed && ! failed.message){
        failed.message = "validation failed";
      }
      cb(failed);
    },
    "hasno" : function (){
      var cb;
      var failed;
      for(var i=0; i<arguments.length; i++){
        if("function" === typeof arguments[i]){
          cb = arguments[i];
        }
        else if(passed.hasOwnProperty(arguments[i])){
          failed = (failed) ? failed : {"code":400};
          failed[arguments[i]]  = "param " + arguments[i] + "should not be present";
        }
      }
      if(failed && ! failed.message){
        failed.message = "params validation failed";
      }
      cb(failed);
    },
    "param":function (paramName){
      return {
        "is":function (type){
          return (passed.hasOwnProperty(paramName) && type === typeof passed[paramName]);
        }
      };
    }
  }
};
