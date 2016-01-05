var alexa = require('../'),
	ssml = require('ssml'),
	ssmlutil = require('../ssmlutil'),
	tap = require('tap');

var app = alexa.app();
app.response();

tap.test('Using SSML with .say() and .reprompt()', function(t) {
	app.clear();
	// Create a variety of chainable SSML and plain text phrases
	var first = new ssml().prosody({rate: '0.6'}).say('First thing.').up(),
		second = new ssml().say('Second thing.').break(500),
		third = 'Thing number 3.',
		fourth = new ssml().audio('https://foobar.com/audio/song.mp3');

	var intendedResponse = '<speak><prosody rate="0.6">First thing.</prosody> Second thing.<break time="500ms"/> Thing number 3. <audio src="https://foobar.com/audio/song.mp3"/></speak>';

	app.say(first).say(second).say(third).say(fourth);
	t.equal(app.response.response.outputSpeech.type, 'SSML', 'output type should be SSML');
	t.equal(app.response.response.outputSpeech.ssml, intendedResponse, 'should yield intended SSML document');

	app.clear();

	app.reprompt(first).reprompt(second).reprompt(third).reprompt(fourth);
	t.equal(app.response.response.reprompt.outputSpeech.type, 'SSML', 'output type should be SSML');
	t.equal(app.response.response.reprompt.outputSpeech.ssml, intendedResponse, 'should yield intended SSML document');

	t.done();
});

tap.test('Call app.clear() to get rid of .say() and .reprompt() data', function(t) {
	app.clear();

app.say('Foo').say('bar');
app.reprompt('Reply back').reprompt('quickly, please');

var response = app.response.response;
	t.notEqual(typeof response.outputSpeech, 'undefined');
	t.notEqual(typeof response.reprompt, 'undefined');
	app.clear();
	t.equal(typeof response.outputSpeech, 'undefined');
	t.equal(typeof response.reprompt, 'undefined');

	t.done();
});

tap.test('Display cleaned SSML in card', function(t) {
	app.clear();

	var message = new ssml().say('The time is')
		//.break(400)
		.say({
			'text': '01:59:59',
			'interpretAs': 'time',
			'format': 'hms24'
		})
		.break(500);

	var asSSML = message.toString({minimal: true});
	t.equal(asSSML, '<speak>The time is<say-as interpret-as="time" format="hms24">01:59:59</say-as><break time="500ms"/></speak>')

	app.card('Title', message, 'Subtitle');

	t.equal(app.response.response.card.title, 'Title');
	t.equal(app.response.response.card.subtitle, 'Subtitle');
	t.equal(app.response.response.card.content, 'The time is 01:59:59');

	app.clear();

	app.card('Title2');
	t.equal(app.response.response.card.title, 'Title2');
	t.equal(typeof app.response.response.card.content, 'undefined');

	t.done();
});

