"use strict";

var Promise = require("bluebird");
var AlexaUtterances = require("alexa-utterances");
var SSML = require("./lib/to-ssml");
var alexa = {};
var defaults = require("lodash.defaults");
var verifier = require("alexa-verifier-middleware");
var bodyParser = require('body-parser');
var normalizeApiPath = require('./lib/normalize-api-path');

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
  this.clear = function( /*str*/ ) {
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
      this.response.response.reprompt.outputSpeech.ssml = SSML.fromStr(str, this.response.response.reprompt.outputSpeech.ssml);
    }
    return this;
  };
  this.card = function(oCard) {
    if (2 == arguments.length) { // backwards compat
      oCard = {
        type: "Simple",
        title: arguments[0],
        content: arguments[1]
      };
    }

    var requiredAttrs = ['type'],
      clenseAttrs = [];

    switch (oCard.type) {
      case 'Simple':
        requiredAttrs.push('content');
        clenseAttrs.push('content');
        break;
      case 'Standard':
        requiredAttrs.push('text');
        clenseAttrs.push('text');
        if (('image' in oCard) && (!('smallImageUrl' in oCard['image']) && !('largeImageUrl' in oCard['image']))) {
          console.error('If card.image is defined, must specify at least smallImageUrl or largeImageUrl');
          return this;
        }
        break;
      case 'AskForPermissionsConsent':
        requiredAttrs.push('permissions');
        break;
      default:
        break;
    }

    var hasAllReq = requiredAttrs.every(function(idx) {
      if (!(idx in oCard) || typeof oCard[idx] === 'undefined') {
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
    if (bool === null || typeof bool == "undefined") {
      delete this.response.response.shouldEndSession;
    } else {
      this.response.response.shouldEndSession = bool;
    }
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
    this.directive(audioPlayerDirective);
    return this;
  };
  this.audioPlayerPlayStream = function(playBehavior, stream) {
    var audioItem = {
      "stream": stream
    };
    return this.audioPlayerPlay(playBehavior, audioItem);
  };
  this.audioPlayerStop = function() {
    var audioPlayerDirective = {
      "type": "AudioPlayer.Stop"
    };
    this.directive(audioPlayerDirective);
    return this;
  };
  this.audioPlayerClearQueue = function(clearBehavior) {
    var audioPlayerDirective = {
      "type": "AudioPlayer.ClearQueue",
      "clearBehavior": clearBehavior || "CLEAR_ALL"
    };
    this.directive(audioPlayerDirective);
    return this;
  };
  // Read & manipulate response directives
  var directives = new alexa.directives(self.response.response.directives);
  this.getDirectives = function() {
    return directives;
  };
  this.directive = function(directive) {
    this.getDirectives().set(directive);
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

alexa.directives = function(directives) {
  // load the alexa response directives information into details
  this.details = directives;

  this.set = function(directive) {
    this.details.push(directive);
  };

  this.clear = function() {
    this.details.length = 0;
  };
};

alexa.request = function(json) {
  this.data = json;
  this.slots = {};
  if (this.data.request && this.data.request.intent && this.data.request.intent.slots && Object.keys(this.data.request.intent.slots).length > 0) {
    var slot, slotName;
    for (slotName in this.data.request.intent.slots) {
      slot = new alexa.slot(this.data.request.intent.slots[slotName]);
      this.slots[slotName] = slot;
    }
  }
  this.slot = function(slotName, defaultValue) {
    if (this.slots && 'undefined' != typeof this.slots[slotName] && 'undefined' != typeof this.slots[slotName].value) {
      return this.slots[slotName].value;
    } else {
      return defaultValue;
    }
  };
  this.type = function() {
    if (!(this.data && this.data.request && this.data.request.type)) {
      console.error("missing request type:", this.data);
      return;
    }
    return this.data.request.type;
  };
  this.isAudioPlayer = function() {
    var requestType = this.type();
    return (requestType && 0 === requestType.indexOf("AudioPlayer."));
  };
  this.isPlaybackController = function() {
    var requestType = this.type();
    return (requestType && 0 === requestType.indexOf("PlaybackController."));
  };

  if (this.data.request && this.data.request.intent) {
    this.confirmationStatus = this.data.request.intent.confirmationStatus;
  }

  if (this.data.request && this.data.request.type === 'Display.ElementSelected' && this.data.request.token) {
    this.selectedElementToken = this.data.request.token;
  }

  this.isConfirmed = function() {
    return 'CONFIRMED' === this.confirmationStatus;
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

  this.getDialog = function() {
    var dialogState = (typeof this.data.request['dialogState'] !== "undefined") ?
      this.data.request['dialogState'] : null;
    return new alexa.dialog(dialogState);
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

alexa.dialog = function(dialogState) {
  this.dialogState = dialogState;

  this.isStarted = function() {
    return 'STARTED' === this.dialogState;
  };
  this.isInProgress = function() {
    return 'IN_PROGRESS' === this.dialogState;
  };
  this.isCompleted = function() {
    return 'COMPLETED' === this.dialogState;
  };

  this.handleDialogDelegation = function(request, response) {
    var dialogDirective = {
      "type": "Dialog.Delegate"
    };
    response.shouldEndSession(false).directive(dialogDirective).send();
  };
};

alexa.intent = function(name, schema, handler) {
  this.name = name;
  this.handler = handler;
  this.dialog = (schema && typeof schema.dialog !== "undefined") ? schema.dialog : {};
  this.slots = (schema && typeof schema["slots"] !== "undefined") ? schema["slots"] : null;
  this.utterances = (schema && typeof schema["utterances"] !== "undefined") ? schema["utterances"] : null;

  this.isDelegatedDialog = function() {
    return this.dialog.type === "delegate";
  };
};

alexa.slot = function(slot) {
  this.name = slot.name;
  this.value = slot.value;
  this.confirmationStatus = slot.confirmationStatus;
  if (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) {
    this.resolutions = slot.resolutions.resolutionsPerAuthority.map(function(resolution) {
      return new alexa.slotResolution(resolution);
    });
  } else {
    this.resolutions = [];
  }

  this.isConfirmed = function() {
    return 'CONFIRMED' === this.confirmationStatus;
  };
  this.resolution = function(idx) {
    idx = ( typeof idx === 'number' && idx >= 0 && idx < this.resolutions.length ) ? idx : 0;
    return this.resolutions[idx];
  };
};

alexa.slotResolution = function(resolution) {
  this.status = resolution.status.code;
  this.values = (resolution.values || []).map(function(elem) {
    return new alexa.resolutionValue(elem.value);
  });

  this.isMatched = function() {
    return 'ER_SUCCESS_MATCH' === this.status;
  };
  this.first = function() {
    return this.values[0];
  };
};

alexa.resolutionValue = function(value) {
  this.name = value.name;
  this.id = value.id;
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
      // getAttributes deep clones the attributes object, so updates to objects
      // will not affect the session until `set` is called explicitly
      return this.getAttributes()[key];
    };
    this.set = function(key, value) {
      this.attributes[key] = value;
    };
    this.clear = function(key) {
      if (typeof key == "string") {
        if (typeof this.attributes[key] != "undefined") {
          delete this.attributes[key];
        }
      } else {
        this.attributes = {};
      }
    };
    // load the alexa session information into details
    this.details = session;
    // @deprecated
    this.details.userId = this.details.user.userId || null;
    // @deprecated
    this.details.accessToken = this.details.user.accessToken || null;

    // persist all the session attributes across requests
    // the Alexa API doesn't think session variables should persist for the entire
    // duration of the session, but I do
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
    // deep clone attributes so direct updates to objects are not set in the
    // session unless `.set` is called explicitly
    return JSON.parse(JSON.stringify(this.attributes));
  };
};

alexa.router = function(app, request, response, request_json) {
  this.intent = function(intent) {
    if (typeof app.intents[intent] !== "undefined" && typeof app.intents[intent].handler === "function") {
      if (app.intents[intent].isDelegatedDialog() && !request.getDialog().isCompleted()) {
        return Promise.resolve(request.getDialog().handleDialogDelegation(request, response));
      } else {
        return Promise.resolve(app.intents[intent].handler(request, response));
      }
    } else {
      throw "NO_INTENT_FOUND";
    }
  };
  this.launch = function() {
    if (typeof app.launchFunc === "function") {
      return Promise.resolve(app.launchFunc(request, response));
    } else {
      throw "NO_LAUNCH_FUNCTION";
    }
  };
  this.sessionEnded = function() {
    if (typeof app.sessionEndedFunc === "function") {
      return Promise.resolve(app.sessionEndedFunc(request, response));
    }
  };
  this.audioPlayer = function(event) {
    var eventHandlerObject = app.audioPlayerEventHandlers[event];
    if (typeof eventHandlerObject !== "undefined" && typeof eventHandlerObject["function"] === "function") {
      return Promise.resolve(eventHandlerObject["function"](request, response));
    }
  };
  this.playbackController = function(event) {
    var playbackEventHandlerObject = app.playbackControllerEventHandlers[event];
    if (typeof playbackEventHandlerObject !== "undefined" && typeof playbackEventHandlerObject["function"] === "function") {
      return Promise.resolve(playbackEventHandlerObject["function"](request, response));
    }
  };
  this.displayElementSelected = function() {
    if (typeof app.displayElementSelectedFunc === "function") {
      return Promise.resolve(app.displayElementSelectedFunc(request, response));
    } else {
      throw "NO_DISPLAY_ELEMENT_SELECTED_FUNCTION";
    }
  };
  this.custom = function(requestType) {
    if (typeof app.requestHandlers[requestType] === "function") {
      return Promise.resolve(app.requestHandlers[requestType](request, response, request_json));
    } else {
      throw "NO_CUSTOM_REQUEST_HANDLER";
    }
  };
};

alexa.apps = {};

alexa.app = function(name) {
  if (!(this instanceof alexa.app)) {
    throw new Error("Function must be called with the new keyword");
  }

  var self = this;
  this.name = name;
  this.messages = {
    // when an intent was passed in that the application was not configured to handle
    "NO_INTENT_FOUND": "Sorry, the application didn't know what to do with that intent",
    // when an AudioPlayer event was passed in that the application was not configured to handle
    "NO_AUDIO_PLAYER_EVENT_HANDLER_FOUND": "Sorry, the application didn't know what to do with that AudioPlayer event",
    // when the app was used with 'open' or 'launch' but no launch handler was defined
    "NO_LAUNCH_FUNCTION": "Try telling the application what to do instead of opening it",
    // when a request type was not recognized
    "INVALID_REQUEST_TYPE": "Error: not a valid request",
    // when a request was routed to custom handler, but no such handler was defined
    "NO_CUSTOM_REQUEST_HANDLER": "Error: no custom request handler found",
    // when a request and response don't contain session object
    // https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#request-body-parameters
    "NO_SESSION": "This request doesn't support session attributes",
    // if some other exception happens
    "GENERIC_ERROR": "Sorry, the application encountered an error",
    // User interacted with the display but no element selected handler has been defined.
    "NO_DISPLAY_ELEMENT_SELECTED_FUNCTION": "Try telling the application how to handle display events. Make sure displayElementSelected is implemented."
  };

  // persist session variables from every request into every response
  this.persistentSession = true;

  // use a minimal set of utterances or the full cartesian product
  this.exhaustiveUtterances = false;

  // a catch-all error handler do nothing by default
  this.error = null;

  // pre/post hooks to be run on every request
  this.pre = function( /*request, response, type*/ ) {};
  this.post = function( /*request, response, type*/ ) {};

  // a mapping of keywords to arrays of possible values, for expansion of sample utterances
  this.dictionary = {};
  this.intents = {};
  this.intent = function(intentName, schema, func) {
    if (typeof schema === "function") {
      func = schema;
      schema = {};
    }
    self.intents[intentName] = new alexa.intent(intentName, schema, func);
  };
  // handle custom/future request types
  this.requestHandlers = {};
  this.on = function(handlerName, handler) {
    self.requestHandlers[handlerName] = handler;
  };

  this.customSlots = {};
  this.customSlot = function(slotName, values) {
    self.customSlots[slotName] = [];

    values.forEach(function(value) {
      var valueObj;
      if (typeof value === "string") {
        valueObj = {
          value: value,
          id: null,
          synonyms: []
        };
      } else {
        valueObj = {
          value: value.value,
          id: value.id || null,
          synonyms: []
        };
        if (value.synonyms) {
          value.synonyms.forEach(function(sample) {
            var list = AlexaUtterances(sample,
              null,
              self.dictionary,
              self.exhaustiveUtterances);
            list.forEach(function(utterance) {
              valueObj.synonyms.push(utterance);
            });
          });
        }
      }
      self.customSlots[slotName].push(valueObj);
    });
  };

  this.audioPlayerEventHandlers = {};
  this.audioPlayer = function(eventName, func) {
    self.audioPlayerEventHandlers[eventName] = {
      "name": eventName,
      "function": func
    };
  };
  this.playbackControllerEventHandlers = {};
  this.playbackController = function(eventName, func) {
    self.playbackControllerEventHandlers[eventName] = {
      "name": eventName,
      "function": func
    };
  };
  this.launchFunc = null;
  this.launch = function(func) {
    self.launchFunc = func;
  };
  this.displayElementSelectedFunc = null;
  this.displayElementSelected = function(func) {
    self.displayElementSelectedFunc = func;
  };
  this.sessionEndedFunc = null;
  this.sessionEnded = function(func) {
    self.sessionEndedFunc = func;
  };
  this.request = function(request_json) {
    var request = new alexa.request(request_json);
    var response = new alexa.response(request.getSession());
    var router = new alexa.router(self, request, response, request_json);
    var postExecuted = false;
    var requestType = request.type();
    var promiseChain = Promise.resolve();

    request.getRouter = function() {
      return router;
    };
    // attach Promise resolve/reject functions to the response object
    response.send = function(exception) {
      response.prepare();
      var postPromise = Promise.resolve();
      if (typeof self.post == "function" && !postExecuted) {
        postExecuted = true;
        postPromise = Promise.resolve(self.post(request, response, requestType, exception));
      }
      return postPromise.then(function() {
        response.prepare();
        if (!response.resolved) {
          response.resolved = true;
        }
        return response.response;
      });
    };
    response.fail = function(msg, exception) {
      response.prepare();
      var postPromise = Promise.resolve();
      if (typeof self.post == "function" && !postExecuted) {
        postExecuted = true;
        postPromise = Promise.resolve(self.post(request, response, requestType, exception));
      }
      return postPromise.then(function() {
        response.prepare();
        if (!response.resolved) {
          response.resolved = true;
          throw msg;
        }
        // propagate successful response if it's already been resolved
        return response.response;
      });
    };

    return promiseChain.then(function() {
        // Call to `.pre` can also throw, so we wrap it in a promise here to
        // propagate errors to the error handler
        var prePromise = Promise.resolve();
        if (typeof self.pre == "function") {
          prePromise = Promise.resolve(self.pre(request, response, requestType));
        }
        return prePromise;
      }).then(function() {
        requestType = request.type();
        if (!response.resolved) {
          if ("IntentRequest" === requestType) {
            var intent = request_json.request.intent.name;
            return request.getRouter().intent(intent);
          } else if ("LaunchRequest" === requestType) {
            return request.getRouter().launch();
          } else if ("SessionEndedRequest" === requestType) {
            return request.getRouter().sessionEnded();
          } else if (request.isAudioPlayer()) {
            var event = requestType.slice(12);
            return request.getRouter().audioPlayer(event);
          } else if (request.isPlaybackController()) {
            var playbackControllerEvent = requestType.slice(19);
            return request.getRouter().playbackController(playbackControllerEvent);
          } else if ("Display.ElementSelected" === requestType) {
            return request.getRouter().displayElementSelected();
          } else if (typeof self.requestHandlers[requestType] === "function") {
            return request.getRouter().custom(requestType);
          } else {
            throw "INVALID_REQUEST_TYPE";
          }
        }
      })
      .then(function() {
        return response.send();
      })
      .catch(function(e) {
        if (typeof self.error == "function") {
          // Default behavior of any error handler is to send a response
          return Promise.resolve(self.error(e, request, response)).then(function() {
            if (!response.resolved) {
              response.resolved = true;
              return response.send();
            }
            // propagate successful response if it's already been resolved
            return response.response;
          });
        } else if (typeof e == "string" && self.messages[e]) {
          if (!request.isAudioPlayer()) {
            response.say(self.messages[e]);
            return response.send(e);
          } else {
            return response.fail(self.messages[e]);
          }
        }
        if (!response.resolved) {
          if (e.message) {
            return response.fail("Unhandled exception: " + e.message + ".", e);
          } else if (typeof e == "string") {
            return response.fail("Unhandled exception: " + e + ".", e);
          } else {
            return response.fail("Unhandled exception.", e);
          }
        }
        throw e;
      });
  };

  var skillBuilderSchema = function() {
    var schema = {
        "intents": [],
        "types": []
      },
      intentName, intent, key;
    for (intentName in self.intents) {
      intent = self.intents[intentName];
      var intentSchema = {
        "name": intent.name,
        "samples": []
      };
      if (intent.utterances && intent.utterances.length > 0) {
        intent.utterances.forEach(function(sample) {
          var list = AlexaUtterances(sample,
            intent.slots,
            self.dictionary,
            self.exhaustiveUtterances);
          list.forEach(function(utterance) {
            intentSchema.samples.push(utterance);
          });
        });
      }
      if (intent.slots && Object.keys(intent.slots).length > 0) {
        intentSchema["slots"] = [];
        for (key in intent.slots) {
          //  It's unclear whether `samples` is actually used for slots,
          // but the interaction model will not build without an (empty) array
          intentSchema.slots.push({
            "name": key,
            "type": intent.slots[key],
            "samples": []
          });
        }
      }
      schema.intents.push(intentSchema);
    }

    for (var slotName in self.customSlots) {
      var slotSchema = {
        name: slotName,
        values: []
      };

      var values = self.customSlots[slotName];
      values.forEach(function(value) {
        var valueSchema = {
          "id": value.id,
          "name": {
            "value": value.value,
            "synonyms": value.synonyms
          }
        };
        slotSchema.values.push(valueSchema);
      });

      schema.types.push(slotSchema);
    }
    return schema;
  };

  this.schemas = {
    intent: function() {
      var schema = {
          "intents": []
        },
        intentName, intent, key;
      for (intentName in self.intents) {
        intent = self.intents[intentName];
        var intentSchema = {
          "intent": intent.name
        };
        if (intent.slots && Object.keys(intent.slots).length > 0) {
          intentSchema["slots"] = [];
          for (key in intent.slots) {
            intentSchema.slots.push({
              "name": key,
              "type": intent.slots[key]
            });
          }
        }
        schema.intents.push(intentSchema);
      }
      return JSON.stringify(schema, null, 3);
    },

    skillBuilder: function() {
      var schema = skillBuilderSchema();
      return JSON.stringify(schema, null, 3);
    },
    askcli: function(invocationName) {
      var model = skillBuilderSchema();
      model.invocationName = invocationName || self.invocationName || self.name;
      var schema = {
        interactionModel: {
          languageModel: model
        }
      };
      return JSON.stringify(schema, null, 3);
    }
  };

  // extract the schema and generate a schema JSON object
  this.schema = function() {
    return this.schemas.intent();
  };

  // generate a list of sample utterances
  this.utterances = function() {
    var intentName,
      intent,
      out = "";
    for (intentName in self.intents) {
      intent = self.intents[intentName];
      if (intent.utterances) {
        intent.utterances.forEach(function(sample) {
          var list = AlexaUtterances(sample,
            intent.slots,
            self.dictionary,
            self.exhaustiveUtterances);
          list.forEach(function(utterance) {
            out += intent.name + " " + (utterance.replace(/\s+/g, " ")).trim() + "\n";
          });
        });
      }
    }
    return out;
  };

  // a built-in handler for AWS Lambda
  this.handler = function(event, context, callback) {
    self.request(event)
      .then(function(response) {
        callback(null, response);
      })
      .catch(function(response) {
        callback(response);
      });
  };

  // for backwards compatibility
  this.lambda = function() {
    return self.handler;
  };

  // attach Alexa endpoint to an express router
  //
  // @param object options.expressApp the express instance to attach to
  // @param router options.router router instance to attach to the express app
  // @param string options.endpoint the path to attach the router to (e.g., passing 'mine' attaches to '/mine')
  // @param bool options.checkCert when true, applies Alexa certificate checking (default true)
  // @param bool options.debug when true, sets up the route to handle GET requests (default false)
  // @param function options.preRequest function to execute before every POST
  // @param function options.postRequest function to execute after every POST
  // @throws Error when router or expressApp options are not specified
  // @returns this
  this.express = function(options) {
    if (!options.expressApp && !options.router) {
      throw new Error("You must specify an express app or an express router to attach to.");
    }

    var defaultOptions = {
      endpoint: "/" + self.name,
      checkCert: true,
      debug: false
    };

    options = defaults(options, defaultOptions);

    // In ExpressJS, user specifies their paths without the '/' prefix
    var deprecated = options.expressApp && options.router;
    var endpoint = deprecated ? '/' : normalizeApiPath(options.endpoint);
    var target = deprecated ? options.router : (options.expressApp || options.router);

    if (deprecated) {
      options.expressApp.use(normalizeApiPath(options.endpoint), options.router);
      console.warn("Usage deprecated: Both 'expressApp' and 'router' are specified.\nMore details on https://github.com/alexa-js/alexa-app/blob/master/UPGRADING.md");
    }

    if (options.debug) {
      target.get(endpoint, function(req, res) {
        var schemaName = req.query['schemaType'] || 'intent';
        var schema = self.schemas[schemaName] || function() {};

        if (typeof req.query['schema'] != "undefined") {
          res.set('Content-Type', 'text/plain').send(schema());
        } else if (typeof req.query['utterances'] != "undefined") {
          res.set('Content-Type', 'text/plain').send(self.utterances());
        } else {
          res.render("test", {
            "app": self,
            "schema": schema(),
            "utterances": self.utterances()
          });
        }
      });
    }

    if (options.checkCert) {
      target.use(endpoint, verifier);
    } else {
      target.use(endpoint, bodyParser.json());
    }

    // exposes POST /<endpoint> route
    target.post(endpoint, function(req, res) {
      var json = req.body,
        response_json;
      // preRequest and postRequest may return altered request JSON, or undefined, or a Promise
      Promise.resolve(typeof options.preRequest == "function" ? options.preRequest(json, req, res) : json)
        .then(function(json_new) {
          if (json_new) {
            json = json_new;
          }
          return json;
        })
        .then(self.request)
        .then(function(app_response_json) {
          response_json = app_response_json;
          return Promise.resolve(typeof options.postRequest == "function" ? options.postRequest(app_response_json, req, res) : app_response_json);
        })
        .then(function(response_json_new) {
          response_json = response_json_new || response_json;
          res.json(response_json).send();
        })
        .catch(function(err) {
          console.error(err);
          res.status(500).send("Server Error");
        });
    });

  };

  // add the app to the global list of named apps
  if (name) {
    alexa.apps[name] = self;
  }

  return this;
};

module.exports = alexa;
