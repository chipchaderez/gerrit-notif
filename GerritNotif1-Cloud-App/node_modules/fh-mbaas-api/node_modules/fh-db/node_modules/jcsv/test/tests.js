var jcsv = require ('../index.js'),
assert = require('assert'),
data = require('./data.json');

jcsv(data, { separator : ',', newline : ";\n", headers : true }, function(err, res){
  assert.ok(!err);
  assert.ok(typeof res === "string");
  console.log(res);
  var resStr = ['a,b,c,d,e,f;', '1,2,,,,;', '3,4,5,,,;', '6,7,8,true,"string",[object Object];'];
  assert.ok(res === resStr.join('\n') + '\n');
  console.log("Tests passed ok!");
});
