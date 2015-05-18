var alexa={};

alexa.response = function() {
	this.response = {
		"version": "1.0",
		"sessionAttributes":{},
		"response": {
			"shouldEndSession": true
		}
	};
	this.say = function(str) {
		if (typeof this.response.response.outputSpeech=="undefined") {
			this.response.response.outputSpeech = {"type":"PlainText","text":str};
		}
		else {
			this.response.response.outputSpeech.text+=str;
		}
	};
	this.card = function(title,content,subtitle) {
		this.response.response.card = {"type":"Simple","content":content,"title":title,"subtitle":subtitle};
	};
	this.shouldEndSession = function(bool) {
		this.response.response.shouldEndSession = bool;
	};
	this.session = function(key,val) {
		this.response.sessionAttributes[key] = val;
	};
};

alexa.request = function(json) {
	this.data = json;
	this.slot = function(slot_name,default_value) {
		try {
			return this.data.request.intent.slots[slot_name].value;
		} catch(e) {}
		return default_value;
	};
	this.type = function() {
		try {
			return this.data.request.type;
		} catch(e) { }
		return null;
	};
	this.sessionDetails = {
		"new":this.data.session.new,
		"sessionId":this.data.session.sessionId,
		"userId":this.data.session.userId,
		"attributes":this.data.session.attributes
	};
	this.userId = this.data.session.userId;
	this.sessionId = this.data.session.sessionId;
	this.sessionAttributes = this.data.session.attributes;
	this.isSessionNew = (true===this.data.session.new);
	this.session = function(key) {
		try {
			return this.data.session.attributes[key];
		} catch(e) { }
		return;
	};
};

alexa.apps = {};

alexa.app = function(name,endpoint) {
	var self = this;
	this.endpoint = endpoint;
	this.intents = {};
	this.intent = function(intentName,schema,func) {
		if (typeof schema=="function") { 
			func = schema;
			schema = null;
		}
		this.intents[intentName] = {"function":func};
		if (schema) {
			this.intents[intentName].schema = schema;
		}
	};
	this.launchFunc = null;
	this.launch = function(func) {
		this.launchFunc = func;
	};
	this.sessionEndedFunc = null;
	this.sessionEnded = function(func) {
		this.sessionEndedFunc = func;
	};
	this.request = function(req,res) {
		try {
			var key;
			var response = new alexa.response();
			var request = new alexa.request(req.body);
			// Copy all the session attributes from the request into the response so they persist.
			// This should happen by default, but it seems to be a bug in the Alexa API (?)
			if (request.sessionAttributes) {
				for (key in request.sessionAttributes) {
					response.session(key, request.sessionAttributes[key]);
				}
			}
			var requestType = request.type();
			if ("IntentRequest"===requestType) {
				try {
					var func = self.intents[req.body.request.intent.name]['function'];
					if (typeof func=="function") {
						func(request,response,req,res);
					}
					else {
						response.say("Sorry, the application didn't know what to do with that intent");
					}
				} catch(e) { }
			}
			else if ("LaunchRequest"===requestType) {
				if (typeof self.launchFunc=="function") {
					self.launchFunc(request,response,req,res);
				}
				else {
					response.say("Try telling the application what to do instead of opening it");
				}
			}
			else if ("SessionEndedRequest"===requestType) {
				if (typeof self.sessionEndedFunc=="function") {
					self.sessionEndedFunc(request,response,req,res);
				}
			}
			else {
				response.say("Error: not a valid request");
			}
			
		} catch(e) {
			response.say("Sorry, the application encountered an error");
		}
		res.json( response.response );
	};
	this.test = function(req,res) {
		res.render('test',{"json":self});
	};
	alexa.apps[name] = this;
}
// A utility method to bootstrap alexa endpoints into express automatically
alexa.bootstrap = function(express,path) {
	var appName, app;
	for (appName in alexa.apps) {
		app = alexa.apps[appName];
		var endpoint = (path || '/') + (app.endpoint || appName);
		express.post(endpoint,app.request);
		express.get(endpoint,app.test);
	}
};
module.exports = alexa;
