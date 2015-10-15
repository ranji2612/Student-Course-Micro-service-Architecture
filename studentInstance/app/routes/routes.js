//Importing Data Models

var Student = require('./../models/student');

//Seeded Schema changable by admin
var validStudentSchema = {
        firstName   : 1,
        lastName    : 1,
        uni         : 1,
        dob         : 1,
        enrolled    : 1,
        waitlisted  : 1
};

function dropInvalidSchema(inputJson) {
    for (key in inputJson) {
        if (!(key in validStudentSchema))
            delete inputJson[key];
    }
    return inputJson;
};

module.exports = function(app) {
	
    //--------------------------------------CRUD for student--------------------------------------
    app.get('/api/getStudents', function(req, res) {
        
        Student.find({},validStudentSchema, function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
    
    app.get('/api/getStudent/:uni', function(req, res) {
        Student.find({uni : req.params.uni},validStudentSchema, function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
    
    app.post('/api/createStudent', function(req, res) {
        var newStudent = dropInvalidSchema(req.body);
        newStudent['lastUpdated'] = new Date();
        
        Student.create(newStudent, function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
    
    app.put('/api/updateStudent/:uni', function(req, res) {
        //Data to be updated
        var newData = req.body.updatedData;
        newData['lastUpdated'] = new Date();
        
        Student.update({uni:req.params.uni},{$set: newData }, function(err,data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
    
    app.delete('/api/deleteStudent/:uni', function(req, res) {
        Student.remove({uni:req.params.uni}, function(err,data) {
            if(err) res.send(err);
            res.json(data);
        });
    });
    
    //----------------------------Course Enrollment--------------------------------------
    // Enroll in one / group of course
    app.put('/api/enroll/:uni', function(req, res) {
        var courses = req.body.courses;
        Student.update({uni:req.params.uni},{$set:{'lastUpdated':new Date()},$pushAll : {'enrolled':courses}}, function(err, data) {
            if(err) res.send(err);
            res.json(data);
        });
    });
    
    //Waitlist in one/group of course
    app.put('/api/waitlist/:uni', function(req, res) {
        var courses = req.body.courses;
        Student.update({uni:req.params.uni},{$set:{'lastUpdated':new Date()},$pushAll : {'waitlisted':courses}}, function(err, data) {
            if(err) res.send(err);
            res.json(data);
        });
    });
    
    //Un-enroll from one / more course
    app.put('/api/dropcourse/:uni', function(req, res) {
        var courses = req.body.courses;
        Student.update({uni:req.params.uni},{$set:{'lastUpdated':new Date()},$pull : {'enrolled': { $in : courses}}}, function(err, data) {
            if(err) res.send(err);
            res.json(data);
        });
    });
    
    //Remove from one/more waitlisted course
    app.put('/api/unwaitlist/:uni', function(req, res) {
        var courses = req.body.courses;
        Student.update({uni:req.params.uni},{$set:{'lastUpdated':new Date()},$pull : {'waitlisted': { $in : courses}}}, function(err, data) {
            if(err) res.send(err);
            res.json(data);
        });
    });
    //---------------------------- ADMIN APIs ----------------------------
    
    //----------------------------DataModel Changes API----------------------------
    app.post('/api/admin/schema', function(req,res) {
        validStudentSchema = req.body.newSchema;
        res.send(200);
    });
    
    //Rest all requests
	app.get('/*', function(req, res){
		
		res.sendfile('public/html/home.html');	
		
	});
	
};
