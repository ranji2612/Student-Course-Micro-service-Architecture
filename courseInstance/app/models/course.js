

var mongoose = require('mongoose');
var Schema=mongoose.Schema;

var CourseSchema = new Schema({
        name  :   String,
        section  :   String,
        callNo     :   String,
        instructor      :   String,
        year    :   Number,
        semester : String,
        max : Number,
        currentEnroll : Number,
        enrolled : Array,
        waitlisted  :   Array,
        lastUpdated :   Date
    });

module.exports=mongoose.model('Course',CourseSchema);
