module.exports = function(list, options, cb){
    if (!list || !(list instanceof Array)){
      return cb("List must be a list of JSON data")
    }

    var lineDelimiter = options.newline || "\n",
    separator = (typeof options.separator === "undefined") ? ',' : options.separator,
    drawHeaders = (typeof options.headers === "undefined") ? true : options.headers,
    csv = [],
    headers = [],
    row, key, i, idx, field;



    if (typeof options === "function"){
      cb = options;
    }
    if (typeof cb !== "function"){
      throw Error("No callback specified");
    }


    list.forEach(function(obj){
      row = [];
      for (key in obj){
        if (obj.hasOwnProperty(key)){
          idx = headers.indexOf(key);
          field = obj[key];
          if (idx===-1){
            idx = headers.push(key) - 1;
          }
          if (typeof field === "string"){
            field = '"' + field + '"';
          }
          row[(idx)] = field; // push and indexOf returns index+1, idx is idx-1
        }
      }
      csv.push(row);
    });

    // Only now can we guarantee we have all the headers, fill in the blanks with ,, stuff
    for (i=0; i<csv.length; i++){
      var r = csv[i];
      for (j=0; j<headers.length; j++){
        if (typeof r[j] === "undefined"){
          r[j] = "";
        }
      }
      csv[i] = r.join(separator);
    }


    if (drawHeaders){
      headers = headers.join(separator) + lineDelimiter;
    }else{
      headers = "";
    }
    csv = headers + csv.join(lineDelimiter) + lineDelimiter;
    return cb(null, csv);
};
