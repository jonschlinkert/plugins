/*!
 * plugins <https://github.com/jonschlinkert/plugins>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';


/**
 * Initialize `Plugins`
 *
 * ```js
 * var plugins = new Plugins();
 * ```
 * @constructor
 * @api public
 */

function Plugins() {
  this.plugins = [];
};


/**
 * ## .use
 *
 * Add a plugin `fn` to the plugins.
 *
 * ```js
 * plugins
 *   .use(foo({}))
 *   .use(bar({}))
 *   .use(baz({}))
 * ```
 *
 * @param {Function} `fn` Plugin function to add to the `plugins` stack.
 * @param {Options} `options` Options to pass to `fn`.
 * @return {this} for chaining.
 * @api public
 */

Plugins.prototype.use = function (fn) {
  this.plugins.push(fn.bind(this));
  return this;
};


/**
 * ## .run
 *
 * Run `str` against each function in the `plugins` stack.
 *
 * ```js
 * plugins.run(str, opts)
 * ```
 *
 * @param {String} `str` The string to transform.
 * @param {String} `opts` Options to pass to all plugins in the stack.
 * @return {String} transformed string.
 * @api public
 */

Plugins.prototype.run = function (str, opts) {
  return this.plugins.reduce(function(content, fn) {
    if (typeof fn(content) !== 'function') {
      return fn(content, opts);
    }
    return fn(opts)(content);
  }, str);
};



// Export `Plugins`
module.exports = Plugins;