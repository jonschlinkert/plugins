var es = require('event-stream');
var Plugins = require('..');
var plugins = new Plugins();

plugins
  .use(es.through(function (str) {
    this.emit('data', str + 'a');
  }))
  .use(es.through(function (str) {
    this.emit('data', str + 'b');
  }))
  .use(es.through(function (str) {
    this.emit('data', str + 'c');
  }));

var input = es.through();
var output = es.through(function (str) {
  console.log(str);
  this.emit('data', str);
}, function () {
  this.emit('end');
});

output.on('end', function (err) {
  if (err) console.log(err);
});

input
  .pipe(plugins.pipeline())
  .pipe(output);

input.write('alphabet-');
input.end();