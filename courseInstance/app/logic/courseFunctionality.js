var Course = require('./../models/course');
var Log = require('./../models/log');

// Has all the business Logic.

module.exports =  {
    createCourse  : function(res, newCourse) {
        Course.create(newCourse,function(err, data) {
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
    
    getCourse : function(res, validCourseSchema, callNo) {
        Course.find({callNo : callNo}, validCourseSchema,function(err, data) {
            if (err) {
                if (typeof(res)==="undefined")
                    return err;
                else
                    res.send(err);
            }
            data = data[0];
            if (typeof(res)==="undefined")
                return data;
            else
                res.json(data);
        });
    },
    
    updateCourse : function(res, updated, callNo) {
        Course.update({callNo: callNo}, updated ,function(err, data) {
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
    
    removeCourse : function(res, callNo) {
        Course.remove({callNo:req.params.callNo},function(err,data){
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
    
    getAllCourses : function(res, validCourseSchema) {
        Course.find({},function(err, data) {
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
    }
};