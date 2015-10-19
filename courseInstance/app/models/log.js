

var mongoose = require('mongoose');
var Schema=mongoose.Schema;

var LogSchema = new Schema({},{strict:false});

module.exports=mongoose.model('Log',LogSchema);
