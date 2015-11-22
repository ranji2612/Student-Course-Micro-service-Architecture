var amqp = require('amqplib');
var basename = require('path').basename;
var all = require('when').all;

var keys=["courseDrop"];

var studentLogic  = require('./../logic/studentFunctionality');


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
        console.log(msg.fields.routingKey);
        console.log(msg.content.toString());
        data = JSON.parse(msg.content.toString());
        console.log('Course dropped - ',data);
        if (msg.fields.routingKey == "courseDrop") {
            //All students who have enrolled in that course
            var matchCondition = {"enrolled":{$in:[data.callNo]}};
            var updateData = {$pull:{"enrolled":data.callNo}};
            var options = {'multi':true};
            //Call update Logic to make the update to hold ref-integ
            studentLogic.updateStudent(undefined,updateData,matchCondition,null,null,options);
        }
    }
  });
}).then(null, console.warn);
