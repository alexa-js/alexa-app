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

    beforeEach(() => {
      app = express();
      app.use(bodyParser.json());
      app.set('views', path.join(__dirname, 'views'));
      app.set('view engine', 'ejs');
      testApp = new Alexa.app("testApp");
      testServer = app.listen(3000);
    });

    afterEach(() => {
      testServer.close();
    });

    context("#express with default options", function() {
      beforeEach(() => {
        testApp.express(app, '/')
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

      it("dumps debug schema", function() {
        return request(testServer)
          .get('/testApp')
          .expect(200).then(function(response) {
            expect(response.text).to.startWith('{"name":"testApp"')
          });
      });
    });

    context("#express with debug set to true", function() {
      beforeEach(() => {
        testApp.express(app, '/', true)
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
      beforeEach(() => {
        testApp.express(app, '/', false)
      });

      it("cannot dump debug schema", function() {
        return request(testServer)
          .get('/testApp')
          .expect(404);
      });
    });
  });
});
