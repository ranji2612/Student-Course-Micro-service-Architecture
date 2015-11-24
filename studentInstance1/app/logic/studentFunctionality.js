var Student = require('./../models/student');
var Log = require('./../models/log');
var amqp = require('amqplib');
var when = require('when');
var messagingQueue = require('./../routes/queuePushMessage');

// Has all the business Logic.

module.exports =  {
    createStudent  : function(res, newStudent) {
      Student.create(newStudent,function(err, data) {
          if (err) {
              if (typeof(res)==="undefined")
                  return err;
              else
                  res.send(err);
          }
          if (typeof(res)==="undefined")
              return data;
          else
              res.json(data);
      });
    },

    getStudent : function(res, validStudentSchema, searchCondition) {
        Student.find(searchCondition,validStudentSchema,function(err, data) {
            if (err) {
                if (typeof(res)==="undefined")
                    return err;
                else
                    res.send(err);
            }
            if (typeof(res)==="undefined")
                return data;
            else
                res.json(data);
        });
    },

    updateStudent : function(res, updateData, searchCondition,msg,key,options) {
        
        if (typeof(options)==="undefined")
            options = {multi:false};
        if(msg)
        {
        var message=msg;
        messagingQueue.pushToQueue(key,message);
        }  
        Student.update(searchCondition,updateData,options, function(err,data) {
            if (err) {
                if (typeof(res)==="undefined")
                    return err;
                else
                    res.send(err);
            }
            if (typeof(res)==="undefined")
                return data;
            else
                res.json(data);
        });
    },

    removeStudent : function(res,uni) {
            Student.findOne({uni:uni},function(er,data1){
      //console.log(data1);
      var str= JSON.parse(JSON.stringify(data1), function(k, v) {
        //console.log(v); // log the current property name, the last is "".
        return v;       // return the unchanged property value.
      });
                //console.log("Enrolled:"+str["enrolled"]);

                var enrolled_courses=" ";
                if(str["enrolled"])
                enrolled_courses = str["enrolled"];
                          console.log("Enrolled Courses:" + enrolled_courses);

                if(enrolled_courses!=" ")
                {
                Log.create({uni:uni,changes:"unenroll",callNo:enrolled_courses});
                var message='{"uni":"'+uni+'","callNo":'+JSON.stringify(enrolled_courses)+'}';
              messagingQueue.pushToQueue("unenroll",message);
                }

                Student.remove({uni:uni}, function(err,data) {
                  if(err) res.send(err);
                  res.json(data);
              });
            });
  },
    getAllStudents : function(res, validStudentSchema) {
        //Reusing the existing logic
        this.getStudent(res,validStudentSchema,{});
    }
};
