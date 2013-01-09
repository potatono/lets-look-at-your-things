/**
 * Thing derivation hierarchy visualizer
 *
 * This simple app will show you how to integrate with the Thingiverse API.
 * Most of the server side work is in routes/index.js
 * Most of the client side work is in public/js/app.js
 * The frontend is in views/index.hjs 
 *
 * The authentication workflow goes like this:
 * 1.  Redirect the user to thingiverse oauth endpoint
 * 2.  The user approves and is redirected back here with a code
 * 3.  The backend sends a request for a token using the code and client secret
 * 4.  Thingiverse returns a token
 * 5.  The backend passes the token to the front end
 * 6.  The client side app uses the token to do the work
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), 'localhost', function(){
  console.log("Express server listening on port " + app.get('port'));
});
