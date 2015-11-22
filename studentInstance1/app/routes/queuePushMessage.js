var amqp = require('amqplib');
var when = require('when');

module.exports =  {
    pushToQueue : function (key, message) {
        amqp.connect('amqp://localhost').then(function(conn) {
          return when(conn.createChannel().then(function(ch) {
            var ex = 'topic_logs';
            var ok = ch.assertExchange(ex, 'topic', {durable: false});
            return ok.then(function() {
                //message = JSON.parse(message);
              ch.publish(ex, key, new Buffer(message));
              console.log(" [x] Sent %s:'%s'", key, message);
              return ch.close();
            });
          })).ensure(function() { conn.close(); })
        }).then(null, console.log);
    }
};
