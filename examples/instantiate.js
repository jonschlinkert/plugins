var util = require('util');
var Plugins = require('..');

/**
 * Create your app and inherit `Plugins`
 */

function App() {
  this.plugins = new Plugins();
  this.tasks = {};
}
util.inherits(App, Plugins);

App.prototype.use = function() {
  return this.plugins.use.apply(this.plugins, arguments);
};

App.prototype.run = function() {
  return this.plugins.run.apply(this.plugins, arguments);
};

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