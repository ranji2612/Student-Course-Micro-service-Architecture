#!/usr/bin/env node

var amqp = require('amqplib');
var basename = require('path').basename;
var all = require('when').all;
var http = require('http');
var request = require("request");

/*var keys = process.argv.slice(2);
if (keys.length < 1) {
  console.log('Usage: %s pattern [pattern...]',
              basename(process.argv[1]));
  process.exit(1);
}*/

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
    var keys=["enroll","waitlist","unenroll","unwaitlist"];
      return all(keys.map(function(rk) {
        ch.bindQueue(queue, ex, rk);
      })).then(function() { return queue; });
    });

    ok = ok.then(function(queue) {
      return ch.consume(queue, logMessage, {noAck: true});
    });
    return ok.then(function() {
      console.log(' [*] Waiting for logs. To exit press CTRL+C.');
    });

    function logMessage(msg) {
      console.log(" [x] %s:'%s'",
                  msg.fields.routingKey,
                  msg.content.toString());
          var sms=msg.content.toString();
        var sms_json=JSON.parse(sms);
        console.log(sms_json);
        console.log("UNI:"+sms_json.uni);
        for(call in sms_json.callNo){
        console.log(sms_json.callNo[call]);

        //console.log(sms_json.callNo[0]);
        var pat="/api/"+msg.fields.routingKey+"/"+sms_json.callNo[call]+"/"+sms_json.uni.toString();
                    var options = {
            host: 'localhost',
            path: pat,
            port: 9082,
            method: 'PUT'
            };

            var callback = function(response) {
            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function(chunk) {
            str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function() {
            console.log(str);
            });
            };

            http.request(options, callback).end();

          }
      }
  });
}).then(null, console.warn);
