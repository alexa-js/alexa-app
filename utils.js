var path = require('path');

var normalizeApiPath = function(apiPath) {
  return path.posix.normalize(path.posix.join('/', apiPath));
};

module.exports = {
  normalizeApiPath  : normalizeApiPath
};