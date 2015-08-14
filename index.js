/*!
 * plugins <https://github.com/jonschlinkert/plugins>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var es = require('event-stream');
var bold = require('ansi-bold');


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
  this.fns = [];
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
 * @param {Function} `fn` Plugin function to add to the `plugins` stack.
 * @return {Object} `Plugins` to enable chaining.
 * @api public
 */

Plugins.prototype.use = function (fn) {
  this.fns.push(fn);
  return this;
};

/**
 * Call each function in the `plugins` stack to iterate over `value`.
 *
 * ```js
 * plugins.run(value)
 * ```
 *
 * @param {Array|Object|String} `value` The value to iterate over.
 * @api public
 */

Plugins.prototype.run = function (value) {
  var args = [].slice.call(arguments);
  var len = args.length;
  var cb = args[len - 1];

  var stack = this.fns;

  if (Array.isArray(args[1])) {
    stack = args[1];
    args.splice(1, 1);
  }

  var self = this;
  var i = 0, total = stack.length;

  function next(err, results) {
    if (err) return cb(err);
    args[0] = results;

    if(i < total) {
      stack[i++].apply(self, args.concat(next.bind(self)));
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
        throw err;
      }
    }
    return results;
  }
};

/**
 * Add each plugin to a pipeline to be used with streams.
 * Plugins must either be a stream or a function that returns a stream.
 *
 * ```js
 * var pipeline = plugins.pipeline(value)
 * ```
 *
 * @param {Array|Object|String} `value` The value to iterate over.
 * @api public
 */

Plugins.prototype.pipeline = function(value) {
  var args = [].slice.call(arguments);
  var len = args.length;

  var stack = this.fns;

  if (Array.isArray(args[0])) {
    stack = args[0];
    args.splice(0, 1);
  }

  var pipeline = [];
  var i = 0;
  var len = stack.length;
  for (i = 0; i < len; i++) {

    // when the plugin is a stream, add it to the pipeline
    if (isStream(stack[i])) {
      pipeline.push(stack[i]);
    } else {
      // otherwise, call the function and pass in the args
      // expect a stream to be returned to push onto the pipeline
      try {
        pipeline.push(stack[i].apply(this, args));
      } catch (err) {
        throw err;
      }
    }
  }
  return es.pipe.apply(es, pipeline);
};


function isStream (obj) {
  return typeof obj === 'object' && obj.on && typeof obj.on === 'function';
}

function arrayify (val) {
  return Array.isArray(val) ? val : [val];
}


/**
 * Export `Plugins`
 *
 * @type {Object}
 */

module.exports = Plugins;