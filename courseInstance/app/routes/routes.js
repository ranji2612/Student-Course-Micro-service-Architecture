//Importing Data Models
var Course = require('./../models/course');


module.exports = function(app) {

    //CRUD for Course
    app.get('/api/getCourses', function(req, res) {
        Course.find({}, function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });

    app.get('/api/getCourses/:callNo', function(req, res) {
        Course.find({callNo : req.params.callNo}, function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });

    app.post('/api/createCourse', function(req, res) {
        console.log(req.body);

        Course.create({name:req.body.name, section:req.body.section, callNo:req.body.callNo,instructor:req.body.instructor,year : req.body.year, semester:req.body.semester, max:req.body.max, currentEnroll : req.body.currentEnroll, enrolled : req.body.enrolled, waitlisted : req.body.waitlisted,  lastUpdated : new Date(req.body.lastUpdated)} ,function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });

    app.put('/api/updateCourse/:callNo', function(req, res) {
      console.log(req.body);
        
      Course.update({callNo: req.params.callNo}, {'$set': req.body.updatedData} ,function(err, data2) {
          if(err) ers.send(err);

          res.json(data2);
        });


    });

    app.delete('/api/deleteCourse/:callNo', function(req, res) {

    });

    //ADMIN APIs

    //DataModel Changes API


    //Rest all requests
	app.get('/*', function(req, res){

		res.sendfile('public/html/home.html');

	});

};
