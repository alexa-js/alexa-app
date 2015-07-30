var alexa = require('../index.js'),
    app = new alexa.app('foobar');

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
