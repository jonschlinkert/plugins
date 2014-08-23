/*!
 * plugins <https://github.com/jonschlinkert/plugins>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var arrayify = require('arrayify-compact');
var chalk = require('chalk');


/**
 * Initialize `Plugins`
 *
 * ```js
 * var Plugins = require('plugins');
 * var plugins = new Plugins();
 * ```
 * @constructor
 * @api public
 */

function Plugins() {
  if (!(this instanceof Plugins)) {
    return new Plugins()
  }
  this.plugins = [];
}


/**
 * Add a plugin `fn` to the `plugins` stack.
 *
 * ```js
 * plugins
 *   .use(foo({}))
 *   .use(bar({}))
 *   .use(baz({}))
 * ```
 *
 * **Params:**
 *
 * @param {Function} `fn` Plugin function to add to the `plugins` stack.
 * @return {Object} `Plugins` to enable chaining.
 * @api public
 */

Plugins.prototype.use = function (fn) {
  fn = arrayify(fn).filter(function(plugin) {
    if (typeof plugin !== 'function') {
      throw new TypeError('plugin() expected a function, but got:', chalk.magenta(plugin));
    }
    return true;
  }.bind(this));

  this.plugins = this.plugins.concat(fn);
  return this;
};


/**
 * Call each function in the `plugins` stack to iterate over `arguments`.
 *
 * ```js
 * plugins.run( arguments )
 * ```
 *
 * @param {Array|Object|String} `arguments` The value to iterate over.
 * @api public
 */

Plugins.prototype.run = function () {
  var args = [].slice.call(arguments);
  var len = args.length;
  var cb = args[len - 1];

  var plugins = this.plugins;

  if (Array.isArray(args[1])) {
    plugins = args[1];
    args.splice(1, 1);
  }

  var self = this;
  var i = 0, total = plugins.length;

  function next(err, results) {
    if (err) {
      err.message = chalk.red(err.message);
      throw new Error('plugin() exception', err);
    }

    args[0] = results;

    if(i < total) {
      plugins[i++].apply(self, args.concat(next.bind(this)));
    } else {
      cb.apply(null, arguments);
    }
  }

  // async handling
  if (typeof cb === 'function') {
    args.pop();
    plugins[i++].apply(self, args.concat(next.bind(this)));
  } else {
    var results = args.shift();
    for (i = 0; i < total; i++) {
      try {
        results = plugins[i].apply(this, [results].concat(args));
      } catch (err) {
        err.message = console.log(chalk.red(err.message));
        throw new Error('plugin() exception', err);
      }
    }
    return results;
  }
};


/**
 * Export `Plugins`
 *
 * @type {Object}
 */

module.exports = Plugins;