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
  lastUpdated :   1
};

var courseLogic  = require('./../logic/courseFunctionality');
var messagingQueue = require('./queuePushMessage');

//--- For schema change and validation
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

    * @apiSuccess {Date}  lastupdated  Timestamp of Last Update
    */

    //CRUD for Courses
    app.get('/api/course', function(req, res) {
        courseLogic.getAllCourses(res, validCourseSchema);
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

    * @apiSuccess {Date}  lastupdated  Timestamp of Last Update

    * @apiError CourseNotFound   The <code>callNo</code> of the Course was not found.
    *
    * @apiErrorExample Response (example):
    *     HTTP/1.1 401 No Course
    *     {
    *       "error": "Course does not exist"
    *     }
    */
    app.get('/api/course/:callno', function(req, res) {
        courseLogic.getCourse(res, validCourseSchema, req.params.callNo);
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

     * @apiSuccess {Date}  lastupdated  Timestamp of Last Update
     *
    */

    app.post('/api/course', function(req, res) {
        var newCourse=dropInvalidSchema(req.body);
        newCourse['lastUpdated']=new Date();
        courseLogic.createCourse(res, newCourse)
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
    app.put('/api/course/:callNo', function(req, res) {
        console.log(req.body);
        var updated=req.body.updatedData;
        var newdate=new Date();
        updated['lastUpdated']=newdate;

        courseLogic.updateCourse(res,{$set:updated},req.params.callNo);
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
    app.delete('/api/course/:callNo', function(req, res) {
        courseLogic.removeCourse(res, req.params.callNo);
        
        //Course is deleted So push to queue to take care of ref integ
        // {'enrolled':{$in:['sr']}},{$pull:{"enrolled":"sr"}},{'multi':true}
        messagingQueue.pushToQueue("courseDrop",{callNo:req.params.callNo});
    });

    /**
     * @api {put} /api/enroll/:callNo/:uni Enroll a student in a course
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
    app.put('/api/course/:callNo/student/:uni', function(req,res){
        console.log(req.body);
        var updated = {$set:{'lastUpdated':new Date()},$push:{'enrolled':req.params.uni}};
        courseLogic.updateCourse(res,updated,req.params.callNo);
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
    app.delete('/api/course/:callNo/student', function(req, res) {
        //UnEnroll Multiple students at a time
        var students = req.body.students;
        var updateData = {$set:{'lastUpdated':new Date()},$pull:{'enrolled':{$in : students }}};

        courseLogic.updateCourse(res, updateData, req.params.callNo);
        //Pushing to Queue
        messagingQueue.pushToQueue("unenroll")
    });

    /**
    API for slective delete
    */

    app.delete('/api/course/:callNo/student/:uni', function(req, res) {
        var updateData = {$set:{'lastUpdated':new Date()},$pull:{'enrolled':req.params.uni}};

        courseLogic.updateCourse(res, updateData, req.params.callNo);
    });

    //-------------------- API for LOGS --------------------------
    app.get('/api/course/log/:time', function(req,res) {
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
    app.post('/api/admin/course',function(req,res){

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
