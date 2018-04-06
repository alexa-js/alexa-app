"use strict";
var chai = require("chai");
var expect = chai.expect;
chai.config.includeStack = true;
var normalizeApiPath = require("../lib/normalize-api-path");

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
        expect(normalizeApiPath(test.original)).to.equal(test.final);
      });
    });
  });
});
