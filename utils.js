var fs = require('fs');
var path = require('path');

var isValidDirectory = function(dir) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
};

var isValidFile = function(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile();
};

var readFile = function(file) {
  return fs.readFileSync(file, 'utf8');
};

var readJsonFile = function(file) {
  return JSON.parse(readFile(file));
};

var normalizeApiPath = function(apiPath) {
  return path.posix.normalize(path.posix.join('/', apiPath));
};

module.exports = {
  isValidDirectory  : isValidDirectory,
  isValidFile       : isValidFile,
  readFile          : readFile,
  readJsonFile      : readJsonFile,
  normalizeApiPath  : normalizeApiPath
};