var Plugins = require('..');
var plugins = new Plugins();

plugins
  .use(function (str) {
    return str + 'a';
  })
  .use(function (str) {
    return str + 'b';
  })
  .use(function (str) {
    return str + 'c';
  });

console.log(plugins.run('alphabet-'));
//=> 'alphabet-abc'