var express = require("express");
var alexa = require("../index.js");
var bodyParser = require("body-parser");


var PORT = process.env.port || 8080;
var app = express();

// ALWAYS setup the alexa app and attach it to express before anything else.
var alexaApp = new alexa.app("test");

// checkCert verifies requests come from amazon alexa. Must be enabled for production.
// you can disable this if you're running a dev environment and want to POST things
// to test behavior. enabled by default.
var checkCert = false

// enableDebug sets up a GET route when set to true. This is handy for testing in 
// development, but not recommended for production. disabled by default
var enableDebug = true
alexaApp.express(app, express.Router(), "/echo/", checkCert, enableDebug);

// here you can setup any other express routes or middlewares as normal
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");


alexaApp.launch(function(request, response) {
  response.say("You launched the app!");
});

alexaApp.dictionary = { "names": ["matt", "joe", "bob", "bill", "mary", "jane", "dawn"] };

alexaApp.intent("nameIntent", {
    "slots": { "NAME": "LITERAL" },
    "utterances": [
      "my {name is|name's} {names|NAME}", "set my name to {names|NAME}"
    ]
  },
  function(request, response) {
    response.say("Success!");
  }
);

app.listen(PORT);
console.log("Listening on port " + PORT + ", try http://localhost:" + PORT + "/echo/test");
