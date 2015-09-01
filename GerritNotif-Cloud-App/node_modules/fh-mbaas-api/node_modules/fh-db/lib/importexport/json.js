exports.importer = function(file, cb){
  if (file instanceof Buffer){
    file = file.toString();
  }
  var jsonDataArray;
  try{
    jsonDataArray = JSON.parse(file);
  }catch(err){
    return cb('JSON Parsing: ' + err.toString());
  }
  return cb(null, jsonDataArray);
};

exports.exporter = function(collection, cb){
  var stringified;
  try{
    stringified = JSON.stringify(collection);
  }catch(err){
    return cb(err);
  }
  return cb(null, stringified);
}
