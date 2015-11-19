var amqp = require('amqplib');
var basename = require('path').basename;
var all = require('when').all;

var keys=["enroll","waitlist","unenroll","unwaitlist"];
    
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
      console.log(" [x] %s:'%s'",
                  msg.fields.routingKey,
                  msg.content.toString());
    }
  });
}).then(null, console.warn);