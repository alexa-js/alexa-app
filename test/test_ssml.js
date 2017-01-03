'use strict';

var chai = require('chai'),
  should = require('chai').should(),
  SSML = require('../to-ssml');

var PlainStrings = [
    'This output speech uses SSML.',
    'This is a sentence',
    'This is what Alexa sounds like without any SSML.'
  ],
  EmbeddedSSMLStrings = [
    'Here is a number <w role="ivona:VBD">read</w> as a cardinal number:',
    '<say-as interpret-as="cardinal">12345</say-as>.',
    'Here is a word spelled out: <say-as interpret-as="spell-out">hello</say-as>.',
    'You say, <phoneme alphabet="ipa" ph="pɪˈkɑːn">pecan</phoneme>. I say, <phoneme alphabet="ipa" ph="ˈpi.kæn">pecan</phoneme>.',
    "<s>This is a sentence</s>\n<s>There should be a short pause before this second sentence</s>\nThis sentence ends with a period and should have the same pause."
  ];

describe('SSML', function() {
  describe('#conversion', function() {
    describe('convert to SSML', function() {

      describe('plain string to SSML conversion', function() {
        for (var i = 0; i < PlainStrings.length; i++) {
          (function(i) {
            it('should wrap a plain string in <speak> tags', function() {
              var expectedOutput = '<speak>' + PlainStrings[i] + '</speak>';

              return SSML.fromStr(PlainStrings[i]).should.equal(expectedOutput);
            });
          })(i);
        }
      });

      describe('strings with embedded SSML tags', function() {
        for (var i = 0; i < EmbeddedSSMLStrings.length; i++) {
          (function(i) {
            it('should wrap these strings in <speak> tags', function() {
              var expectedOutput = '<speak>' + EmbeddedSSMLStrings[i] + '</speak>';

              return SSML.fromStr(EmbeddedSSMLStrings[i]).should.equal(expectedOutput);
            });
          })(i);
        }
      });

      describe('strings appended to current SSML string', function() {
        it('should append prior to the trailing </speak> tag', function() {
          var outputSpeech = SSML.fromStr(PlainStrings[0]);
          for (var i = 1; i < PlainStrings.length; i++) {
            outputSpeech = SSML.fromStr(PlainStrings[i], outputSpeech);
          }

          return outputSpeech.should.equal('<speak>' + PlainStrings.join(' ') + '</speak>');
        })
      });

      describe('SSML strings without embedded SSML tags appended to current SSML string', function() {
        it('should append prior to the trailing </speak> tag', function() {
          var outputSpeech = SSML.fromStr(PlainStrings[0]);
          for (var i = 1; i < PlainStrings.length; i++) {
            outputSpeech = SSML.fromStr('<speak>' + PlainStrings[i] + '</speak>', outputSpeech);
          }

          return outputSpeech.should.equal('<speak>' + PlainStrings.join(' ') + '</speak>');
        })
      });

      describe('SSML strings with embedded SSML tags appended to current SSML string', function() {
        it('should append prior to the trailing </speak> tag', function() {
          var outputSpeech = SSML.fromStr(EmbeddedSSMLStrings[0]);
          for (var i = 1; i < EmbeddedSSMLStrings.length; i++) {
            outputSpeech = SSML.fromStr('<speak>' + EmbeddedSSMLStrings[i] + '</speak>', outputSpeech);
          }

          return outputSpeech.should.equal('<speak>' + EmbeddedSSMLStrings.join(' ') + '</speak>');
        })
      });
    });
  });

  describe('#cleanse', function() {

    // the following are used to take SSML output and cleanse for use in Cards
    describe('cleanse SSML', function() {

      describe('cleanse simple SSML', function() {
        for (var i = 0; i < PlainStrings.length; i++) {
          (function(i) {
            it('should remove <speak> tags', function() {
              var expectedOutput = PlainStrings[i];

              return SSML.cleanse(SSML.fromStr(PlainStrings[i])).should.equal(expectedOutput);
            });
          })(i);
        }
      });

      describe('cleanse SSML with embedded tags', function() {
        it('should remove <speak> and embedded <audio> SSML tags', function() {
          var input = '<speak>Welcome to Car-Fu. <audio src="https://carfu.com/audio/carfu-welcome.mp3" /> You can order a ride, or request a fare estimate. Which will it be?</speak>';
          var expectedOutput = 'Welcome to Car-Fu. You can order a ride, or request a fare estimate. Which will it be?';

          return SSML.cleanse(input).should.equal(expectedOutput);
        });

        it('should remove <speak> and embedded <break> SSML tags', function() {
          var input = '<speak>There is a three second pause here <break time="3s"/> then the speech continues.</speak>';
          var expectedOutput = 'There is a three second pause here then the speech continues.';

          return SSML.cleanse(input).should.equal(expectedOutput);
        });

        it('should remove <speak> but not embedded <p> SSML/HTML tags', function() {
          var input = '<speak><p>This is the first paragraph. There should be a pause after this text is spoken.</p><p>This is the second paragraph.</p></speak>';
          var expectedOutput = '<p>This is the first paragraph. There should be a pause after this text is spoken.</p><p>This is the second paragraph.</p>';

          return SSML.cleanse(input).should.equal(expectedOutput);
        });

        it('should remove <speak> and embedded <phoneme> tags', function() {
          var input = '<speak>You say, <phoneme alphabet="ipa" ph="pɪˈkɑːn">pecan</phoneme>. I say, <phoneme alphabet="ipa" ph="ˈpi.kæn">pecan</phoneme>.</speak>';
          var expectedOutput = 'You say, pecan. I say, pecan.';

          return SSML.cleanse(input).should.equal(expectedOutput);
        });

        it('should remove <speak> and embedded <s> SSML tags', function() {
          var input = "<speak><s>This is a sentence</s>\n<s>There should be a short pause before this second sentence</s>\nThis sentence ends with a period and should have the same pause.</speak>";
          var expectedOutput = "This is a sentence\nThere should be a short pause before this second sentence\nThis sentence ends with a period and should have the same pause.";

          return SSML.cleanse(input).should.equal(expectedOutput);
        });

        it('should remove <speak> and embedded <say-as> tags', function() {
          var input = '<speak><say-as interpret-as="cardinal">12345</say-as>.</speak>';
          var expectedOutput = '12345.';

          return SSML.cleanse(input).should.equal(expectedOutput);
        });

        it('should remove <speak> and embedded <w> SSML tags', function() {
          var input = '<speak>Here is a number <w role="ivona:VBD">read</w> as a cardinal number:</speak>';
          var expectedOutput = 'Here is a number read as a cardinal number:';

          return SSML.cleanse(input).should.equal(expectedOutput);
        });

        it('should remove <speak> and embedded SSML/non-HTML tags, leaving other tags', function() {
          var input = '<speak>This sentence has <say-as interpret-as="cardinal">1</say-as> embedded <strong>strong</strong>tag.</speak>';
          var expectedOutput = 'This sentence has 1 embedded <strong>strong</strong>tag.';

          return SSML.cleanse(input).should.equal(expectedOutput);
        });

      });
    });
  });
});
