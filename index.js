/*!
 * plugins <https://github.com/jonschlinkert/plugins>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var arrayify = require('arrayify-compact');


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
  this.plugins = [];
}


/**
 * Add a plugin `fn` to the plugins.
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
 * @return {Plugins}  for chaining.
 * @api public
 */

Plugins.prototype.use = function (fn) {
  fn = arrayify(fn).filter(function(plugin) {
    if (typeof plugin !== 'function') {
      throw new TypeError('plugin() exception', plugin);
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

  var self = this;
  var idx = 0, total = this.plugins.length;

  function next(err, results) {
    if (err) {
      throw new Error('plugin() exception', err);
    }
    args[0] = results;
    if(idx < total) {
      this.plugins[idx++].apply(self, args.concat(next.bind(this)));
    } else {
      cb.apply(null, arguments);
    }
  }

  // do async
  if (typeof cb === 'function') {

    args.pop();
    this.plugins[idx++].apply(self, args.concat(next.bind(this)));

  } else {

    var results = args.shift();
    for (idx = 0; idx < total; idx++) {
      try {
        results = this.plugins[idx].apply(this, [results].concat(args));
      } catch (err) {
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