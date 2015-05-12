// --------------------------------------------------------------------
// ALEXA API
// --------------------------------------------------------------------
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
	this.card = function(title,content) {
		this.response.response.card = {"type":"Simple","content":content};
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
	this.session = {
		"new":this.data.session.new,
		"sessionId":this.data.session.sessionId,
		"userId":this.data.session.userId,
		"attributes":this.data.session.attributes
	};
	this.sessionData = function(key) {
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
		
		}
	};
	this.launch = null;
	this.onLaunch = function(func) {
		this.launch = func;
	};
	this.sessionEnded = null;
	this.onSessionEnded = function(func) {
		this.sessionEnded = func;
	};
	this.request = function(req,res) {
		//console.log('request');
		try {
			var response = new alexa.response();
			var request = new alexa.request(req.body);
			
			// debug
			//response.card("Debug",JSON.stringify(request.data.session));
			
			var requestType = request.type();
			if ("IntentRequest"==requestType) {
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
			else if ("LaunchRequest"==requestType) {
				if (typeof self.launch=="function") {
					self.launch(request,response);
				}
				else {
					response.say("Try telling the application what to do instead of opening it");
				}
			}
			else if ("SessionEndedRequest"==requestType) {
				if (typeof self.sessionEnded=="function") {
					self.sessionEnded(request,response);
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
alexa.bootstrap = function(express) {
	var app;
	for (app in alexa.apps) {
		express.post('/guessinggame',alexa.apps[app].request);
		express.get('/guessinggame',alexa.apps[app].test);
	}
};
module.exports = alexa;
