var Plugins = require('..');
var plugins = new Plugins();

plugins
  .use(function (val, next) {
    next(null, val += 'a');
  })
  .use(function (val, next) {
    next(null, val += 'b');
  })
  .use(function (val, next) {
    next(null, val += 'c');
  });

plugins.run('alphabet-', function (err, res) {
  console.log(res); //=> 'alphabet-abc'
});