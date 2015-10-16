//Importing Data Models
var Course = require('./../models/course');

//Schema that is changeable by admin
var validCourseSchema = {
  name  :   1,
  section  :   1,
  callNo     :   1,
  instructor      :   1,
  year    :   1,
  semester : 1,
  max : 1,
  currentEnroll : 1,
  enrolled : 1,
  waitlisted  :   1,
  lastUpdated :   1
};

function dropInvalidSchema(inputJson){
  for(key in inputJson) {
    if(!(key in validCourseSchema))
      delete inputJson[key];
  }
  return inputJson;
};



module.exports = function(app) {
//-----------------------------------------------
    //CRUD for Courses
    app.get('/api/getCourses', function(req, res) {
        Course.find({}, validCourseSchema,function(err, data) {
            if (err) res.send(err);

            res.json(data);
        });
    });

    app.get('/api/getCourses/:callNo', function(req, res) {
        Course.find({callNo : req.params.callNo}, validCourseSchema,function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });

    app.post('/api/createCourse', function(req, res) {
        console.log(req.body);

        var newCourse=dropInvalidSchema(req.body);
        newCourse['lastUpdated']=new Date();

        Course.create(newCourse,function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });

    app.put('/api/updateCourse/:callNo', function(req, res) {
      console.log(req.body);
      var updated=req.body.updatedData;
      var newdate=new Date();
      updated['lastUpdated']=newdate;
      Course.update({callNo: req.params.callNo}, {$set: updated} ,function(err, data2) {
          if(err) res.send(err);


          res.json(data2);
        });


    });

    app.delete('/api/deleteCourse/:callNo', function(req, res) {

      console.log(req.body);

      Course.remove({callNo:req.params.callNo},function(err,removed){
          if(err) res.send(err);

          res.json(removed);

      });


    });


    app.put('/api/enroll/:callNo/:uni', function(req,res){
      console.log(req.body);
        Course.update({callNo:req.params.callNo},{$set:{'lastUpdated':new Date()},$push:{'enrolled':req.params.uni}},function(err,data){

                if(err) res.send(err);

                else
                res.json(data);
        });
    });


    app.put('/api/waitlist/:callNo/:uni', function(req,res){
      console.log(req.body);
        Course.update({callNo:req.params.callNo},{$set:{'lastUpdated':new Date()},$push:{'waitlisted':req.params.uni}},function(err,data){

                if(err) res.send(err);

                else
                res.json(data);
        });
    });



//---------------------ADMIN APIs---------------------

//--------------------DataModel Changes API---------------------

app.post('/api/admin/Courseschema',function(req,res){

  validCourseSchema = req.body.newSchema;
  res.send(200);

});

    //Rest all requests
	app.get('/*', function(req, res){

		res.sendfile('public/html/home.html');

	});

};
