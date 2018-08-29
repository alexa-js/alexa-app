/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var mockHelper = require("./helpers/mock_helper");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;

import * as Alexa from "..";

describe("Alexa", function () {
  describe("app", function () {
    describe("isp request", function () {
      describe("response", function () {

        var mockRequest = mockHelper.load("isp_response_request.json");
        var testApp;

        beforeEach(function () {
          testApp = new Alexa.app("testApp");
        });

        it("doesn't fail with 'Error: not a valid request'", function () {
          var subject = testApp.request(mockRequest)
            .then(function (response) {
              return response.response;
            });

          return expect(subject).to.eventually.become({
            "directives": [],
            "shouldEndSession": true
          });
        });
      });
    });
  });
});
