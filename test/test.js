/*!
 * plugins <https://github.com/jonschlinkert/plugins>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

var es = require('event-stream');
var file = require('fs-utils');
var should = require('should');
var Plugins = require('..');

function fixture(filename) {
  return file.readFileSync('test/fixtures/' + filename);
}

function actual(filename, content) {
  return file.writeFileSync('test/actual/' + filename, content);
}


describe('plugins:', function () {
  it('should run a plugin and return the result:', function () {
    var plugins = new Plugins();

    plugins.use(function(val) {
      return 'abc-' + val;
    });

    plugins.run('xyz').should.equal('abc-xyz')
  });


  it('should run a plugin with options:', function () {
    var plugins = new Plugins();

    var abc = function (opts) {
      return function(val) {
        return 'abc' + opts + val;
      }
    };

    plugins.use(abc('|'));
    plugins.run('xyz').should.equal('abc|xyz')
  });


  it('should run a stack of plugins passed directly to `.run()`:', function () {
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

    plugins.run('alphabet-', [a, b, c]).should.equal('alphabet-abc')
  });
});


describe('plugins.run() async:', function () {
  it('should run all of the plugins in a stack on an object:', function (done) {
    var plugins = new Plugins();

    plugins
      .use(function (val, next) {
        val.a = val.a || 'a'
        next(null, val);
      })
      .use(function (val, next) {
        val.a = val.a + 'b'
        next(null, val);
      })
      .use(function (val, next) {
        val.a = val.a + 'c'
        next(null, val);
      });

    plugins.run({a: ''}, function (err, val) {
      val.should.eql({a: 'abc'});
      done();
    });
  });

  it('should run all of the plugins in a stack on a string:', function (done) {
    var plugins = new Plugins();
    plugins
      .use(function (a, next) {
        next(null, a + 'a');
      })
      .use(function (a, next) {
        next(null, a + 'b');
      })
      .use(function (a, next) {
        next(null, a + 'c');
      });

    plugins.run('alphabet-', function (err, str) {
      str.should.eql('alphabet-abc');
      done();
    });
  });

  it('should run all of the plugins in a stack on an array:', function (done) {
    var plugins = new Plugins();

    plugins
      .use(function (arr, next) {
        arr.push('a')
        next(null, arr);
      })
      .use(function (arr, next) {
        arr.push('b')
        next(null, arr);
      })
      .use(function (arr, next) {
        arr.push('c')
        next(null, arr);
      });

    plugins.run([], function (err, arr) {
      arr.should.eql(['a', 'b', 'c']);
      done();
    });
  });

  it('should run the string through each plugin in the stack:', function (done) {
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

  it('should run a stack of plugins passed directly to `.run()`:', function (done) {
    var plugins = new Plugins();

    var a = function(val, next) {
      next(null, val + 'a');
    };
    var b = function(val, next) {
      next(null, val + 'b');
    };
    var c = function(val, next) {
      next(null, val + 'c');
    };

    plugins.run('alphabet-', [a, b, c], function (err, val) {
      val.should.equal('alphabet-abc');
      done();
    });
  });

  it('should run a stack of plugins passed directly to `.run()`:', function (done) {
    var plugins = new Plugins();

    var a = function(val, next) {
      next(null, val + 'a');
    };
    var b = function(val, next) {
      next(null, val + 'b');
    };
    var c = function(val, next) {
      next(null, val + 'c');
    };

    plugins.run('alphabet-', [a], function (err, val) {
      val.should.equal('alphabet-a');
    });
    plugins.run('alphabet-', [b], function (err, val) {
      val.should.equal('alphabet-b');
    });
    plugins.run('alphabet-', [c], function (err, val) {
      val.should.equal('alphabet-c');
      done();
    });
  });
});


describe('plugins.run() sync:', function () {
  it('should run all of the plugins in a stack synchronously:', function () {
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

    plugins.run('alphabet-').should.equal('alphabet-abc');
  });

  describe('when a string is passed to plugins.run():', function () {
    it('should run the string through each plugin in the stack:', function () {
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
});

describe('plugins.pipeline():', function () {
  it('should run a stack of streams:', function (done) {
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
      str.should.equal('alphabet-abc');
      this.emit('data', str);
    }, function () {
      this.emit('end');
    });

    output.on('end', done);
    input.pipe(plugins.pipeline()).pipe(output);

    input.write('alphabet-');
    input.end();
  });

  it('should run a stack of functions that return streams:', function (done) {
    var plugins = new Plugins();
    function append (suffix) {
      return function (options) {
        return es.through(function (str) {
          this.emit('data', str + options.delims[0] + suffix + options.delims[1]);
        });
      };
    }

    plugins
      .use(append('a'))
      .use(append('b'))
      .use(append('c'));

    var input = es.through();
    var output = es.through(function (str) {
      str.should.equal('alphabet- [a] [b] [c]');
      this.emit('data', str);
    }, function () {
      this.emit('end');
    });

    output.on('end', done);

    var options = {
      delims: [' [', ']']
    };
    input.pipe(plugins.pipeline(options)).pipe(output);

    input.write('alphabet-');
    input.end();
  });
});



describe('when a plugin is passed with options:', function () {
  it('should run the function and return the result:', function () {
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
  it('should read the file with the first plugin, then run the string through the rest of the stack:', function () {
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

