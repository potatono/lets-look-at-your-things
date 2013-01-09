# Let's look at your things

A simple Thingiverse App to visualize a user's Things and their derivatives.

## Requirements

### Node

* express
* hjs
* request
* qs

### Client

* jquery
* bootstrap
* jit (http://philogb.github.com/jit/)

## Configuration

Edit routes/index.js and add your app's Client ID and Secret to the top and you should be ready to go.  

## Basic Operation

routes/index.js handles most of the OAuth work.  Everything else is in public/js/app.js.  Once
the app has an access token everything is done in the client.


