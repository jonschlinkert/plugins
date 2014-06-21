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
 * **Params:**
 *
 * @param {Function} `fn` Plugin function to add to the `plugins` stack.
 * @return {Plugins}  for chaining.
 * @api public
 */

Plugins.prototype.use = function (fn) {
  this.plugins.push(fn);
  return this;
};


/**
 * ## .run
 *
 * Call each function in the `plugins` stack to iterate over `arguments`.
 *
 * ```js
 * plugins.run( arguments[0], [arguments...] )
 * ```
 *
 * @param {Array|Object|String} `arguments` The value to iterate over.
 * @api public
 */

Plugins.prototype.run = function () {
  var args = [].slice.call(arguments);
  return this.plugins.reduce(function(value, fn) {
    return fn(value, args.slice(1));
  }, args[0]);
};



// Export `Plugins`
module.exports = Plugins;