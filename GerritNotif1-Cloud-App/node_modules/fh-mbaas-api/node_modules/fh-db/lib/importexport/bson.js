var mongodb = require('mongodb'),
bson = mongodb.BSONPure;
exports.importer = function(data, cb) {
  // This is originally https://github.com/mongodb/js-bson/blob/master/lib/bson/bson.js#L1073-L1091, modified to work on arbitrary size streams
  var BSON = bson.BSON,
  index = 0,
  options = {},
  documents = [],
  doneProcessing = false;
  // Loop over all documents
  while(!doneProcessing) {
    // Find size of the document
    var size = data[index] | data[index + 1] << 8 | data[index + 2] << 16 | data[index + 3] << 24;
    // Update options with index
    options.index = index;
    // Parse the document at this point
    if (size === 0){
      doneProcessing = true;
    }else{
      try{
        documents.push(BSON.deserialize(data, options));
      }catch(err){
        return cb(err);
      }

      // Adjust index by the document size
      index += size;
    }
  }

  // Return object containing end index of parsing and list of documents
  return cb(null, documents);
};

exports.exporter = function(collection, cb){
  var BSON = bson.BSON,
  documentsAsBuffers = [],
  serialized;
  try{
    collection.forEach(function(doc){
      documentsAsBuffers.push(BSON.serialize(doc));
    });


    serialized = Buffer.concat(documentsAsBuffers);
  }catch(err){
    return cb(err);
  }
  return cb(null, serialized);
};
