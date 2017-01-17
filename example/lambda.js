var alexa = require("alexa-app");
var find = require("find-my-iphone");

var app = new alexa.app();
app.launch(function(request, response) {
  find("me@icloud.com", "mypassword", "iPhone", function() {
    response.say("OK").send();
  });
  // because this is an async handler
  return false;
});

// connect to lambda
exports.handler = app.lambda();
