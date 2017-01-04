var Promise = require("bluebird");
var AlexaUtterances = require("alexa-utterances");
var SSML = require("./to-ssml");
var alexa = {};

alexa.response = function(session) {
  var self = this;
  this.resolved = false;
  this.response = {
    "version": "1.0",
    "response": {
      "directives": [],
      "shouldEndSession": true
    }
  };
  this.say = function(str) {
    if (typeof this.response.response.outputSpeech == "undefined") {
      this.response.response.outputSpeech = {
        "type": "SSML",
        "ssml": SSML.fromStr(str)
      };
    } else {
      // append str to the current outputSpeech, stripping the out speak tag
      this.response.response.outputSpeech.ssml = SSML.fromStr(str, this.response.response.outputSpeech.ssml);
    }
    return this;
  };
  this.clear = function(/*str*/) {
    this.response.response.outputSpeech = {
      "type": "SSML",
      "ssml": SSML.fromStr("")
    };
    return this;
  };
  this.reprompt = function(str) {
    if (typeof this.response.response.reprompt == "undefined") {
      this.response.response.reprompt = {
        "outputSpeech": {
          "type": "SSML",
          "ssml": SSML.fromStr(str)
        }
      };
    } else {
      // append str to the current outputSpeech, stripping the out speak tag
      this.response.response.reprompt.outputSpeech.ssml = SSML.fromStr(str, this.response.response.reprompt.outputSpeech.text);
    }
    return this;
  };
  this.card = function(oCard) {
    if (2 == arguments.length) {  //backwards compat
      oCard = {
        type: "Simple",
        title: arguments[0],
        content: arguments[1]
      };
    }

    var requiredAttrs = [],
      clenseAttrs = [];

    switch (oCard.type) {
      case 'Simple':
        requiredAttrs.push('content');
        clenseAttrs.push('content');
        break;
      case 'Standard':
        requiredAttrs.push('text');
        clenseAttrs.push('text');
        if (('image' in oCard) && ( !('smallImageUrl' in oCard['image']) && !('largeImageUrl' in oCard['image']) )) {
          console.error('If card.image is defined, must specify at least smallImageUrl or largeImageUrl');
          return this;
        }
        break;
      default:
        break;
    }

    var hasAllReq = requiredAttrs.every(function(idx) {
      if (!(idx in oCard)) {
        console.error('Card object is missing required attr "' + idx + '"');
        return false;
      }
      return true;
    });

    if (!hasAllReq) {
      return this;
    }

    // remove all SSML to keep the card clean
    clenseAttrs.forEach(function(idx) {
      oCard[idx] = SSML.cleanse(oCard[idx]);
    });

    this.response.response.card = oCard;

    return this;
  };
  this.linkAccount = function() {
    this.response.response.card = {
      "type": "LinkAccount"
    };
    return this;
  };
  this.shouldEndSession = function(bool, reprompt) {
    this.response.response.shouldEndSession = bool;
    if (reprompt) {
      this.reprompt(reprompt);
    }
    return this;
  };
  this.sessionObject = session;
  this.setSessionAttributes = function(attributes) {
    this.response.sessionAttributes = attributes;
  };
  // prepare response object
  this.prepare = function() {
    this.setSessionAttributes(this.sessionObject.getAttributes());
  };
  this.audioPlayerPlay = function(playBehavior, audioItem) {
    var audioPlayerDirective = {
      "type": "AudioPlayer.Play",
      "playBehavior": playBehavior,
      "audioItem": audioItem
    };
    self.response.response.directives.push(audioPlayerDirective);
    return this;
  };
  this.audioPlayerPlayStream = function(playBehavior, stream) {
    var audioItem = {
      "stream": stream
    };
    return this.audioPlayerPlay(playBehavior, audioItem);
  };
  this.audioPlayerStop = function () {
    var audioPlayerDirective = {
      "type": "AudioPlayer.Stop"
    };
    self.response.response.directives.push(audioPlayerDirective);
    return this;
  };
  this.audioPlayerClearQueue = function (clearBehavior) {
    var audioPlayerDirective = {
      "type": "AudioPlayer.ClearQueue",
      "clearBehavior": clearBehavior || "CLEAR_ALL"
    };
    self.response.response.directives.push(audioPlayerDirective);
    return this;
  };

  // legacy code below
  // @deprecated
  this.session = function(key, val) {
    if (typeof val == "undefined") {
      return this.sessionObject.get(key);
    } else {
      this.sessionObject.set(key, val);
    }
    return this;
  };
  // @deprecated
  this.clearSession = function(key) {
    this.sessionObject.clear(key);
    return this;
  };
};

