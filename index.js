var Promise = require('bluebird');
var Combinatorics = require('js-combinatorics');
var Numbered = require('numbered');

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
		return this;
	};
	this.reprompt = function(str) {
		if (typeof this.response.reprompt=="undefined") {
			this.response.reprompt = {"outputSpeech" : {"type":"PlainText","text":str}};
		}
		else {
			this.response.reprompt.outputSpeech.text+=str;
		}
		return this;
	};
	this.card = function(title,content,subtitle) {
		this.response.response.card = {"type":"Simple","content":content,"title":title,"subtitle":subtitle};
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
		this.response.sessionAttributes[key] = val;
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
	// A catch-all error handler - do nothing by default
	this.error = null;
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
			// Attach Promise resolve/reject functions to the response object
			response.send = function() {
				resolve(response.response);
			};
			response.fail = function(msg) {
				reject(msg);
			};
			try {
				var key;
				// Copy all the session attributes from the request into the response so they persist.
				// This should happen by default, but it seems to be a bug in the Alexa API (?)
				if (request.sessionAttributes) {
					for (key in request.sessionAttributes) {
						response.session(key, request.sessionAttributes[key]);
					}
				}
				var requestType = request.type();
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
			} catch(e) {
				if (typeof self.error=="function") {
					self.error(e,request,response);
				}
				else if (typeof e=="string" && self.messages[e]) {
					response.say(self.messages[e]);
				}
				response.send();
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
					var list = generateUtterances(sample,intent.schema.slots,self.dictionary);
					list.forEach(function(utterance) {
						out+=intent.name+"\t"+utterance+"\n";
					});
				});
			}
		};
		return out;
	};

	// A utility method to map an alexa app to an AWS lambda function
	this.lambda = function() {
		return function(event, context) {
			self.request(event).then(function(response) {
				context.succeed(response);
			});
		};
	};

	// A utility method to bootstrap alexa endpoints into express automatically
	this.express = function(express,path,enableDebug) {
		var endpoint = (path || '/') + (self.endpoint || self.name);
		express.post(endpoint,function(req,res) {
			self.request(req.body).then(function(response) {
				res.json(response);
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

// Util functions for generating schema and utterances
// ===================================================
// Convert a number range like 5-10 into an array of english words
function expandNumberRange(start,end,by) {
  by = by || 1; //incrementing by 0 is a bad idea
  var converted = [];
  for (var i=start; i<=end; i+=by) {
    converted.push( Numbered.stringify(i) );
  }
  return converted;
}

// Recognize shortcuts in utterance definitions and swap them out with the actual values
function expandShortcuts(str,slots,dictionary) {
  // If the string is found in the dictionary, just provide the matching values
  if (typeof dictionary=="object" && typeof dictionary[str]!="undefined") {
    return dictionary[str];
  }
  // Numbered ranges, ex: 5-100 by 5
  var match = str.match(/(\d+)\s*-\s*(\d+)(\s+by\s+(\d+))?/);
  if (match) {
    return expandNumberRange(+match[1],+match[2],+match[4]);
  }
  return [str];
}

// Generate a list of utterances from a template
function generateUtterances(str,slots,dictionary) {
  var placeholders=[], utterances=[], slotmap={};
  // First extract sample placeholders values from the string
  str = str.replace(/\{([^\}]+)\}/g, function(match,p1) {
    var expandedValues=[], slot, values = p1.split("|");
    // If the last of the values is a SLOT name, we need to keep the name in the utterances
    if (values && values.length && values.length>1 && slots && typeof slots[values[values.length-1]]!="undefined") {
      slot = values.pop();
    }
    values.forEach(function(val,i) {
      Array.prototype.push.apply(expandedValues,expandShortcuts(val,slots,dictionary));
    });
    if (slot) {
      slotmap[slot] = placeholders.length;
    }
    placeholders.push( expandedValues );
    return "{"+(slot || placeholders.length-1)+"}";
  });
  // Generate all possible combinations using the cartesian product
  var variations = Combinatorics.cartesianProduct.apply(Combinatorics,placeholders).toArray();
  // Substitute each combination back into the original string
  variations.forEach(function(values) {
    // Replace numeric placeholders
    var utterance = str.replace(/\{(\d+)\}/g,function(match,p1){ 
      return values[p1]; 
    });
    // Replace slot placeholders
    utterance = utterance.replace(/\{(.*?)\}/g,function(match,p1){ 
      return "{"+values[slotmap[p1]]+"|"+p1+"}";
    });
    utterances.push( utterance );
  });
  return utterances;
}

module.exports = alexa;
