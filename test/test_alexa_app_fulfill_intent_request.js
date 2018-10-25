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

        describe("#CanFulfillIntent_not_valid_request", function () {            

            it("valid regular intent request getCanFulfillIntent return undefined", function () {
                var mockRequest = mockHelper.load("intent_request_airport_info.json");
                var request = testApp.request(mockRequest);

                var handler = function (req, res) {
                    handler.result = req.getCanFulfillIntent();
                };
                testApp.pre = undefined;
                testApp.post = undefined;
                testApp.canFulfillIntent(handler);

                var subject = request.then(function (response) {
                    return handler.result;
                });
                return expect(subject).to.eventually.become(undefined);
            });

            it("valid regular request getCanFulfillIntent no intent return undefined", function () {                 
                var mockRequest = mockHelper.load("can_fulfill_intent_request_no_intent.json");
                var request = testApp.request(mockRequest);

                var handler = function (req, res){
                    handler.result = req.getCanFulfillIntent();
                };                   
                testApp.pre = undefined;
                testApp.post = undefined;
                testApp.canFulfillIntent(handler);

                var subject = request.then(function (response) {
                    return handler.result;
                });
                return expect(subject).to.eventually.become(undefined);                
            });

            it("valid regular request no intent response YES for canFulfill", function () {                 
                var mockRequest = mockHelper.load("can_fulfill_intent_request_no_intent.json");
                var request = testApp.request(mockRequest);

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

            it("valid regular request no intent response YES for canFulfill", function () {                 
                var mockRequest = mockHelper.load("can_fulfill_intent_request_no_intent.json");
                var request = testApp.request(mockRequest);

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

            it("valid regular request no intent response with YES for slot Sound", function () {
                var mockRequest = mockHelper.load("can_fulfill_intent_request_no_intent.json");
                var request = testApp.request(mockRequest);

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

        describe("#CanFulfillIntent_request", function () {

            describe("request", function () {
                var mockRequest = mockHelper.load("can_fulfill_intent_request_play_sound.json");

                var request = testApp.request(mockRequest);
                beforeEach(function () {
                    request = testApp.request(mockRequest);
                });                

                it("valid request getCanFulfillIntent return intent name PlaySound", function () {  
                    
                    var handler = function (req, res){
                        handler.result = req.getCanFulfillIntent().name;
                    };                   
                    testApp.pre = undefined;
                    testApp.post = undefined;
                    testApp.canFulfillIntent(handler);

                    var subject = request.then(function (response) {
                        return handler.result;
                    });
                    return expect(subject).to.eventually.become('PlaySound');
                    
                });

                it("valid request getCanFulfillIntent return Sound slot", function () {  
                    
                    var handler = function (req, res){
                        handler.result = req.getCanFulfillIntent().slots;
                    };                   
                    testApp.pre = undefined;
                    testApp.post = undefined;
                    testApp.canFulfillIntent(handler);

                    var subject = request.then(function (response) {
                        return handler.result.Sound;
                    });
                    return expect(subject).to.eventually.become({
                        "name": "Sound",                        
                        "value": "crickets"
                    });                    
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

                it("custom handler responds with YES for slot Sound", function () {
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

                it("custom handler responds with canUnderstand YES canFulfill No for slot Sound", function () {
                    testApp.pre = undefined;
                    testApp.post = undefined;
                    testApp.canFulfillIntent(function (req, res) {
                        res.canFulfillSlot("Sound","YES","NO");
                    });

                    var subject = request.then(function (response) {
                        return response.response.canFulfillIntent.slots;
                    });
                    return expect(subject).to.eventually.become({
                        "Sound": {
                            "canUnderstand": "YES",
                            "canFulfill": "NO"
                        }
                    });
                });

                it("custom handler responds with canUnderstand No canFulfill Yes for slot Sound", function () {
                    testApp.pre = undefined;
                    testApp.post = undefined;
                    testApp.canFulfillIntent(function (req, res) {
                        res.canFulfillSlot("Sound","NO","YES");
                    });

                    var subject = request.then(function (response) {
                        return response.response.canFulfillIntent.slots;
                    });
                    return expect(subject).to.eventually.become({
                        "Sound": {
                            "canUnderstand": "NO",
                            "canFulfill": "YES"
                        }
                    });
                });

                it("custom handler responds with YES for new slot Play", function () {
                    testApp.pre = undefined;
                    testApp.post = undefined;
                    testApp.canFulfillIntent(function (req, res) {
                        res.canFulfillSlot("Play","YES","YES");
                    });

                    var subject = request.then(function (response) {
                        return response.response.canFulfillIntent.slots;
                    });
                    return expect(subject).to.eventually.become({
                        "Sound": {
                            "canUnderstand": "NO",
                            "canFulfill": "NO"
                        },
                        "Play": {
                            "canUnderstand": "YES",
                            "canFulfill": "YES"
                        }
                    });
                });

            });
        });
    });
});
