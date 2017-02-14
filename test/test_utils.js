/*jshint expr: true*/
"use strict";
var chai = require("chai");
var expect = chai.expect;
chai.config.includeStack = true;
var utils = require("../utils");

describe("Utils", function() {
  describe("#isValidFile", function() {
    it("verifies that 'README.md' does exists and is a file", function() {
      expect(utils.isValidFile('README.md')).to.be.true;
    });

    it("verifies that 'RANDOM.md' does not exists", function() {
      expect(utils.isValidFile('RANDOM.md')).to.be.false;
    });

    it("verifies that 'examples' is not a file", function() {
      expect(utils.isValidFile('examples')).to.be.false;
    });
  });

  describe("#isValidDirectory", function() {
    it("verifies that 'example' does exists and is a directory", function() {
      expect(utils.isValidDirectory('example')).to.be.true;
    });

    it("verifies that 'random' does not exists", function() {
      expect(utils.isValidDirectory('random')).to.be.false;
    });

    it("verifies that 'README.md' is not a directory", function() {
      expect(utils.isValidDirectory('README.md')).to.be.false;
    });
  });

  describe("#readFile", function() {
    it("successfully reads 'example.txt'", function() {
      expect(utils.readFile('test/example.txt')).to.equal("The quick brown fox jumps over the lazy dog");
    });

    it("throws an error when trying to read 'example.text'", function() {
      expect(function() {
        utils.readFile('test/example.text');
      }).to.throw(Error);
    });
  });

  describe("#readJsonFile", function() {
    it("successfully reads 'example.json'", function() {
      expect(utils.readJsonFile('test/example.json')).to.deep.equal({
        "pangram": "The quick brown fox jumps over the lazy dog"
      });
    });

    it("throws an error when trying to read 'example.jason'", function() {
      expect(function() {
        utils.readJsonFile('test/example.jason');
      }).to.throw(Error);
    });
  });

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
    ];

    tests.forEach(function(test) {
      it('correctly normalizes ' + test.original + ' into ' + test.final, function() {
        expect(utils.normalizeApiPath(test.original)).to.equal(test.final);
      });
    });
  });
});