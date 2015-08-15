var util = require('util');
var Plugins = require('..');
var plugins = new Plugins();

/**
 * Create your app and inherit `Plugins`
 */

function App() {
  Plugins.call(this);
  this.tasks = {};
}
util.inherits(App, Plugins);

/**
 * Useage
 */

var app = new App();

app.use(function (str) {
    return str + 'a';
  })
  .use(function (str) {
    return str + 'b';
  })
  .use(function (str) {
    return str + 'c';
  });

console.log(app.run('alphabet-'));
//=> 'alphabet-abc'