alexa.request = function(json) {
  this.data = json;
  this.slot = function(slotName, defaultValue) {
    try {
      return this.data.request.intent.slots[slotName].value;
    } catch (e) {
      console.error("missing intent in request: " + slotName, e);
      return defaultValue;
    }
  };
  this.type = function() {
    try {
      return this.data.request.type;
    } catch (e) {
      console.error("missing type", e);
      return null;
    }
  };

  this.userId = null;
  this.applicationId = null;
  this.context = null;

  if (this.data.context) {
    this.userId = this.data.context.System.user.userId;
    this.applicationId = this.data.context.System.application.applicationId;
    this.context = this.data.context;
  }

  var session = new alexa.session(json.session);
  this.hasSession = function() {
    return session.isAvailable();
  };
  this.getSession = function() {
    return session;
  };

  // legacy code below
  // @deprecated
  this.sessionDetails = this.getSession().details;
  // @deprecated
  this.sessionId = this.getSession().sessionId;
  // @deprecated
  this.sessionAttributes = this.getSession().attributes;
  // @deprecated
  this.isSessionNew = this.hasSession() ? this.getSession().isNew() : false;
  // @deprecated
  this.session = function(key) {
    return this.getSession().get(key);
  };
};

alexa.session = function(session) {
  var isAvailable = (typeof session != "undefined");
  this.isAvailable = function() {
    return isAvailable;
  };
  if (isAvailable) {
    this.isNew = function() {
      return (true === session.new);
    };
    this.get = function(key) {
      return this.attributes[key];
    };
    this.set = function(key, value) {
      this.attributes[key] = value;
    };
    this.clear = function(key) {
      if (typeof key == "string" && typeof this.attributes[key] != "undefined") {
        delete this.attributes[key];
      } else {
        this.attributes = {};
      }
    };
    this.details = {
      "new": session.new,
      "sessionId": session.sessionId,
      "userId": session.user.userId,
      "accessToken": session.user.accessToken || null,
      "attributes": session.attributes,
      "application": session.application
    };
    // Persist all the session attributes across requests.
    // The Alexa API doesn't think session variables should persist for the entire
    // duration of the session, but I do.
    this.attributes = session.attributes || {};
    this.sessionId = session.sessionId;
  } else {
    this.isNew = this.get = this.set = this.clear = function() {
      throw "NO_SESSION";
    };
    this.details = {};
    this.attributes = {};
    this.sessionId = null;
  }
  this.getAttributes = function() {
    // do some stuff with session data
    return this.attributes;
  };
};

alexa.apps = {};

