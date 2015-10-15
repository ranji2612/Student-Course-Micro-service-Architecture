//Importing Data Models
var Student = require('./../models/student');


module.exports = function(app) {
	
    //CRUD for student
    app.get('/api/getStudents', function(req, res) {
        Student.find({}, function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
    
    app.get('/api/getStudent/:uni', function(req, res) {
        Student.find({uni : req.params.uni}, function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
    
    app.post('/api/createStudent', function(req, res) {
        console.log(req.body);
        
        Student.create({firstName:req.body.firstName, lastName:req.body.lastName, dob : new Date(req.body.dob), enrolled:req.body.enrolled,waitListed:req.body.waitListed}, function(err, data) {
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
    
    //ADMIN APIs
    
    //DataModel Changes API
    
    
    //Rest all requests
	app.get('/*', function(req, res){
		
		res.sendfile('public/html/home.html');	
		
	});
	
};
