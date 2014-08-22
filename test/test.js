/*!
 * plugins <https://github.com/jonschlinkert/plugins>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

var file = require('fs-utils');
var should = require('should');
var Plugins = require('..');


function fixture(filename) {
  return file.readFileSync('test/fixtures/' + filename);
}

function actual(filename, content) {
  return file.writeFileSync('test/actual/' + filename, content);
}


describe('plugins.run():', function () {

  describe('when a string is passed to plugins.run():', function () {
    it('should run the string through each plugin in the stack.', function () {
      var plugins = new Plugins();

      var foo = function(options) {
        return function(str) {
          var re = /[\r\n]/;
          return str.split(re).map(function (line, i) {
            return '\naaa' + line + 'bbb';
          }).join('');
        };
      };

      plugins
        .use(foo({a: 'b'}))
        .use(function (str) {
          return str + 'ccc';
        })
        .use(function (str) {
          return str + 'ddd';
        });

      var str = plugins.run(fixture('LICENSE-MIT'));
      /bbbcccddd$/.test(str).should.equal(true);
    });
  });

  describe('when a string and callback is passed to plugins.run():', function () {
    it('should run the string through each plugin in the stack.', function (done) {
      var plugins = new Plugins();

      var foo = function(options) {
        return function(str, next) {
          var re = /[\r\n]/;
          next(null, str.split(re).map(function (line, i) {
            return '\naaa' + line + 'bbb';
          }).join(''));
        };
      };

      plugins
        .use(foo({a: 'b'}))
        .use(function (str, next) {
          next(null, str + 'ccc');
        })
        .use(function (str, next) {
          next(null, str + 'ddd');
        });

      plugins.run(fixture('LICENSE-MIT'), function (err, str) {
        /bbbcccddd$/.test(str).should.equal(true);
        done();
      });
    });
  });


});




describe('when a plugin is passed:', function () {
  it('should run the function and return the result.', function () {
    var plugins = new Plugins();

    var src = function (options) {
      return function(filepath) {
        return fixture(filepath);
      }
    };

    plugins.use(src());
    var str = plugins.run('LICENSE-MIT');

    // Test the date in the license
    new RegExp((new Date).getUTCFullYear()).test(str).should.be.true;
  });
});


describe('when a plugin is passed with options:', function () {
  it('should run the function and return the result.', function () {
    var plugins = new Plugins();

    var src = function (options) {
      return function(filepath) {
        var year = new RegExp((new Date).getUTCFullYear());
        var str = fixture(filepath);
        return str.replace(year, options.year || '');
      }
    };

    plugins.use(src({year: 'Stardate 3000'}))

    var str = plugins.run('LICENSE-MIT');
    /Stardate/.test(str).should.be.true;
  });
});


describe('when a plugin is passed a file path:', function () {
  it('should read the file with the first plugin, then run the string through the rest of the stack.', function () {
    var plugins = new Plugins();

    var src = function (filepath, options) {
      return function() {
        return options.prepend + file.readFileSync(filepath);
      };
    };

    var append = function (footer) {
      return function(str) {
        return str + footer;
      };
    };

    var dest = function (filepath) {
      return function(str) {
        return actual(filepath, str);
      };
    };

    plugins
      .use(src('LICENSE-MIT', {prepend: 'banner'}), {local: 'options'})
      .use(append('footer.', {footer: 'opts'}), {a: 'b'})
      .use(dest('footer.md'));

    plugins.run({global: 'options'}, {c: 'd'}, {e: 'f'});
    file.exists('test/actual/footer.md').should.be.true;
    file.delete('test/actual/footer.md');
  });
});
