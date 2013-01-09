var qs = require('querystring'),
	request = require('request'),
	oauth = {
		client_id: "YOUR CLIENT ID",
		client_secret: "YOUR CLIENT SECRET"
	},
	url = "http://www.thingiverse.com/login/oauth/access_token";

exports.index = function(req, res){
	// If there was is a code from a redirect, request an access token
	if (req.param('code')) {
		// Create a post to be sent
		var post = oauth;
		post['code'] = req.param('code');

		// POST to thingiverse
		request.post(url, { form:post }, function(e,r,body) {
			// We get back the token as a query string, parse it
			var parsed = qs.parse(body);

			// If there's an access_token pass it along to the front end
			if (parsed && parsed.access_token) {
				res.render('index', { client_id:oauth.client_id, token: parsed.access_token });
			}
			// Otherwise show an error, pass that to the front
			else {
				res.render('index', { client_id:oauth.client_id, error: body });
			}
		});
	}
	// Otherwise we haven't done anything yet.  Just pass the client id up.
	else {
		res.render('index', { client_id:oauth.client_id });
	}
};
