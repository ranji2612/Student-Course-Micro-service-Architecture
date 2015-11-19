var amqp = require('amqplib');
var basename = require('path').basename;
var all = require('when').all;

var keys=["enroll","unenroll"];
    
var courseLogic  = require('./../logic/courseFunctionality');


amqp.connect('amqp://localhost').then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {
    var ex = 'topic_logs';
    var ok = ch.assertExchange(ex, 'topic', {durable: false});
    
    ok = ok.then(function() {
      return ch.assertQueue('', {exclusive: true});
    });
    
    ok = ok.then(function(qok) {
      var queue = qok.queue;
      return all(keys.map(function(rk) {
        ch.bindQueue(queue, ex, rk);
      })).then(function() { return queue; });
    });
    
    ok = ok.then(function(queue) {
      return ch.consume(queue, logMessage, {noAck: true});
    });
    return ok.then(function() {
      console.log(' [*] Listening to Queue related to courses');
    });
    
    function logMessage(msg) {
        
        data = JSON.parse(msg.content.toString());
        if (msg.fields.routingKey == "enroll") {
            console.log('Enrolling the Student '+ data.uni + ' in courses ' +data.callNo);
            for ( var i in data.callNo) {
                var updated = {$set:{'lastUpdated':new Date()},$push:{'enrolled':data.uni}};
                courseLogic.updateCourse(undefined,updated,data.callNo[i]);
            }
        }
        else if (msg.fields.routingKey == "unenroll") {
            console.log('Un-Enrolling the Student '+ data.uni + ' in courses ' +data.callNo);
            for ( var i in data.callNo) {
                var updateData = {$set:{'lastUpdated':new Date()},$pull:{'enrolled':data.uni}};
                courseLogic.updateCourse(undefined,updated,data.callNo[i]);
            }
        }
    }
  });
}).then(null, console.warn);