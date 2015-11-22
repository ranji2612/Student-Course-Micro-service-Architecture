var Student = require('./../models/student');
var Log = require('./../models/log');

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

    updateStudent : function(res, updateData, searchCondition,options) {
        if (typeof(options)==="undefined")
            options = {multi:false};
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

    removeStudent : function() {
    },

    getAllStudents : function(res, validStudentSchema) {
        //Reusing the existing logic
        this.getStudent(res,validStudentSchema,{});
    }
};
