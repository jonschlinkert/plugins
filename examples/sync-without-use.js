var Plugins = require('..');
var plugins = new Plugins();

var a = function(val) {
  return val + 'a';
};
var b = function(val) {
  return val + 'b';
};
var c = function(val) {
  return val + 'c';
};

console.log(plugins.run('alphabet-', [a, b, c]));
//=> 'alphabet-abc'