/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var chaiString = require('chai-string');
chai.use(chaiString);
var expect = chai.expect;
chai.config.includeStack = true;
var mockHelper = require("./helpers/mock_helper");
var sinon = require("sinon");
var express = require('express');
var request = require("supertest");
var bodyParser = require('body-parser');
var path = require('path');

describe("Alexa", function() {
  var Alexa = require("../index");

  describe("app", function() {
    var app;
    var testServer;
    var testApp;

    beforeEach(function() {
      app = express();
      app.set('views', path.join(__dirname, 'views'));
      app.set('view engine', 'ejs');
      testApp = new Alexa.app("testApp");
      testServer = app.listen(3000);
    });

    afterEach(function() {
      testServer.close();
    });

    context("#express fails when missing required field", function() {
      it("throws error on missing express app and express router", function() {
        try {
          testApp.express({});
        } catch (er) {
          return expect(er.message).to.eq("You must specify an express app or an express router to attach to.")
        }
      });
    });

    context("#express warns when redundant param is passed", function() {
      it("warns on given both params 'expressApp' and 'router'", function() {
        var bkp = console.warn.bind();
        console.warn = sinon.spy();
        testApp.express({
          expressApp: app,
          router: express.Router()
        });
        var warning = "Usage deprecated: Both 'expressApp' and 'router' are specified.\nMore details on https://github.com/alexa-js/alexa-app/blob/master/UPGRADING.md";
        expect(console.warn).to.have.been.calledWithExactly(warning);
        console.warn = bkp;
      });
    });

    context("#express with default options", function() {
      beforeEach(function() {
        testApp.express({
          expressApp: app,
          checkCert: false
        });
      });

      it("returns a response for a valid request", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");

        return request(testServer)
          .post('/testApp')
          .send(mockRequest)
          .expect(200).then(function(response) {
            return expect(response.body.response.outputSpeech.ssml).to.eq("<speak>Sorry, the application didn't know what to do with that intent</speak>")
          });
      });

      it("speaks an invalid request", function() {
        return request(testServer)
          .post('/testApp')
          .send({
            x: 1
          })
          .expect(200).then(function(response) {
            return expect(response.body.response.outputSpeech.ssml).to.eq("<speak>Error: not a valid request</speak>")
          });
      });

      it("does not dump debug schema", function() {
        return request(testServer)
          .get('/testApp')
          .expect(404);
      });

      it("fails with server error on bad request", function() {
        testApp.pre = function() {
          throw "SOME ERROR";
        };
        return request(testServer)
          .post('/testApp')
          .send()
          .expect(500).then(function(response) {
            return expect(response.error.text).to.eq("Server Error");
          });
      });
    });

    context("#express with debug set to true", function() {
      beforeEach(function() {
        testApp.intent("myIntent", {
          "slots": {
            "NAME": "LITERAL",
            "AGE": "NUMBER"
          },
          "utterances": ["my name is bob"]
        });

        testApp.express({
          expressApp: app,
          checkCert: false,
          debug: true
        });
      });

      context("when no schema type is sent", function() {
        it("dumps default debug schema", function() {
          return request(testServer)
            .get('/testApp')
            .expect(200).then(function(response) {
              expect(response.text).to.startWith('{"name":"testApp"')
            });
        });

        it("returns default debug schema", function() {
          return request(testServer)
            .get('/testApp?schema')
            .expect(200).then(function(response) {
              expect(response.headers['content-type']).to.equal('text/plain; charset=utf-8');
              expect(response.text).to.eq(testApp.schema());
            });
        });
      })

      context("when the skill builder schema type is sent", function() {
        it("dumps skill builder debug schema", function() {
          return request(testServer)
            .get('/testApp?schemaType=skillBuilder')
            .expect(200).then(function(response) {
              expect(response.text).to.startWith('{"name":"testApp"')
            });
        });

        it("returns default debug schema", function() {
          return request(testServer)
            .get('/testApp?schema&schemaType=skillBuilder')
            .expect(200).then(function(response) {
              expect(response.headers['content-type']).to.equal('text/plain; charset=utf-8');
              expect(response.text).to.eq(testApp.schemas.skillBuilder());
            });
        });

        it("returns empty schema for invalid schema type", function() {
          return request(testServer)
            .get('/testApp?schema&schemaType=invalid')
            .expect(200).then(function(response) {
              expect(response.headers['content-type']).to.equal('text/plain; charset=utf-8');
              expect(response.text).to.eq('');
            });
        });
      })

      it("returns debug utterances", function() {
        return request(testServer)
          .get('/testApp?utterances')
          .expect(200).then(function(response) {
            expect(response.headers['content-type']).to.equal('text/plain; charset=utf-8');
            expect(response.text).to.eq(testApp.utterances());
          });
      });
    });

    context("#express with debug set to true and has empty intents", function() {
      beforeEach(function() {
        testApp.intent("emptyIntent");

        testApp.express({
          expressApp: app,
          checkCert: false,
          debug: true
        });
      });

      it("returns no utterances", function() {
        return request(testServer)
          .get('/testApp?utterances')
          .expect(200).then(function(response) {
            expect(response.headers['content-type']).to.equal('text/plain; charset=utf-8');
            expect(response.text).to.eq('');
          });
      });
    });

    context("#express with debug set to false", function() {
      beforeEach(function() {
        var router = express.Router();
        testApp.express({
          router: router,
          checkCert: false,
          debug: false
        });
        app.use(router);
      });

      it("cannot dump debug schema", function() {
        return request(testServer)
          .get('/testApp')
          .expect(404);
      });
    });

    context("#express with pre and post functions", function() {
      var fired = {};
      var mockRequest = mockHelper.load("intent_request_airport_info.json");

      beforeEach(function() {
        testApp.express({
          expressApp: app,
          checkCert: false,
          preRequest: function(json, request, response) {
            fired.preRequest = json;
          },
          postRequest: function(json, request, response) {
            fired.postRequest = json;
          }
        });
      });

      it("invokes pre and post functions", function() {
        return request(testServer)
          .post('/testApp')
          .send(mockRequest)
          .expect(200).then(function() {
            expect(fired.preRequest).to.eql(mockRequest);
            expect(fired.postRequest.response.outputSpeech.type).to.equal("SSML");
          });
      });
    });

    context("#express with debug and checkCert=true", function() {
      beforeEach(function() {
        testApp.express({
          expressApp: app,
          checkCert: true,
          debug: true
        });
      });

      it("requires a cert header", function() {
        return request(testServer)
          .post('/testApp')
          .expect(400).then(function(res) {
            expect(res.body.status).to.equal("failure");
            expect(res.body.reason).to.equal("missing certificate url");
          });
      });

      it("checks cert header", function() {
        return request(testServer)
          .post('/testApp')
          .set('signaturecertchainurl', 'dummy')
          .set('signature', 'dummy')
          .expect(400).then(function(res) {
            expect(res.body.status).to.equal("failure");
            expect(res.body.reason).to.equal("missing request (certificate) body");
          });
      });


      it("checks cert header with data", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");
        return request(testServer)
          .post('/testApp')
          .set('signaturecertchainurl', 'dummy')
          .set('signature', 'dummy')
          .send(mockRequest)
          .expect(400).then(function(res) {
            expect(res.body.status).to.equal("failure");
            expect(res.body.reason).to.equal("invalid signature (not base64 encoded)");
          });
      });

      it("does not check cert on GET and returns debug schema", function() {
        return request(testServer)
          .get('/testApp?schema')
          .expect(200).then(function(response) {
            expect(response.headers['content-type']).to.equal('text/plain; charset=utf-8');
            expect(response.text).to.eq(testApp.schema());
          });
      });
    });
  });
});
