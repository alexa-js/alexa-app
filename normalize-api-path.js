"use strict";

var path = require('path');

module.exports = function normalizeApiPath(apiPath) {
  return path.posix.normalize(path.posix.join('/', apiPath));
};
