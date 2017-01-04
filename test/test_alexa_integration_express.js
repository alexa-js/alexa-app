/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;
chai.config.includeStack = true;
var mockHelper = require("./helpers/mock_helper");
var sinon = require("sinon");
var express = require('express');
var request = require("supertest-as-promised");
var bodyParser = require('body-parser');

describe("Alexa", function() {
  var Alexa = require("../index");

  describe("app", function() {
    var testServer;

    beforeEach(() => {
      var app = express();
      app.use(bodyParser.json());
      var testApp = new Alexa.app("testApp");
      testApp.express(app, '/', true)
      testServer = app.listen(3000);
    });

    afterEach(() => {
      testServer.close();
    });

    describe("#express", function() {
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
    });
  });
});
