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
  this.stack = [];
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
  arrayify(fn).forEach(function(plugin) {
    if (typeof plugin !== 'function') {
      var msg = 'plugin.use() expected a function:' + plugin;
      throw new TypeError(chalk.bold(msg));
    }
    this.stack.push(plugin);
  }.bind(this));
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

  var stack = this.stack;

  if (Array.isArray(args[1])) {
    stack = args[1];
    args.splice(1, 1);
  }

  var self = this;
  var i = 0, total = stack.length;

  function next(err, results) {
    if (err) {
      err.message = console.log(chalk.bold(err.message));
      throw new Error('plugin.run():', err);
    }

    args[0] = results;

    if(i < total) {
      stack[i++].apply(self, args.concat(next.bind(this)));
    } else {
      cb.apply(null, arguments);
    }
  }

  // async handling
  if (typeof cb === 'function') {
    args.pop();
    stack[i++].apply(self, args.concat(next.bind(this)));
  } else {
    var results = args.shift();
    for (i = 0; i < total; i++) {
      try {
        results = stack[i].apply(this, [results].concat(args));
      } catch (err) {
        err.message = console.log(chalk.bold(err.message));
        throw new Error('plugin.run():', err);
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