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
var request = require("supertest-as-promised");
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
      app.use(bodyParser.json());
      app.set('views', path.join(__dirname, 'views'));
      app.set('view engine', 'ejs');
      testApp = new Alexa.app("testApp");
      testServer = app.listen(3000);
    });

    afterEach(function() {
      testServer.close();
    });

    context("#express fails when missing required field", function() {
      it("throws error on missing express app", function() {
        try {
          testApp.express({ router: express.Router() });
        } catch (er) {
          return expect(er.message).to.eq("You must specify an express instance to attach to.")
        }
      });

      it("throws error on missing express router", function() {
        try {
          testApp.express({ expressApp: app });
        } catch (er) {
          return expect(er.message).to.eq("You must specify an express router to attach.")
        }
      });

    });



    context("#express with default options", function() {
      beforeEach(function() {
        testApp.express({ expressApp: app, router: express.Router(), checkCert: false });
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
          .send({ x: 1 })
          .expect(200).then(function(response) {
            return expect(response.body.response.outputSpeech.ssml).to.eq("<speak>Error: not a valid request</speak>")
          });
      });

      it("does not dump debug schema", function() {
        return request(testServer)
          .get('/testApp')
          .expect(404);
      });
    });

    context("#express with debug set to true", function() {
      beforeEach(function() {
        testApp.express({ expressApp: app, router: express.Router(), checkCert: false, debug: true });
      });

      it("dumps debug schema", function() {
        return request(testServer)
          .get('/testApp')
          .expect(200).then(function(response) {
            expect(response.text).to.startWith('{"name":"testApp"')
          });
      });
    });

    context("#express with debug set to false", function() {
      beforeEach(function() {
        testApp.express({ expressApp: app, router: express.Router(), checkCert: false, debug: false });
      });

      it("cannot dump debug schema", function() {
        return request(testServer)
          .get('/testApp')
          .expect(404);
      });
    });
  });
});
