var Plugins = require('..');
var plugins = new Plugins();

plugins
  .use(function (val, next) {
    next(null, val.concat('a'));
  })
  .use(function (val, next) {
    next(null, val.concat('b'));
  })
  .use(function (val, next) {
    next(null, val.concat('c'));
  });

plugins.run(['alphabet-'], function (err, res) {
  console.log(res); //=> 'alphabet-abc'
});