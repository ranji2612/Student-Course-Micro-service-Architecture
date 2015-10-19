

var mongoose = require('mongoose');
var Schema=mongoose.Schema;

//Schema made linent - for changes during run time by admin
var RefSchema = new Schema({},{strict: false});

module.exports=mongoose.model('Ref',RefSchema);
