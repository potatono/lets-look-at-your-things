// This is pretty quick and dirty.  Basically it works like this: Build up the things data structure and then pass it to the visualizer.
// To build up the data structure we do something like this:
// 
// 1. Get all the users things
// 2. For each thing, request all derivatives to be pushed onto the children array
// 3. Keep a count of active callbacks and stop once we're down to zero
//

var app = {
	lookup: {},
	user: "me",
	data: [],
	requests: 0,
	w:920,
	h:500,
	total:0,
	processed:0,

	initialize: function() {
		if (data.error) {
			$('#alert-msg').html('<b>ERROR:</b> ' + data.error);
			$('#alert').show();

		}
		else if (data.token) {
			this.token = data.token;
			this.showLoading();
			this.requests = 0;
			this.total = 0;
			this.processed = 0;
			this.lookup = {};
			this.data = { id:'root', name:this.user, children: [] };
			this.request("/users/"+this.user+"/things?per_page=100", 
				function(things) { app.addThings(things, app.data.children) },
				function() { $('#main').html("<h1>On noes!</h1><p>I couldn't find "+app.user+".</p><a href='/' class='btn btn-large btn-danger'>Start over</a>") }
			);

			this.timer = window.setInterval(function() { app.monitorRequests(); },1000);
		}
	},

	request: function(endpoint,cb,err) {
		$.ajax({
			url:"http://api.thingiverse.com" + endpoint,
			dataType: 'json',
			headers: { 'Authorization' : 'Bearer ' + this.token },
			success: cb,
			error: err
		});
	},

	showLoading: function() {
		$("#main").html(
			"<h1>Loading..</h1><p>Hang on while we walk through all their things and their derivatives.</p>" +
			'<div class="progress progress-striped active"><div class="bar" id="progress" style="width:0%"></div>'
		);
	},

	// This is where the sauce for building the data structure is.  It recursively calls back itself getting all
	// the derivatives for each thing
	addThings:function(things,data) {
		if (things) {
			this.total += things.length;

			if (this.total > 0)
				$('#progress').css('width',Math.floor(this.processed/this.total*100)+"%");

			for (var i=0; i<things.length; i++) {
				var thing = things[i];
				var obj = {
					id: thing.id,
					name: thing.name,
					data: thing,
					children: []
				};
	
				if (!this.lookup[thing.id]) {
					this.lookup[thing.id] = true;
					this.requests++;

					// Here's some sauce.  Use a closure to create a reerence to children that will still
					// be around when the callback is called.
					(function() {
						var children = obj.children;
						app.request("/things/"+thing.id+"/derivatives?per_page=100", function(things) { 
							app.processed++;
							app.requests--;
							app.addThings(things,children); 
						});
					}());
				}
				else {
					this.processed++;
					if (this.total > 0)
						$('#progress').css('width',Math.floor(this.processed/this.total*100)+"%");
				}

				if (data)
					data.push(obj);
			}
		}

	},

	monitorRequests: function() {
		// Once there are no more requests running start the visualizer
		if (this.requests <= 0) {
			window.clearTimeout(this.timer);
			$('#main').html('<form action="#" onsubmit="app.newUser();return false;">' +
				'<input id="user" placeholder="View another user"></form>' + 
				'<div id="current" class="thumbnail hide"></div>');
			$(".container").addClass('running');
			this.start();
		}
	},

	newUser: function() {
		$(".container").removeClass('running');
		this.user = $('#user').val();
		this.data = [];
		this.initialize();
	},

	// Starts up the visualizer.  Mostly cppy/paste
	start: function() {

		var ht = new $jit.Hypertree({  
		  //id of the visualization container  
		  injectInto: 'main',  
		  //canvas width and height  
		  width: this.w,  
		  height: this.h,  
		  //Change node and edge styles such as  
		  //color, width and dimensions.  
		  Node: {  
		      dim: 9,  
		      color: "#66f"  
		  },  
		  Edge: {  
		      lineWidth: 2,  
		      color: "#339"  
		  },  
		  //Attach event handlers and add text to the  
		  //labels. This method is only triggered on label  
		  //creation  
		  onCreateLabel: function(domElement, node){  
		      domElement.innerHTML = node.name;  
		      $jit.util.addEvent(domElement, 'click', function () {  
		          ht.onClick(node.id, {  
		              onComplete: function() {  
		                  ht.controller.onComplete();  
		              }  
		          });  
		      });  
		  },  
		  //Change node styles when labels are placed  
		  //or moved.  
		  onPlaceLabel: function(domElement, node){  
		      var style = domElement.style;  
		      style.display = '';  
		      style.cursor = 'pointer';  
			  if (node._depth == 0) {
			  		if (node.data && node.data.name) {
						$('#current').html('<a href="' + node.data.url.replace(/http(?:s)?:\/\/api./,"http://") + '">' +
							'<img src="' + node.data.thumbnail + '" /><h3>' + node.data.name + '</h3>' +
							'<button type="button" class="close" onclick="$(\'#current\').hide(); return false;">&times;&nbsp;</button>').show();
					}
					else {
						$('#current').hide();
					}
			  }
		      if (node._depth <= 1) {  
		          style.fontSize = "0.8em";  
		          style.color = "#000";  
		      } 
			  else if (node._depth == 2){  
		          style.fontSize = "0.6em";  
		          style.color = "#666";  
		      } 
			  else {  
		          style.display = 'none';  
		      }  
		  
		      var left = parseInt(style.left);  
		      var w = domElement.offsetWidth;  
		      style.left = (left - w / 2) + 'px';  
		  },  
		    
		  onComplete: function(){  
		        
		      //Build the right column relations list.  
		      //This is done by collecting the information (stored in the data property)   
		      //for all the nodes adjacent to the centered node.  
		      var node = ht.graph.getClosestNodeToOrigin("current");  
		      var html = "<h4>" + node.name + "</h4><b>Connections:</b>";  
		      html += "<ul>";  
		      node.eachAdjacency(function(adj){  
		          var child = adj.nodeTo;  
		          if (child.data) {  
		              var rel = (child.data.band == node.name) ? child.data.relation : node.data.relation;  
		              html += "<li>" + child.name + " " + "<div class=\"relation\">(relation: " + rel + ")</div></li>";  
		          }  
		      });  
		      html += "</ul>";  
		      //$jit.id('inner-details').innerHTML = html;  
		  }  
		});  
		//load JSON data.  
		ht.loadJSON(this.data);  
		//compute positions and plot.  
		ht.refresh();  
	}
};

$(document).ready(function() { app.initialize(); });

