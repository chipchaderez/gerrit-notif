jcsv
===

Simple node module for converting a json array [ {}, {} ] to CSV.


Usage (as a module)
===================

    var jcsv = require ('jcsv');
    var data = [
                  {
                    "a" : 1,
                    "b" : 2
                  },
                  {
                    "a" : 3,
                    "b" : 4,
                    "c" : 5
                  }
    ];

    jcsv(data, { separator : ',', newline : ";\n", headers : true }, function(err, csv){
      console.log(csv);
    });
