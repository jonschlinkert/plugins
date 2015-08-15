var reduce = require('async-array-reduce');
var es = require('event-stream');

/**
 * Expose `iterators`
 */

var iterators = module.exports;

/**
 * Async iterator
 */

iterators.async = function asyncIterator(val) {
  var args = [].slice.call(arguments);
  var fns = this.fns;
  var cb = args.pop();

  // if the second arg is an array,
  // assume it's a plugin array
  if (Array.isArray(args[1])) {
    fns = fns.concat(args.pop());
  }

  var isArray = Array.isArray(args[0]);
  var self = this, i = 0;

  return reduce(fns, args, function (acc, fn, next) {
    acc = arrayify(acc);
    if (isArray && i > 0) acc = [acc];
    i++;
    fn.apply(self, acc.concat(next));
  }.bind(this), cb);
};

/**
 * Sync iterator
 */

iterators.sync = function syncIterator() {
  var args = [].slice.call(arguments);
  var fns = this.fns;

  if (Array.isArray(args[1])) {
    fns = fns.concat(args.pop());
  }

  return fns.reduce(function (acc, fn) {
    return fn.apply(this, arrayify(acc));
  }, args);
};

/**
 * Stream iterator
 * TODO: this needs to be updated to work like an iterator.
 * currently it works like a plugin itself.
 */

iterators.stream = function streamIterator() {
  var args = [].slice.call(arguments);
  var fns = this.fns;

  if (Array.isArray(args[0])) {
    fns = fns.concat(args.unshift());
  }

  var len = fns.length, i = -1;
  var pipeline = [];

  while (++i < len) {
    var fn = fns[i];
    // if stream, push into pipeline
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

/**
 * Utilities
 */

function isStream(obj) {
  return typeof obj === 'object' && obj.pipe && isFunction(obj.pipe);
}

function isFunction(val) {
  return typeof val === 'function';
}

function arrayify(val) {
  return Array.isArray(val) ? val : [val];
}
