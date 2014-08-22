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

  if (this.plugins.length) {
    this.plugins.forEach(function (plugin) {
      try {
        if (typeof cb === 'function') {
          cb(plugin.apply(this, args));
        } else {
          return plugin.apply(this, args);
        }
      } catch (err) {
        throw new Error('plugin() exception', err);
      }
    }.bind(this));
  }
};


/**
 * Export `Plugins`
 *
 * @type {Object}
 */

module.exports = Plugins;