alexa.app = function(name, endpoint) {
  var self = this;
  this.name = name;
  this.messages = {
    // When an intent was passed in that the application was not configured to handle
    "NO_INTENT_FOUND": "Sorry, the application didn't know what to do with that intent",
    // When an AudioPlayer event was passed in that the application was not configured to handle
    "NO_AUDIO_PLAYER_EVENT_HANDLER_FOUND": "Sorry, the application didn't know what to do with that AudioPlayer event",
    // When the app was used with 'open' or 'launch' but no launch handler was defined
    "NO_LAUNCH_FUNCTION": "Try telling the application what to do instead of opening it",
    // When a request type was not recognized
    "INVALID_REQUEST_TYPE": "Error: not a valid request",
    // When a request and response don't contain session object
    // https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#request-body-parameters
    "NO_SESSION": "This request doesn't support session attributes",
    // If some other exception happens
    "GENERIC_ERROR": "Sorry, the application encountered an error"
  };

  // Persist session variables from every request into every response?
  this.persistentSession = true;

  // use a minimal set of utterances or the full cartesian product?
  this.exhaustiveUtterances = false;

  // A catch-all error handler - do nothing by default
  this.error = null;

  // pre/post hooks to be run on every request
  this.pre = function(/*request, response, type*/) {};
  this.post = function(/*request, response, type*/) {};

  this.endpoint = endpoint;
  // A mapping of keywords to arrays of possible values, for expansion of sample utterances
  this.dictionary = {};
  this.intents = {};
  this.intent = function(intentName, schema, func) {
    if (typeof schema == "function") {
      func = schema;
      schema = null;
    }
    self.intents[intentName] = {
      "name": intentName,
      "function": func
    };
    if (schema) {
      self.intents[intentName].schema = schema;
    }
  };
  this.audioPlayerEventHandlers = {};
  this.audioPlayer = function(eventName, func) {
    self.audioPlayerEventHandlers[eventName] = {
      "name": eventName,
      "function": func
    };
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
    return new Promise(function(resolve, reject) {
      var request = new alexa.request(request_json);
      var response = new alexa.response(request.getSession());
      var postExecuted = false;
      // Attach Promise resolve/reject functions to the response object
      response.send = function(exception) {
        response.prepare();
        if (typeof self.post == "function" && !postExecuted) {
          postExecuted = true;
          self.post(request, response, requestType, exception);
        }
        if (!response.resolved) {
          response.resolved = true;
          resolve(response.response);
        }
      };
      response.fail = function(msg, exception) {
        response.prepare();
        if (typeof self.post == "function" && !postExecuted) {
          postExecuted = true;
          self.post(request, response, requestType, exception);
        }
        if (!response.resolved) {
          response.resolved = true;
          reject(msg);
        }
      };
      try {
        var requestType = request.type();
        if (typeof self.pre == "function") {
          self.pre(request, response, requestType);
        }
        if (!response.resolved) {
          if ("IntentRequest" === requestType) {
            var intent = request_json.request.intent.name;
            if (typeof self.intents[intent] != "undefined" && typeof self.intents[intent]["function"] == "function") {
              if (false !== self.intents[intent]["function"](request, response)) {
                response.send();
              }
            } else {
              throw "NO_INTENT_FOUND";
            }
          } else if ("LaunchRequest" === requestType) {
            if (typeof self.launchFunc == "function") {
              if (false !== self.launchFunc(request, response)) {
                response.send();
              }
            } else {
              throw "NO_LAUNCH_FUNCTION";
            }
          } else if ("SessionEndedRequest" === requestType) {
            if (typeof self.sessionEndedFunc == "function") {
              if (false !== self.sessionEndedFunc(request, response)) {
                response.send();
              }
            }
          } else if (requestType && 0 === requestType.indexOf("AudioPlayer.")) {
            var event = requestType.slice(12);
            var eventHandlerObject = self.audioPlayerEventHandlers[event];
            if (typeof eventHandlerObject != "undefined" && typeof eventHandlerObject["function"] == "function") {
              if (false !== eventHandlerObject["function"](request, response)) {
                response.send();
              }
            } else {
              response.send();
            }
          } else {
            throw "INVALID_REQUEST_TYPE";
          }
        }
      } catch (e) {
        if (typeof self.error == "function") {
          self.error(e, request, response);
        } else if (typeof e == "string" && self.messages[e]) {
          response.say(self.messages[e]);
          response.send(e);
        }
        if (!response.resolved) {
          if (e.message) {
            response.fail("Unhandled exception: " + e.message + ".", e);
          } else {
            response.fail("Unhandled exception.", e);
          }
        }
      }
    });
  };

  // Extract the schema and generate a schema JSON object
  this.schema = function() {
    var schema = {
      "intents": []
    }, intentName, intent, key;
    for (intentName in self.intents) {
      intent = self.intents[intentName];
      var intentSchema = {
        "intent": intent.name,
        "slots": []
      };
      if (intent.schema) {
        if (intent.schema.slots) {
          for (key in intent.schema.slots) {
            intentSchema.slots.push({
              "name": key,
              "type": intent.schema.slots[key]
            });
          }
        }
      }
      schema.intents.push(intentSchema);
    }
    return JSON.stringify(schema, null, 3);
  };

  // Generate a list of sample utterances
  this.utterances = function() {
    var intentName,
      intent,
      out = "";
    for (intentName in self.intents) {
      intent = self.intents[intentName];
      if (intent.schema && intent.schema.utterances) {
        intent.schema.utterances.forEach(function(sample) {
          var list = AlexaUtterances(sample,
            intent.schema.slots,
            self.dictionary,
            self.exhaustiveUtterances);
          list.forEach(function(utterance) {
            out += intent.name + "\t" + (utterance.replace(/\s+/g, " ")).trim() + "\n";
          });
        });
      }
    }
    return out;
  };

  // A built-in handler for AWS Lambda
  this.handler = function(event, context) {
    self.request(event)
      .then(function(response) {
        context.succeed(response);
      })
      .catch(function(response) {
        context.fail(response);
      });
  };

  // For backwards compatibility
  this.lambda = function() {
    return self.handler;
  };

  // A utility method to bootstrap alexa endpoints into express automatically
  this.express = function(express, path, enableDebug) {
    var endpoint = (path || "/") + (self.endpoint || self.name);
    express.post(endpoint, function(req, res) {
      self.request(req.body).then(function(response) {
        res.json(response);
      }, function() {
        res.status(500).send("Server Error");
      });
    });
    if (typeof enableDebug != "boolean") {
      enableDebug = true;
    }
    if (enableDebug) {
      express.get(endpoint, function(req, res) {
        res.render("test", {
          "json": self,
          "schema": self.schema(),
          "utterances": self.utterances()
        });
      });
    }
  };

  // Add the app to the global list of named apps
  if (name) {
    alexa.apps[name] = self;
  }

  return this;
};

module.exports = alexa;
