var Plugins = require('..');
var plugins = new Plugins();

var a = function (str, next) {
  next(null, str + 'a');
};
var b = function (str, next) {
  next(null, str + 'b');
};
var c = function (str, next) {
  next(null, str + 'c');
};

plugins.run('alphabet-', [a, b, c], function (err, str) {
  console.log(str); //=> 'alphabet-abc'
});