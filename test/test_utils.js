"use strict";
var chai = require("chai");
var expect = chai.expect;
chai.config.includeStack = true;
var utils = require("../utils");

describe("Utils", function() {

  describe("#normalizeApiPath", function() {
    var tests = [
      { original: "alexa",       final: "/alexa" },
      { original: "/alexa",      final: "/alexa" },
      { original: "//alexa",     final: "/alexa" },
      { original: "///alexa",    final: "/alexa" },
      { original: "alexa/",      final: "/alexa/" },
      { original: "alexa//",     final: "/alexa/" },
      { original: "alexa///",    final: "/alexa/" },
      { original: "/alexa/",     final: "/alexa/" },
      { original: "//alexa//",   final: "/alexa/" },
      { original: "///alexa///", final: "/alexa/" },
      { original: "///api///alexa///", final: "/api/alexa/" }
    ];

    tests.forEach(function(test) {
      it('correctly normalizes ' + test.original + ' into ' + test.final, function() {
        expect(utils.normalizeApiPath(test.original)).to.equal(test.final);
      });
    });
  });
});