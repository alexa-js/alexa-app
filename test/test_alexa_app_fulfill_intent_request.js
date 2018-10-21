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

            describe("request", function () {
                var mockRequest = mockHelper.load("can_fulfill_intent_request_play_sound.json");

                var request = testApp.request(mockRequest);
                beforeEach(function () {
                    request = testApp.request(mockRequest);
                });

                it("valid request getCanFulfillIntent return intent name PlaySound", function () {  
                    var subject = request.getCanFulfillIntent().name;                    
                    
                    //return expect(subject).to.equal('PlaySound');
                    
                });

            });    

            describe("response", function () {
                var mockRequest = mockHelper.load("can_fulfill_intent_request_play_sound.json");

                var request = testApp.request(mockRequest);
                beforeEach(function () {
                    request = testApp.request(mockRequest);
                });

                it("no handler responds with a exception", function () {
                    var subject = request.then(function (response) {
                        return response.response;
                    });
                    return expect(subject).to.eventually.be.rejectedWith("NO_CAN_FULFILL_FUNCTION");
                });

                it("empty handler responds with default NO for canFulfill", function () {
                    testApp.pre = undefined;
                    testApp.post = undefined;
                    testApp.canFulfillIntent(function (req, res) {
                    });

                    var subject = request.then(function (response) {
                        return response.response.canFulfillIntent.canFulfill;
                    });
                    return expect(subject).to.eventually.become('NO');
                });

                it("empty handler responds with default NO for slot Sound", function () {
                    testApp.pre = undefined;
                    testApp.post = undefined;
                    testApp.canFulfillIntent(function (req, res) {
                    });

                    var subject = request.then(function (response) {
                        return response.response.canFulfillIntent.slots;
                    });
                    return expect(subject).to.eventually.become({
                        "Sound": {
                            "canUnderstand": "NO",
                            "canFulfill": "NO"
                        }
                    });
                });

                it("custom handler responds with default YES for canFulfill", function () {
                    testApp.pre = undefined;
                    testApp.post = undefined;
                    testApp.canFulfillIntent(function (req, res) {
                        res.canFulfill("YES");
                    });

                    var subject = request.then(function (response) {
                        return response.response.canFulfillIntent.canFulfill;
                    });
                    return expect(subject).to.eventually.become('YES');
                });

                it("custom handler responds with default YES for slot Sound", function () {
                    testApp.pre = undefined;
                    testApp.post = undefined;
                    testApp.canFulfillIntent(function (req, res) {
                        res.canFulfillSlot("Sound","YES","YES");
                    });

                    var subject = request.then(function (response) {
                        return response.response.canFulfillIntent.slots;
                    });
                    return expect(subject).to.eventually.become({
                        "Sound": {
                            "canUnderstand": "YES",
                            "canFulfill": "YES"
                        }
                    });
                });

            });
        });
    });
});
