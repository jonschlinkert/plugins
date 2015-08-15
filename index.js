/*!
 * plugins <https://github.com/jonschlinkert/plugins>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var es = require('event-stream');

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
 * Call each `fn` in the `plugins` stack
 * to iterate over `val`.
 *
 * ```js
 * plugins.run(value)
 * ```
 * @param {Array|Object|String} `val` The value to iterate over.
 * @api public
 */

Plugins.prototype.run = function (val) {
  var args = [].slice.call(arguments);
  var len = args.length;
  var fns = this.fns;
  var cb;

  if (typeof args[len - 1] === 'function') {
    cb = args.pop();
  }

  // if the second arg is an array,
  // assume it's a plugin array
  if (Array.isArray(args[1])) {
    fns = args[1].concat(fns);
    args.splice(1, 1);
  }

  var self = this;
  var i = 0, total = fns.length;

  function next(err, res) {
    if (err) return cb(err);
    args[0] = res;

    if(i < total) {
      fns[i++].apply(self, args.concat(next.bind(self)));
    } else {
      cb.apply(null, arguments);
    }
  }

  // async handling
  if (typeof cb === 'function') {
    fns[i++].apply(self, args.concat(next.bind(this)));
  } else {
    var res = args.shift(), j = -1;

    while (++j < total) {
      try {
        res = fns[j].apply(this, [res].concat(args));
      } catch (err) {
        throw err;
      }
    }
    return res;
  }
};

/**
 * Add each plugin to a pipeline to be used with streams.
 * Plugins must either be a stream or a function that returns a stream.
 *
 * ```js
 * var pipeline = plugins.pipeline(val);
 * ```
 * @param {Array|Object|String} `val` The value to iterate over.
 * @api public
 */

Plugins.prototype.pipeline = function(val) {
  var args = [].slice.call(arguments);
  var len = args.length;

  var fns = this.fns;

  if (Array.isArray(args[0])) {
    fns = args[0];
    args.splice(0, 1);
  }

  var len = fns.length, i = -1;
  var pipeline = [];

  while (++i < len) {
    var fn = fns[i];

    // when the plugin is a stream, add it to the pipeline
    if (isStream(fn)) {
      pipeline.push(fn);
      continue;
    }

    // otherwise, call the function and pass in the args
    // expect a stream to be returned to push onto the pipeline
    try {
      pipeline.push(fn.apply(this, args));
    } catch (err) {
      throw err;
    }
  }
  return es.pipe.apply(es, pipeline);
};

function isStream (obj) {
  return typeof obj === 'object' && obj.on && typeof obj.on === 'function';
}

/**
 * Expose `Plugins`
 */

module.exports = Plugins;