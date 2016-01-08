var alexa = require('../index.js'),
    app = new alexa.app('foobar'),
    tap = require('tap');

tap.test('fromStr', function(t) {

  app.intent('HelloWorld',
      {
          "utterances": [
              "hello world"
          ]
      },
      function(request, response) {
          response.say("hello world");
      }
  );
  console.log(app.utterances());
  console.log(app.schema());
  t.end();
});
