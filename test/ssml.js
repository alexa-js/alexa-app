var SSML = require('../to-ssml');
var tap  = require('tap');


tap.test('fromStr', function(t) {
  var str = 'hello'; 
  var result = SSML.fromStr(str);
  t.equal(result, '<speak>hello</speak>');

  str = 'hello,   world!'; 
  result = SSML.fromStr(str);
  t.equal(result, '<speak>hello, world!</speak>');

  str = '32'; 
  result = SSML.fromStr(str);
  t.equal(result, '<speak>thirty two</speak>');

  str = '640'; 
  result = SSML.fromStr(str);
  t.equal(result, '<speak>six hundred and forty</speak>');

  t.end();
});


tap.test('cleanse', function(t) {
  t.equal(SSML.cleanse('<speak>hello</speak>'), ' hello ');
  t.equal(SSML.cleanse('<break>hello</break>'), ' hello ');
  t.equal(SSML.cleanse('<phoneme>hello</phoneme>'), ' hello ');
  t.equal(SSML.cleanse('<say-as>hello</say-as>'), ' hello ');

  t.end();
});
