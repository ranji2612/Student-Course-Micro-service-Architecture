var http = require('http'),
        httpProxy = require('http-proxy');

//// Create your proxy server and set the target in the options.
var proxy = httpProxy.createProxyServer({});

//
//// Listen for the `proxyRes` event on `proxy`.
////
proxy.on('proxyRes', function (proxyRes, req, res) {
  console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
  if (req.method == 'GET' && req.url=='/api/getStudents')
	console.log('Yes this is good');
});

server = http.createServer(function(req,res) {
	console.log(req);
	var target = {target : 'http://localhost:8080'};
	proxy.proxyRequest(req, res, target);
});
server.listen(8000);

