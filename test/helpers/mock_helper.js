"use strict";
var fs = require("fs");
var path = require("path");

function MockHelper() {}

MockHelper.prototype.load = function(mockFile) {
  var fixturePath = path.join(__dirname, "../../test/fixtures");
  return JSON.parse(fs.readFileSync(fixturePath + "/" + mockFile, "utf8"));
};

module.exports = new MockHelper();
