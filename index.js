var Promise = require('bluebird');
var AlexaUtterances = require('alexa-utterances');
var SSML = require('./to-ssml');

var alexa={};

alexa.response = function() {
	this.resolved = false;
	this.response = {
		"version": "1.0",
		"sessionAttributes":{},
		"response": {
			"shouldEndSession": true
		}
	};
	this.say = function(str) {
		if (typeof this.response.response.outputSpeech=="undefined") {
			this.response.response.outputSpeech = {"type":"SSML","ssml":SSML.fromStr(str)};
		}
		else {
			// append str to the current outputSpeech, stripping the out speak tag
			this.response.response.outputSpeech.ssml = SSML.fromStr(str, this.response.response.outputSpeech.ssml);
		}
		return this;
	};
	this.clear = function(str) {
		this.response.response.outputSpeech = {"type":"PlainText","text":""};
		return this;
	};
	this.reprompt = function(str) {
		if (typeof this.response.response.reprompt=="undefined") {
			this.response.response.reprompt = {"outputSpeech" : {"type":"SSML","ssml":SSML.fromStr(str)}};
		}
		else {
			// append str to the current outputSpeech, stripping the out speak tag
			this.response.response.reprompt.outputSpeech.ssml = SSML.fromStr(str, this.response.response.reprompt.outputSpeech.text);
		}
		return this;
	};
	this.card = function(title,content,subtitle) {
		// remove all SSML to keep the card clean
		this.response.response.card = {"type":"Simple","title":title,"content":SSML.cleanse(content),"subtitle":subtitle};
		return this;
	};
	this.linkAccount = function() {
		this.response.response.card = {"type":"LinkAccount"};
		return this;
	};
	this.shouldEndSession = function(bool,reprompt) {
		this.response.response.shouldEndSession = bool;
		if (reprompt) {
			this.reprompt(reprompt);
		}
		return this;
	};
	this.session = function(key,val) {
		if (typeof val=="undefined") {
			return this.response.sessionAttributes[key];
		}
		else {
			this.response.sessionAttributes[key] = val;
		}
		return this;
	};
	this.clearSession = function(key) {
		if (typeof key=="string" && typeof this.response.sessionAttributes[key]!="undefined") {
			delete this.response.sessionAttributes[key];
		}
		else {
			this.response.sessionAttributes = {};
		}
		return this;
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
		"userId":this.data.session.user.userId,
    		"accessToken":this.data.session.user.accessToken || null,
		"attributes":this.data.session.attributes,
		"application":this.data.session.application
	};
	this.userId = this.data.session.user.userId;
	this.applicationId = this.data.session.application.applicationId;
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
	this.name = name;
	this.messages = {
		// When an intent was passed in that the application was not configured to handle
		"NO_INTENT_FOUND":"Sorry, the application didn't know what to do with that intent"
		// When the app was used with 'open' or 'launch' but no launch handler was defined
		,"NO_LAUNCH_FUNCTION":"Try telling the application what to do instead of opening it"
		// When a request type was not recognized
		,"INVALID_REQUEST_TYPE":"Error: not a valid request"
		// If some other exception happens
		,"GENERIC_ERROR":"Sorry, the application encountered an error"
	};
	
	// Persist session variables from every request into every response?
	this.persistentSession = true;

    // use a minimal set of utterances or the full cartesian product?
    this.exhaustiveUtterances = false;
	
	// A catch-all error handler - do nothing by default
	this.error = null;
	
	// pre/post hooks to be run on every request
	this.pre = function(request,response,type){};
	this.post = function(request,response,type){};
	
	this.endpoint = endpoint;
	// A mapping of keywords to arrays of possible values, for expansion of sample utterances
	this.dictionary = {};
	this.intents = {};
	this.intent = function(intentName,schema,func) {
		if (typeof schema=="function") { 
			func = schema;
			schema = null;
		}
		self.intents[intentName] = {"name":intentName,"function":func};
		if (schema) {
			self.intents[intentName].schema = schema;
		}
	};
	this.launchFunc = null;
	this.launch = function(func) {
		self.launchFunc = func;
	};
	this.sessionEndedFunc = null;
	this.sessionEnded = function(func) {
		self.sessionEndedFunc = func;
	};
	this.request = function(request_json) {
		return new Promise(function(resolve,reject) {
			var request = new alexa.request(request_json);
			var response = new alexa.response();
			var postExecuted = false;
			// Attach Promise resolve/reject functions to the response object
			response.send = function(exception) {
				if (typeof self.post=="function" && !postExecuted) {
					postExecuted = true;
					self.post(request,response,requestType,exception);
				}
				if (!response.resolved) {
					response.resolved = true;
					resolve(response.response);
				}
			};
			response.fail = function(msg,exception) {
				if (typeof self.post=="function" && !postExecuted) {
					postExecuted = true;
					self.post(request,response,requestType,exception);
				}
				if (!response.resolved) {
					response.resolved = true;
					reject(msg);
				}
			};
			try {
				var key;
				// Copy all the session attributes from the request into the response so they persist.
				// The Alexa API doesn't think session variables should persist for the entire 
				// duration of the session, but I do.
				if (request.sessionAttributes && self.persistentSession) {
					for (key in request.sessionAttributes) {
						response.session(key, request.sessionAttributes[key]);
					}
				}
				var requestType = request.type();
				if (typeof self.pre=="function") {
					self.pre(request,response,requestType);
				}
				if (!response.resolved) {
					if ("IntentRequest"===requestType) {
						var intent = request_json.request.intent.name;
						if (typeof self.intents[intent]!="undefined" && typeof self.intents[intent]['function']=="function") {
							if (false!==self.intents[intent]['function'](request,response)) {
								response.send();
							}
						}
						else {
							throw 'NO_INTENT_FOUND';
						}
					}
					else if ("LaunchRequest"===requestType) {
						if (typeof self.launchFunc=="function") {
							if (false!==self.launchFunc(request,response)) {
								response.send();
							}
						}
						else {
							throw 'NO_LAUNCH_FUNCTION';
						}
					}
					else if ("SessionEndedRequest"===requestType) {
						if (typeof self.sessionEndedFunc=="function") {
							if (false!==self.sessionEndedFunc(request,response)) {
								response.send();
							}
						}
					}
					else {
						throw 'INVALID_REQUEST_TYPE';
					}
				}
			} catch(e) {
				if (typeof self.error=="function") {
					self.error(e,request,response);
				}
				else if (typeof e=="string" && self.messages[e]) {
					response.say(self.messages[e]);
					response.send(e);
				}
				if (!response.resolved) {
					response.fail("Unhandled exception"+e.message, e);
				}
			}
		});
	};
	
	// Extract the schema and generate a schema JSON object
	this.schema = function() {
		var schema = {"intents":[]}, intentName, intent, key;
		for (intentName in self.intents) {
			intent = self.intents[intentName];
			var intentSchema = {"intent":intent.name, "slots":[]};
			if (intent.schema) {
				if (intent.schema.slots) {
					for (key in intent.schema.slots) {
						intentSchema.slots.push( {"name":key, "type":intent.schema.slots[key]} );
					}
				}
			}
			schema.intents.push(intentSchema);
		};
		return JSON.stringify(schema,null,3);
	};
	
	// Generate a list of sample utterances
	this.utterances = function() {
		var intentName, utterances=[], intent, out="";
		for (intentName in self.intents) {
			intent = self.intents[intentName];
			if (intent.schema && intent.schema.utterances) {
				intent.schema.utterances.forEach(function(sample) {
					var list = AlexaUtterances(sample,intent.schema.slots,self.dictionary,self.exhaustiveUtterances);
					list.forEach(function(utterance) {
						out+=intent.name+"\t"+(utterance.replace(/\s+/g,' '))+"\n";
					});
				});
			}
		};
		return out;
	};

	// A built-in handler for AWS Lambda
	this.handler = function(event, context) {
		self.request(event).then(function(response) {
			context.succeed(response);
		});
	};
	// For backwards compatibility
	this.lambda = function() {
		return self.handler;
	};

	// A utility method to bootstrap alexa endpoints into express automatically
	this.express = function(express,path,enableDebug) {
		var endpoint = (path || '/') + (self.endpoint || self.name);
		express.post(endpoint,function(req,res) {
			self.request(req.body).then(function(response) {
				res.json(response);
			},function(response) {
				res.status(500).send("Server Error");
			});
		});
		if (typeof enableDebug!="boolean") {
			enableDebug = true;
		}
		if (enableDebug) {
			express.get(endpoint,function(req,res) {
				res.render('test',{"json":self,"schema":self.schema(),"utterances":self.utterances()});
			});
		}
	};
	
	// Add the app to the global list of named apps
	if (name) {
		alexa.apps[name] = self;
	}
	
	return this;
}

module.exports = alexa;
