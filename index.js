/*!
 * plugins <https://github.com/jonschlinkert/plugins>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var iterators = require('./iterators');

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

function Plugins(options) {
  if (!(this instanceof Plugins)) {
    return new Plugins(options);
  }
  this.iterators = {};
  this.fns = [];
  this.init();
}

/**
 * Register default iterators
 */

Plugins.prototype.init = function() {
  this.iterator('async', iterators.async.bind(this));
  this.iterator('stream', iterators.stream.bind(this));
  this.iterator('sync', iterators.sync.bind(this));
};

/**
 * Add a plugin `fn` to the `plugins` stack.
 *
 * ```js
 * plugins
 *   .use(foo)
 *   .use(bar)
 *   .use(baz)
 * ```
 *
 * @param {Function} `fn` Plugin function to add to the `plugins` stack.
 * @return {Object} `Plugins` to enable chaining.
 * @api public
 */

Plugins.prototype.use = function (fn) {
  this.fns.push(fn);
  return this;
};

/**
 * Call each `fn` in the `plugins` stack
 * to iterate over `val`.
 *
 * ```js
 * plugins.run(value)
 * ```
 * @param {Array|Object|String} `val` The value to iterate over.
 * @api public
 */

Plugins.prototype.run = function () {
  var last = arguments[arguments.length - 1];
  var type = isFunction(last) ? 'async' : 'sync';
  return this.iterators[type].apply(this, arguments);
};

/**
 * Register an iterator `fn` by its `type`.
 *
 * @param {String} `type` The iterator type.
 * @param {Function} `fn` Iterator function
 * @api public
 */

Plugins.prototype.iterator = function(type, fn) {
  this.iterators[type] = fn;
  return this;
};

/**
 * Add each plugin to a pipeline to be used with streams.
 * Plugins must either be a stream or a function that returns a stream.
 *
 * ```js
 * var pipeline = plugins.pipeline(plugin());
 * ```
 * @param {Array|Object|String} `val` The value to iterate over.
 * @api public
 */

Plugins.prototype.pipeline = function() {
  return this.iterators.stream.apply(this, arguments);
};

/**
 * Utilities
 */

function isFunction(val) {
  return typeof val === 'function';
}

/**
 * Expose `Plugins`
 */

module.exports = Plugins;