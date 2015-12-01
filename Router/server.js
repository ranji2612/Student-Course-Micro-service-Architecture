var http = require('http'),
        httpProxy = require('http-proxy');

//// Create your proxy server and set the target in the options.
var proxy = httpProxy.createProxyServer({});

//
//// Listen for the `proxyRes` event on `proxy`.
////
proxy.on('proxyRes', function (proxyRes, req, res) {
    
    //console.log(res);
  
});
proxy.on('error', function(err,req,res) {
     res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end("{'error':'Server Instance is not found'}");
});

server = http.createServer(function(req,res) {
    
    //By Default student Instance 1
	var target = {target : 'http://localhost:9001'};
  
    var reqUrl = req.url.slice(1).split('/');
    
    //Based on the Last name, select the corresponding instance
    //      A-I  -  Student Instance 1
    //      J-Q  -  Student Instance 2
    //      R-Z  -  Student Instance 3
    if (reqUrl.length > 2 && reqUrl[0]==='api') {
        console.log('Its an api call'); 
        
        if(reqUrl[1]=='course') {
            //---- Routing Course ----
            
            console.log('Routing to Course');
            target = {target : 'http://localhost:9082'};
            
        } else if (reqUrl[1]=='student') {
            //---- Routing Student
           
            //Convert to Lower case to make it simpler
            var lastNameLetter = reqUrl[2][1].toLowerCase();
            console.log('First Letter of Last Name ',lastNameLetter);
            //      A-I  -  Student Instance 1
            if ( lastNameLetter >= 'a' && lastNameLetter <= 'i' ) {
                console.log('Navigating to Server 1');
                target = {target : 'http://localhost:9001'};
            }
            if ( lastNameLetter >= 'j' && lastNameLetter <= 'q' ) {
                console.log('Navigating to Server 2');
                target = {target : 'http://localhost:9002'};
            }
            if ( lastNameLetter >= 'r' && lastNameLetter <= 'z' ) {
                console.log('Navigating to Server 3');
                target = {target : 'http://localhost:9003'};
            }
        } else {
            //Its an api call but invalid
            res.end("{'error':'Bad Request'}");
            
        }
    } else {
        //Its an api call but invalid
        res.end("{'error':'Bad Request'}");

    }
    
    proxy.proxyRequest(req, res, target);
});

//Starting the server
console.log('Starting the Router to server studentInstances');
server.listen(8000);
