var amqp = require('amqplib');
var when = require('when');

//Importing Data Models

var Student = require('./../models/student');
var Log = require('./../models/log');
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
   /**
 * @api {get} /api/getStudents Read all students
 * @apiVersion 0.3.0
 * @apiName GetStudents
 * @apiGroup Student
 * @apiPermission admin
 *
 *
 * @apiSuccess {String}   firstname     First Name of Student
 * @apiSuccess {String}   lastname      Last Name of Student
 * @apiSuccess {String}   uni           UNI of Student
 * @apiSuccess {Date}     dob           Date of Birth of Student
 * @apiSuccess {String[]} enrolled     List of Courses enrolled.
  * @apiSuccess {String[]} waitlisted  List of Waitlisted courses.
 */
    app.get('/api/getStudents', function(req, res) {

        Student.find({},validStudentSchema, function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
    /**
 * @api {get} api/getStudent/:uni Read data of a student
 * @apiVersion 0.3.0
 * @apiName GetStudent
 * @apiGroup Student
 * @apiPermission admin
 *
 *
 * @apiParam {String} uni The UNI of student.
 *
 * @apiSuccess {String}   firstname     First Name of Student
 * @apiSuccess {String}   lastname      Last Name of Student
 * @apiSuccess {String}   uni           UNI of Student
 * @apiSuccess {Date}     dob           Date of Birth of Student
 * @apiSuccess {String[]} enrolled     List of Courses enrolled.
  * @apiSuccess {String[]} waitlisted  List of Waitlisted courses.
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Student
 *     {
 *       "error": "Student does not exist"
 *     }
 */

    app.get('/api/getStudent/:uni', function(req, res) {
        Student.find({uni : req.params.uni},validStudentSchema, function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
/**
 * @api {post} /api/createStudent/:uni Create a new Student
 * @apiVersion 0.3.0
 * @apiName PostStudent
 * @apiGroup Student
 * @apiPermission none
 *
 * @apiParam {String} uni UNI of the Student
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiSuccess {String}   firstname     First Name of Student
 * @apiSuccess {String}   lastname      Last Name of Student
 * @apiSuccess {String}   uni           UNI of Student
 * @apiSuccess {Date}     dob           Date of Birth of Student
 * @apiSuccess {String[]} enrolled     List of Courses enrolled.
  * @apiSuccess {String[]} waitlisted  List of Waitlisted courses.
 *
  */
    app.post('/api/createStudent/:uni', function(req, res) {
        var newStudent = dropInvalidSchema(req.body);
        newStudent['lastUpdated'] = new Date();

        Student.create(newStudent, function(err, data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
/**
 * @api {put} /api/updateStudent/:uni Change a Student
 * @apiVersion 0.3.0
 * @apiName PutStudent
 * @apiGroup Student
 * @apiPermission none
 *
 * @apiParam {String} uni UNI of the Student
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Student
 *     {
 *       "error": "Student does not exist"
 *     }
 */
    app.put('/api/updateStudent/:uni', function(req, res) {
        //Data to be updated
        var newData = req.body.updatedData;
        newData['lastUpdated'] = new Date();

        Student.update({uni:req.params.uni},{$set: newData }, function(err,data) {
            if (err) res.send(err);
            res.json(data);
        });
    });
/**
 * @api {delete} /api/deleteStudent/:uni Delete a student
 * @apiVersion 0.3.0
 * @apiName DeleteStudent
 * @apiGroup Student
 * @apiPermission none
 *
 * @apiParam {String} uni UNI of the Student
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Student
 *     {
 *       "error": "Student does not exist"
 *     }
 */
    app.delete('/api/deleteStudent/:uni', function(req, res) {

      Student.findOne({uni:req.params.uni},function(er,data1){
//console.log(data1);
var str= JSON.parse(JSON.stringify(data1), function(k, v) {
  //console.log(v); // log the current property name, the last is "".
  return v;       // return the unchanged property value.
});
          //console.log("Enrolled:"+str["enrolled"]);
          
          var enrolled_courses=" ";
          if(str["enrolled"])
          enrolled_courses = str["enrolled"];
          var waitlisted_courses=" ";
          if(str["waitlisted"])
          waitlisted_courses=str["waitlisted"];
          console.log("Enrolled Courses:" + enrolled_courses);
          console.log("Waitlisted Courses:" + waitlisted_courses);
          if(enrolled_courses!=" ")
          Log.create({uni:req.params.uni,changes:"unenroll",callNo:enrolled_courses});
          if(waitlisted_courses!=" ")
          Log.create({uni:req.params.uni,changes:"unwaitlist",callNo:waitlisted_courses});
                  amqp.connect('amqp://localhost').then(function(conn) {
                  return when(conn.createChannel().then(function(ch) {
                  var ex = 'topic_logs';
                  var ok = ch.assertExchange(ex, 'topic', {durable: false});
                    return ok.then(function() {
              if(enrolled_courses!=" "){
                        var key="unenroll";
              var message='{"uni":"'+req.params.uni+'","callNo":'+JSON.stringify(enrolled_courses)+'}';
              ch.publish(ex, key, new Buffer(message));
              console.log(" [x] Sent %s:'%s'", key, message);}
                      if(waitlisted_courses!=" "){  
              var key="unwaitlist";
              var message='{"uni":"'+req.params.uni+'","callNo":'+JSON.stringify(waitlisted_courses)+'}';
              ch.publish(ex, key, new Buffer(message));
              console.log(" [x] Sent %s:'%s'", key, message);}
              return ch.close();
            });
          })).ensure(function() { conn.close(); })
        }).then(null, console.log);
          Student.remove({uni:req.params.uni}, function(err,data) {
            if(err) res.send(err);
            res.json(data);
        });
} );   
        
    });

    //----------------------------Course Enrollment--------------------------------------
/**
 * @api {put} /api/enroll/:uni Enroll a student in Course/Group of course
 * @apiVersion 0.3.0
 * @apiName PutEnroll
 * @apiGroup Student
 * @apiPermission none
 *
 * @apiParam {String} uni UNI of the Student
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Student
 *     {
 *       "error": "Student does not exist"
 *     }
 */
    // Enroll in one / group of course
    app.put('/api/enroll/:uni', function(req, res) {
        var courses = req.body.courses;
        Student.update({uni:req.params.uni},{$set:{'lastUpdated':new Date()},$pushAll : {'enrolled':courses}}, function(err, data) {
            if(err) res.send(err);
            if(courses)
            {
            Log.create({uni:req.params.uni,changes:"enroll",callNo:courses});
             amqp.connect('amqp://localhost').then(function(conn) {
                  return when(conn.createChannel().then(function(ch) {
                  var ex = 'topic_logs';
                  var ok = ch.assertExchange(ex, 'topic', {durable: false});
                    return ok.then(function() {
                    var key="enroll";
                    var message='{"uni":"'+req.params.uni+'","callNo":'+JSON.stringify(courses)+'}';
              ch.publish(ex, key, new Buffer(message));
              console.log(" [x] Sent %s:'%s'", key, message);
              return ch.close();
            });
          })).ensure(function() { conn.close(); })
        }).then(null, console.log);
            
            
            
            
            
            }
            res.json(data);
        });
    });
/**
 * @api {put} /api/waitlist/:uni Place student in waitlist
 * @apiVersion 0.3.0
 * @apiName PutWaitlist
 * @apiGroup Student
 * @apiPermission none
 *
 * @apiParam {String} uni UNI of the Student
 *
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Student
 *     {
 *       "error": "Student does not exist"
 *     }
 */
    //Waitlist in one/group of course
    app.put('/api/waitlist/:uni', function(req, res) {
        var courses = req.body.courses;
        Student.update({uni:req.params.uni},{$set:{'lastUpdated':new Date()},$pushAll : {'waitlisted':courses}}, function(err, data) {
                        if(err) res.send(err);
            if(courses)
            {
            Log.create({uni:req.params.uni,changes:"waitlist",callNo:courses});
             amqp.connect('amqp://localhost').then(function(conn) {
                  return when(conn.createChannel().then(function(ch) {
                  var ex = 'topic_logs';
                  var ok = ch.assertExchange(ex, 'topic', {durable: false});
                    return ok.then(function() {
                    var key="waitlist";
                    var message='{"uni":"'+req.params.uni+'","callNo":'+JSON.stringify(courses)+'}';
              ch.publish(ex, key, new Buffer(message));
              console.log(" [x] Sent %s:'%s'", key, message);
              return ch.close();
            });
          })).ensure(function() { conn.close(); })
        }).then(null, console.log);
            }
            res.json(data);
        });
    });
/**
 * @api {put} /api/dropcourse/:uni Un-Enroll from one or many courses
 * @apiVersion 0.3.0
 * @apiName PutDrop
 * @apiGroup Student
 * @apiPermission none
 *
 * @apiParam {String} uni UNI of the Student
 *
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Student
 *     {
 *       "error": "Student does not exist"
 *     }
 */
    //Un-enroll from one / more course
    app.put('/api/dropcourse/:uni', function(req, res) {
        var courses = req.body.courses;
        if(courses)
        {
        Log.create({uni:req.params.uni,changes:"unenroll",callNo:courses});
        amqp.connect('amqp://localhost').then(function(conn) {
                  return when(conn.createChannel().then(function(ch) {
                  var ex = 'topic_logs';
                  var ok = ch.assertExchange(ex, 'topic', {durable: false});
                    return ok.then(function() {
                    var key="unenroll";
                    var message='{"uni":"'+req.params.uni+'","callNo":'+JSON.stringify(courses)+'}';
              ch.publish(ex, key, new Buffer(message));
              console.log(" [x] Sent %s:'%s'", key, message);
              return ch.close();
            });
          })).ensure(function() { conn.close(); })
        }).then(null, console.log);
            
            
        }
        Student.update({uni:req.params.uni},{$set:{'lastUpdated':new Date()},$pull : {'enrolled': { $in : courses}}}, function(err, data) {
            if(err) res.send(err);
            res.json(data);
        });
    });
/**
 * @api {put} /api/unwaitlist/:uni Drop from waitlist one or more courses
 * @apiVersion 0.3.0
 * @apiName PutUnwaitlist
 * @apiGroup Student
 * @apiPermission none
 *
 * @apiParam {String} uni UNI of the Student
 *
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Student
 *     {
 *       "error": "Student does not exist"
 *     }
 */
    //Remove from one/more waitlisted course
    app.put('/api/unwaitlist/:uni', function(req, res) {
        var courses = req.body.courses;
        if(courses)
        {
        Log.create({uni:req.params.uni,changes:"unwaitlist",callNo:courses});
         amqp.connect('amqp://localhost').then(function(conn) {
                  return when(conn.createChannel().then(function(ch) {
                  var ex = 'topic_logs';
                  var ok = ch.assertExchange(ex, 'topic', {durable: false});
                    return ok.then(function() {
                    var key="unwaitlist";
                    var message='{"uni":"'+req.params.uni+'","callNo":'+JSON.stringify(courses)+'}';
              ch.publish(ex, key, new Buffer(message));
              console.log(" [x] Sent %s:'%s'", key, message);
              return ch.close();
            });
          })).ensure(function() { conn.close(); })
        }).then(null, console.log);         
            
            
        }
        Student.update({uni:req.params.uni},{$set:{'lastUpdated':new Date()},$pull : {'waitlisted': { $in : courses}}}, function(err, data) {
            if(err) res.send(err);
            res.json(data);
        });
    });
    //---------------------------- ADMIN APIs ----------------------------

    //----------------------------DataModel Changes API----------------------------
    /**
 * @api {post} /api/admin/schema Effect Data Model changes
 * @apiVersion 0.3.0
 * @apiName PutDrop
 * @apiGroup Admin
 * @apiPermission Admin
 *
 * @apiSuccess 200
 *
 */
    app.post('/api/admin/schema', function(req,res) {
        validStudentSchema = req.body.newSchema;
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