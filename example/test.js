var alexa = require("../index.js");
var template = require("./template.js");

var app = new alexa.app("test");

app.dictionary = {
  "names": ["Bob", "Jack", "Matt", "Mary", "Jane", "Bill"]
};

app.launch(function(request, response) {
  response.say("App launched!");
});

app.intent("sampleIntent", {
    "slots": { "NAME": "LITERAL", "AGE": "NUMBER" },
    "utterances": ["my {name is|name's} {names|NAME} and {I am|I'm} {1-100|AGE}{ years old|}"]
  },
  function(request, response) {
    setTimeout(function() {
      response.say("After timeout!").say(" test ").reprompt("Reprompt");
      response.send();
    }, 1000);
    // We are async!
    return false;
  }
);

app.intent("errorIntent", function(request, response) {
  response.say(someVariableThatDoesntExist);
});

// output the schema
console.log("\n\nSCHEMA:\n\n" + app.schema() + "\n\n");
// output sample utterances
console.log("\n\nUTTERANCES:\n\n" + app.utterances() + "\n\n");

// test pre() and post() functions
app.pre = function(request, response, type) {
  response.say("This part of the output is from pre(). ");
};
app.post = function(request, response, type, exception) {
  if (exception) {
    response.clear().say("An error occured: " + exception).send();
  }
};

// error example
app.request(template.errorIntent)
  .then(function(response) {
    console.log(JSON.stringify(response, null, 3));
  });

// async example
app.request(template.intent)
  .then(function(response) {
    console.log(JSON.stringify(response, null, 3));
  });

// synchronous example
app.request(template.launch)
  .then(function(response) {
    console.log(JSON.stringify(response, null, 3));
  });

// error example
app.messages.NO_INTENT_FOUND = "Why you called dat intent? I don't know bout dat";
app.request(template.missingIntent)
  .then(function(response) {
    console.log(JSON.stringify(response, null, 3));
  });

// error handler example
app.error = function(e, request, response) {
  response.say("I captured the exception! It was: " + e.message);
};
app.request(template.errorIntent)
  .then(function(response) {
    console.log(JSON.stringify(response, null, 3));
  });
