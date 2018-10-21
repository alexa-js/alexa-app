/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var mockHelper = require("./helpers/mock_helper");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;

import * as Alexa from '..';

describe("Alexa", function () {
    describe("app", function () {
        var testApp = new Alexa.app("testApp");

        beforeEach(function () {
            testApp = new Alexa.app("testApp");
        });

        describe("#CanFulfillIntent_request", function () {
            describe("response", function () {
                var mockRequest = mockHelper.load("can_fulfill_intent_request_play_sound.json");
                var request = testApp.request(mockRequest);

                it("no handler responds with a exception", function() {                    
          
                    var subject = request.then(function(response) {
                      return response.response;
                    });
                    return expect(subject).to.eventually.be.rejectedWith("NO_CAN_FULFILL_FUNCTION");
                  });
            });
        });
    });
});
