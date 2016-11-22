/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var mockHelper = require("./helpers/mock_helper");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;


describe("Alexa", function() {
    var Alexa = require("../index");
    describe("app", function() {
        var app = new Alexa.app("myapp");
        context("with an audioPlayer intent", function() {
            describe("request", function() {
                var mockRequest = mockHelper.load("intent_audioplayer.json");
                it("includes the context object", function() {
                    return expect(mockRequest.request).to.have.property("context");
                });
                it("request includes AudioPlayer object", function() {
                    return expect(mockRequest.request).to.have.property("AudioPlayer");
                });
            });
            describe("response", function() {
                context("alexa directive response", function() {
                    it("responds with alexa response AudioPlayer directive", function() {
                        var mockRequest = mockHelper.load("intent_audioplayer.json"),
                            subject = app.request(mockRequest);
                        subject = subject.then(function(response) {
                            console.log('response --->', response);
                            return response.response.directives;
                        });
                        return expect(subject).to.eventually.be.an("array");
                    });
                });
            });
        });
    });
});
