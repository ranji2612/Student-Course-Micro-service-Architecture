//Importing Data Models
var Course = require('./../models/course');
var Log = require('./../models/log');
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

var validLogSchema = {

  uni : 1,
  change : 1,
  callNo : 1

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
       /**
 * @api {get} /api/getCourses Read all Courses
 * @apiVersion 0.3.0
 * @apiName GetCourses
 * @apiGroup Courses
 * @apiPermission admin
 *
 *
 * @apiSuccess {String}   name    Name of Course
 * @apiSuccess {String}   section Course Section
 * @apiSuccess {String}   callNo  Course Call Number
 * @apiSuccess {String}   instructor Name of Instructor
 * @apiSuccess {String}   year  Year
 * @apiSuccess {String}   semester Semester in which course is offered
 * @apiSuccess {String}   max Maximum number of students permitted
 * @apiSuccess {String}   currentenroll Number of students currently enrolled
  * @apiSuccess {String[]} enrolled     List of Students enrolled
  * @apiSuccess {String[]} waitlisted  List of Students Waitlisted
  * @apiSuccess {Date}  lastupdated  Timestamp of Last Update
 */
    //CRUD for Courses
    app.get('/api/getCourses', function(req, res) {
        Course.find({}, validCourseSchema,function(err, data) {
            if (err) res.send(err);

            res.json(data);
        });
    });
   /**
 * @api {get} api/getCourses/:callNo Read data of a particular course
 * @apiVersion 0.3.0
 * @apiName GetCourse
 * @apiGroup Courses
 * @apiPermission admin
 *
 *
 * @apiParam {String} callNo Call Number of the course
 *

 * @apiSuccess {String}   name    Name of Course
 * @apiSuccess {String}   section Course Section
 * @apiSuccess {String}   callNo  Course Call Number
 * @apiSuccess {String}   instructor Name of Instructor
 * @apiSuccess {String}   year  Year
 * @apiSuccess {String}   semester Semester in which course is offered
 * @apiSuccess {String}   max Maximum number of students permitted
 * @apiSuccess {String}   currentenroll Number of students currently enrolled
  * @apiSuccess {String[]} enrolled     List of Students enrolled
  * @apiSuccess {String[]} waitlisted  List of Students Waitlisted
  * @apiSuccess {Date}  lastupdated  Timestamp of Last Update

 * @apiError CourseNotFound   The <code>callNo</code> of the Course was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Course
 *     {
 *       "error": "Course does not exist"
 *     }
 */
    app.get('/api/getCourses/:callNo', function(req, res) {
        Course.find({callNo : req.params.callNo}, validCourseSchema,function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
    /**
 * @api {post} /api/createCourse Create a new Course
 * @apiVersion 0.3.0
 * @apiName PostCourse
 * @apiGroup Courses
 * @apiPermission none
 *
 * @apiSuccess {String}   name    Name of Course
 * @apiSuccess {String}   section Course Section
 * @apiSuccess {String}   callNo  Course Call Number
 * @apiSuccess {String}   instructor Name of Instructor
 * @apiSuccess {String}   year  Year
 * @apiSuccess {String}   semester Semester in which course is offered
 * @apiSuccess {String}   max Maximum number of students permitted
 * @apiSuccess {String}   currentenroll Number of students currently enrolled
  * @apiSuccess {String[]} enrolled     List of Students enrolled
  * @apiSuccess {String[]} waitlisted  List of Students Waitlisted
  * @apiSuccess {Date}  lastupdated  Timestamp of Last Update
 *
  */

    app.post('/api/createCourse', function(req, res) {
        console.log(req.body);

        var newCourse=dropInvalidSchema(req.body);
        newCourse['lastUpdated']=new Date();

        Course.create(newCourse,function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
/**
 * @api {put} /api/updateCourse/:callNo Change a Course
 * @apiVersion 0.3.0
 * @apiName PutCourse
 * @apiGroup Courses
 * @apiPermission none
 *
 * @apiParam {String} callNo Call number of the course
 *

 * @apiError CourseNotFound   The <code>callNo</code> of the Course was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Course
 *     {
 *       "error": "Course does not exist"
 *     }
 */
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
/**
 * @api {delete} /api/deleteCourse/:callNo Delete a Course
 * @apiVersion 0.3.0
 * @apiName DeleteCourse
 * @apiGroup Courses
 * @apiPermission none
 *
 * @apiParam {String} callNo Call number of the course
 * @apiError CourseNotFound   The <code>callNo</code> of the Course was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Course
 *     {
 *       "error": "Course does not exist"
 *     }

 */
    app.delete('/api/deleteCourse/:callNo', function(req, res) {

      console.log(req.body);

      Course.remove({callNo:req.params.callNo},function(err,removed){
          if(err) res.send(err);

          res.json(removed);

      });


    });

/**
 * @api {put} /api/enroll/:callNo/:uni Waitlist a student in a course
 * @apiVersion 0.3.0
 * @apiName PutEnroll
 * @apiGroup Courses
 * @apiPermission none
 *
 * @apiParam {String} callNo Call number of the course
 * @apiParam {String} uni   UNI of the student
 *
 * @apiError CourseNotFound   The <code>callNo</code> of the Course was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Course
 *     {
 *       "error": "Course does not exist"
 *     }

 */
    app.put('/api/enroll/:callNo/:uni', function(req,res){
      console.log(req.body);


        Course.update({callNo:req.params.callNo},{$set:{'lastUpdated':new Date()},$push:{'enrolled':req.params.uni}},function(err,data){

                if(err) res.send(err);




                  Log.create({uni:req.params.uni,changes:"enrolled",callNo:req.params.callNo,updatedAt: new Date()});

                res.json(data);

        });






    });

/**
 * @api {put} /api/waitlist/:callNo/:uni Waitlist a student in a course
 * @apiVersion 0.3.0
 * @apiName PutWaitlist
 * @apiGroup Courses
 * @apiPermission none
 *
 * @apiParam {String} callNo Call number of the course
 * @apiParam {String} uni   UNI of the student
 *
 * @apiError CourseNotFound   The <code>callNo</code> of the Course was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Course
 *     {
 *       "error": "Course does not exist"
 *     }
 */
    app.put('/api/waitlist/:callNo/:uni', function(req,res){
      console.log(req.body);
        Course.update({callNo:req.params.callNo},{$set:{'lastUpdated':new Date()},$push:{'waitlisted':req.params.uni}},function(err,data){

                if(err) res.send(err);

                Log.create({uni:req.params.uni,changes:"waitlisted",callNo:req.params.callNo,updatedAt: new Date()});
                res.json(data);
        });
    });
/**
 * @api {delete} /api/dropEnroll/:callNo Remove students enrolled from a course
 * @apiVersion 0.3.0
 * @apiName DeleteEnroll
 * @apiGroup Courses
 * @apiPermission none
 *
 * @apiParam {String} callNo Call number of the course
 *
 * @apiError CourseNotFound   The <code>callNo</code> of the Course was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Course
 *     {
 *       "error": "Course does not exist"
 *     }
 */
    app.delete('/api/dropEnroll/:callNo', function(req, res) {

      var students = req.body.students;

      console.log(req.body);

      Course.update({callNo:req.params.callNo},{$set:{'lastUpdated':new Date()},$pull:{'enrolled':{$in : students }}},function(err,removed){
          if(err) res.send(err);

          for (var i = 0; i < students.length; i++)
          {


            Log.create({uni:students[i],changes:"dropped",callNo:req.params.callNo,updatedAt: new Date()});
          }

          res.json(removed);

      });


    });
/**
 * @api {delete} /api/dropWaitlist/:callNo Drop from waitlist one or more students
 * @apiVersion 0.3.0
 * @apiName DeleteWaitlist
 * @apiGroup Courses
 * @apiPermission none
 *
 * @apiParam {String} callNo Call number of the course
 *
 * @apiError CourseNotFound   The <code>callNo</code> of the Course was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Course
 *     {
 *       "error": "Course does not exist"
 *     }
 */
    app.delete('/api/dropWaitlist/:callNo', function(req, res) {

      var students = req.body.students;

      console.log(req.body);

      Course.update({callNo:req.params.callNo},{$set:{'lastUpdated':new Date()},$pull:{'waitlisted':{$in : students }}},function(err,removed){
          if(err) res.send(err);

          for (var i = 0; i < students.length; i++)
          {

            Log.create({uni:students[i],changes:"dropWaitlisted",callNo:req.params.callNo,updatedAt: new Date()});

          }



          res.json(removed);

      });


    });

//-------------------- API for LOGS --------------------------
app.get('/api/logs/:time', function(req,res) {
    Log.find({}, function(err, data) {
        if (err) res.send(err);
        res.json(data);
    });
});

//---------------------ADMIN APIs---------------------

//--------------------DataModel Changes API---------------------
    /**
 * @api {post} /api/admin/Courseschema Effect Data Model changes
 * @apiVersion 0.3.0
 * @apiName PostDrop
 * @apiGroup Admin
 * @apiPermission Admin
 *
 * @apiSuccess 200

 *

 */
    app.post('/api/admin/Courseschema',function(req,res){

      validCourseSchema = req.body.newSchema;
      res.send(200);

    });

    //Serve API Docs
	app.get('/apidocs', function(req, res){

		res.sendfile('docs/index.html');

	});
    //Send error message for any other requests
    app.get('/*', function(req, res){

		res.json({"error":"Invalid Request"});

	});

};
