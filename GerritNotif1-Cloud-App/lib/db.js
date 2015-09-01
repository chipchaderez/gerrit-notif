var levelup = require('level');
// 1) Create our database, supply location and options.
// This will create or open the underlying LevelDB store.
var db = levelup('./mydb', { valueEncoding: 'json' });

module.exports = exports = {
    /*
     Puts a value into LevelDB Store then retrieves it
     @param params.key - the key to insert under
     @param params.value - the value to insert
     */
    put: function(params, cb) {
        db.put(params.key, params.value, function (err) {
            if (err){
                return cb(err);
            }
            // 3) fetch by key
            db.get(params.key, cb);
        })
    },

    get: function(key, cb) {
        db.get(key, cb);
    }
};