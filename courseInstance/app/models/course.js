

var mongoose = require('mongoose');
var Schema=mongoose.Schema;

var CourseSchema = new Schema({},{strict:false});

module.exports=mongoose.model('Course',CourseSchema);
