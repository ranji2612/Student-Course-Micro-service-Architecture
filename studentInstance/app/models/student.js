

var mongoose = require('mongoose');
var Schema=mongoose.Schema;

var StudentSchema = new Schema({
        firstName  :   String,
        lastName   :   String,
        uni         :   String,
        dob         :   Date,
        enrolled    :   Array,
        waitlisted  :   Array,
        lastUpdated :   Date
    });

module.exports=mongoose.model('Student',StudentSchema);
    