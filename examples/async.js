var Plugins = require('..');
var plugins = new Plugins();

plugins
  .use(function (str, next) {
    next(null, str + 'a');
  })
  .use(function (str, next) {
    next(null, str + 'b');
  })
  .use(function (str, next) {
    next(null, str + 'c');
  });

plugins.run('alphabet-', function (err, str) {
  console.log(str); //=> 'alphabet-abc'
});