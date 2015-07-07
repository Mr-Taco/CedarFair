(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(done) );
        });
        function done(err) {
          if (err) {
              callback(err);
              callback = function () {};
          }
          else {
              completed += 1;
              if (completed >= arr.length) {
                  callback();
              }
          }
        }
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        if (!callback) {
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err) {
                    callback(err);
                });
            });
        } else {
            var results = [];
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err, v) {
                    results[x.index] = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        var remainingTasks = keys.length
        if (!remainingTasks) {
            return callback();
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            remainingTasks--
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (!remainingTasks) {
                var theCallback = callback;
                // prevent final callback from calling itself if it errors
                callback = function () {};

                theCallback(null, results);
            }
        });

        _each(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;
        var wrappedTask = function(wrappedCallback, wrappedResults) {
            var retryAttempt = function(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            };
            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }
        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            started: false,
            paused: false,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            kill: function () {
              q.drain = null;
              q.tasks = [];
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                if (q.paused === true) { return; }
                q.paused = true;
                q.process();
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                q.process();
            }
        };
        return q;
    };
    
    async.priorityQueue = function (worker, concurrency) {
        
        function _compareTasks(a, b){
          return a.priority - b.priority;
        };
        
        function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
            var mid = beg + ((end - beg + 1) >>> 1);
            if (compare(item, sequence[mid]) >= 0) {
              beg = mid;
            } else {
              end = mid - 1;
            }
          }
          return beg;
        }
        
        function _insert(q, data, priority, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  priority: priority,
                  callback: typeof callback === 'function' ? callback : null
              };
              
              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }
        
        // Start with a normal queue
        var q = async.queue(worker, concurrency);
        
        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
          _insert(q, data, priority, callback);
        };
        
        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            drained: true,
            push: function (data, callback) {
                if (!_isArray(data)) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain && !cargo.drained) cargo.drain();
                    cargo.drained = true;
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0, tasks.length);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'))

},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
var AnimationBase, HeaderAnimation, ScrollBar, ViewBase, clouds,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ViewBase = require("./ViewBase.coffee");

ScrollBar = require("../util/ScrollBar.coffee");

HeaderAnimation = require('../plugins/HeaderAnimation.coffee');

clouds = require('../pages/animations/clouds.coffee');

AnimationBase = (function(superClass) {
  extend(AnimationBase, superClass);

  function AnimationBase(el) {
    this.updateTimeline = bind(this.updateTimeline, this);
    this.resetTimeline = bind(this.resetTimeline, this);
    this.onResize = bind(this.onResize, this);
    this.onDrag = bind(this.onDrag, this);
    this.onScroll = bind(this.onScroll, this);
    this.toggleTouchMove = bind(this.toggleTouchMove, this);
    AnimationBase.__super__.constructor.call(this, el);
    this.timeline = null;
    this.touchY = 0;
    this.touchYLast = 0;
    this.globalScrollAmount = this.isTablet ? .5 : 1;
    this.prevScrollTo = 0;
    this.prevDelta = 0;
    this.currentProgress = 0;
    this.totalAnimationTime = 10;
    this.smoothMultiplier = 5;
    this.navTimer = null;
    this.video = null;
    this.inlineVideo = null;
    this.isTablet = $('html').hasClass('tablet');
  }

  AnimationBase.prototype.initialize = function() {
    AnimationBase.__super__.initialize.call(this);
    if (!this.isPhone) {
      this.resetTimeline();
      this.toggleTouchMove();
      this.onResize();
      return this.updateTimeline();
    }
  };

  AnimationBase.prototype.initComponents = function() {
    return this.header = new HeaderAnimation({
      el: 'header'
    });
  };

  AnimationBase.prototype.toggleTouchMove = function() {
    $(document).off('scroll', this.onScroll);
    this.scroll = {
      position: 0,
      scrollTop: 0
    };
    $(document).scroll(this.onScroll);
    return this.onScroll();
  };

  AnimationBase.prototype.getScrollableArea = function() {
    return Math.abs($("#content").outerHeight() - this.stageHeight);
  };

  AnimationBase.prototype.getScrollTop = function() {
    return $(document).scrollTop() / this.getScrollableArea();
  };

  AnimationBase.prototype.setScrollTop = function(per) {
    var pos;
    pos = this.getScrollableArea() * per;
    return window.scrollTo(0, pos);
  };

  AnimationBase.prototype.setDraggablePosition = function(per) {
    var pos;
    pos = this.getScrollableArea() * per;
    return TweenMax.set($("#content"), {
      y: -pos
    });
  };

  AnimationBase.prototype.onScroll = function(e) {
    if ($(document).scrollTop() > 30) {
      $('.circ-btn-wrapper').addClass('invisible');
    }
    this.scroll.position = this.getScrollTop();
    this.scroll.scrollTop = $(document).scrollTop();
    return this.updateTimeline();
  };

  AnimationBase.prototype.onDrag = function(e) {
    this.scroll.position = Math.abs(this.scroll.y / this.getScrollableArea());
    this.scroll.scrollTop = -this.scroll.y;
    return this.updateTimeline();
  };

  AnimationBase.prototype.onResize = function() {
    var pos;
    AnimationBase.__super__.onResize.call(this);
    if (!this.isTablet) {
      this.resetTimeline();
    }
    this.centerOffset = this.stageHeight * .6667;
    if (this.scroll != null) {
      pos = this.scroll.position;
      this.toggleTouchMove();
      if (!this.isTablet) {
        return this.setScrollTop(pos);
      }
    }
  };

  AnimationBase.prototype.resetTimeline = function() {
    this.timeline = new TimelineMax;
    this.triggers = [];
    this.parallax = [];
    return $('[data-cloud]').each((function(_this) {
      return function(i, t) {
        var $closestContainer, $el, cloudFunction, initPos;
        $el = $(t);
        $closestContainer = $el.closest('[data-cloud-container]');
        initPos = $closestContainer.data().cloudContainer.initPos;
        cloudFunction = clouds({
          $el: $el
        });
        if (initPos) {
          cloudFunction(initPos);
        }
        return _this.parallax.push(cloudFunction);
      };
    })(this));
  };

  AnimationBase.prototype.updateTimeline = function() {
    var j, k, len, len1, p, ref, ref1, results, t;
    this.header.animateHeader(this.scroll.scrollTop);
    ref = this.triggers;
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      if (this.scroll.scrollTop > t.offset - this.centerOffset) {
        t.a.play();
      } else if (this.scroll.scrollTop + this.stageHeight < t.offset) {
        t.a.paused(true);
        t.a.seek(0);
      }
    }
    ref1 = this.parallax;
    results = [];
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      p = ref1[k];
      results.push(p(this.scroll.position));
    }
    return results;
  };

  return AnimationBase;

})(ViewBase);

module.exports = AnimationBase;



},{"../pages/animations/clouds.coffee":8,"../plugins/HeaderAnimation.coffee":14,"../util/ScrollBar.coffee":22,"./ViewBase.coffee":5}],4:[function(require,module,exports){
var PluginBase,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = (function(superClass) {
  extend(PluginBase, superClass);

  function PluginBase(opts) {
    PluginBase.__super__.constructor.call(this);
    this.$el = opts.el != null ? $(opts.el) : void 0;
    this.initialize(opts);
  }

  PluginBase.prototype.initialize = function(opts) {
    return this.addEvents();
  };

  PluginBase.prototype.addEvents = function() {};

  PluginBase.prototype.removeEvents = function() {};

  PluginBase.prototype.destroy = function() {
    return this.removeEvents();
  };

  return PluginBase;

})(EventEmitter);

module.exports = PluginBase;



},{}],5:[function(require,module,exports){
var Sharer, ViewBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Sharer = require("../util/Sharer.coffee");

ViewBase = (function(superClass) {
  extend(ViewBase, superClass);

  function ViewBase(el) {
    this.onResize = bind(this.onResize, this);
    this.$el = $(el);
    this.isTablet = $("html").hasClass("tablet");
    this.isPhone = $("html").hasClass("phone");
    this.cdnRoot = $('body').data('cdn') || "/";
    $(window).on("resize.app", this.onResize);
    this.stageHeight = window.innerHeight;
    this.stageWidth = $(window).width();
    this.mouseX = 0;
    this.mouseY = 0;
    this.initialize();
  }

  ViewBase.prototype.initialize = function() {
    return this.initComponents();
  };

  ViewBase.prototype.initComponents = function() {};

  ViewBase.prototype.onResize = function() {
    this.stageHeight = $(window).height();
    return this.stageWidth = $(window).width();
  };

  ViewBase.prototype.generateEvents = function() {
    return {};
  };

  return ViewBase;

})(EventEmitter);

module.exports = ViewBase;



},{"../util/Sharer.coffee":23}],6:[function(require,module,exports){
var BasicOverlay, SvgInject;

BasicOverlay = require('../plugins/BasicOverlay.coffee');

SvgInject = require('../plugins/SvgInject.coffee');

if (window.console === void 0 || window.console === null) {
  window.console = {
    log: function() {},
    warn: function() {},
    fatal: function() {}
  };
}

$(document).ready(function() {
  var basicOverlays;
  basicOverlays = new BasicOverlay({
    el: $('#content')
  });
  $('.scrollto').click(function() {
    var t;
    t = $(this).data('target');
    return $('body').animate({
      scrollTop: $('#' + t).offset().top - 70
    });
  });
  $(window).click(function() {
    if (window.ddls != null) {
      return $.each(window.ddls, function(i, t) {
        if (t.isOpen && !t.isHovered) {
          return t.closeMenu();
        }
      });
    }
  });
  $('[data-depth]').each(function() {
    var $el, depth;
    $el = $(this);
    depth = $el.data().depth;
    $el.css('z-index', depth);
    return TweenMax.set($el, {
      z: depth * 10
    });
  });
  $('body').on('DOMNodeInserted', function() {
    return $('a').each(function() {
      var href;
      href = $(this).attr('href');
      if (href != null) {
        href = href.trim();
        if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || href.indexOf('.pdf') === (href.length - 4)) {
          return $(this).attr('target', '_blank');
        }
      }
    });
  });
  $('.circle, .circle-outer').on('mouseenter', function() {
    return TweenMax.to($(this), .35, {
      scale: 1.05,
      ease: Power2.easeOut
    });
  });
  $('.circle, .circle-outer').on('mouseleave', function() {
    return TweenMax.to($(this), .35, {
      scale: 1,
      ease: Power2.easeOut
    });
  });
  return $('#jobs-gallery .swiper-container li').on('mouseeneter', function() {
    return console.log('hello');
  });
});

document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    return setTimeout(function() {
      return $('.quote').addClass('keepitahundred');
    }, 200);
  }
};



},{"../plugins/BasicOverlay.coffee":11,"../plugins/SvgInject.coffee":17}],7:[function(require,module,exports){
var AnimationBase, BasicOverlay, DraggableGallery, FadeGallery, FrameAnimation, HeaderAnimation, HomePage, ParksList, ResizeButtons, TickerList, animations, async, globalAnimations,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AnimationBase = require("../abstract/AnimationBase.coffee");

ParksList = require('../plugins/ParksList.coffee');

DraggableGallery = require('../plugins/DraggableGallery.coffee');

FadeGallery = require('../plugins/FadeGallery.coffee');

TickerList = require('../plugins/TickerList.coffee');

HeaderAnimation = require('../plugins/HeaderAnimation.coffee');

FrameAnimation = require('../plugins/coasters/FrameAnimation.coffee');

ResizeButtons = require('../plugins/ResizeButtons.coffee');

BasicOverlay = require('../plugins/BasicOverlay.coffee');

animations = require('./animations/home.coffee');

globalAnimations = require('./animations/global.coffee');

async = require('async');

HomePage = (function(superClass) {
  extend(HomePage, superClass);

  function HomePage(el) {
    this.resetTimeline = bind(this.resetTimeline, this);
    this.totalAnimationTime = 25;
    HomePage.__super__.constructor.call(this, el);
  }

  HomePage.prototype.initCoasters = function() {
    var c1, c2, c3, c4, cdnRoot, coasterTasks;
    cdnRoot = this.cdnRoot;
    if (!this.isPhone) {
      coasterTasks = [];
      if (!this.isTablet) {
        c1 = new FrameAnimation({
          id: "home-coaster-1-a",
          el: "#home-section1",
          baseUrl: cdnRoot + "coasters/",
          url: "shot-1/data.json",
          depth: 20
        });
        c2 = new FrameAnimation({
          id: "home-coaster-1-b",
          el: "#home-section1",
          baseUrl: cdnRoot + "coasters/",
          url: "shot-5/data.json",
          depth: 20
        });
        c3 = new FrameAnimation({
          id: "home-coaster-3-a",
          el: "#home-section3",
          baseUrl: cdnRoot + "coasters/",
          url: "shot-3/data.json"
        });
        c4 = new FrameAnimation({
          id: "home-coaster-3-b",
          el: "#home-section3",
          baseUrl: cdnRoot + "coasters/",
          url: "shot-4/data.json"
        });
        c1.async = function() {
          coasterTasks.push(function(done) {
            c2.async = done;
            return c2.loadFrames();
          });
          coasterTasks.push(function(done) {
            c3.async = done;
            return c3.loadFrames();
          });
          coasterTasks.push(function(done) {
            c4.async = done;
            return c4.loadFrames();
          });
          async.parallel(coasterTasks, function() {});
          return console.log('coasters loaded');
        };
        return c1.loadFrames();
      } else {
        c2 = new FrameAnimation({
          id: "home-coaster-1-b",
          el: "#home-section1",
          baseUrl: cdnRoot + "coasters/",
          url: "shot-5/data.json",
          depth: 20
        });
        c3 = new FrameAnimation({
          id: "home-coaster-3-a",
          el: "#home-section3",
          baseUrl: cdnRoot + "coasters/",
          url: "shot-3/data.json"
        });
        c2.async = function() {
          coasterTasks.push(function(done) {
            c3.async = done;
            return c3.loadFrames();
          });
          async.parallel(coasterTasks, function() {});
          return console.log('coasters loaded');
        };
        return c2.loadFrames();
      }
    }
  };

  HomePage.prototype.initComponents = function() {
    var accommodations, accommodationsGallery, groups, jobs, parks, parksGallery, resizebuttons, seasonalGallery, ticker;
    HomePage.__super__.initComponents.call(this);
    this.initCoasters();
    if (!this.isPhone) {
      seasonalGallery = new FadeGallery({
        el: "#seasonal-video-gallery"
      });
      groups = new DraggableGallery({
        el: "#group-sales #select-testimony",
        across: 1
      });
      accommodations = new DraggableGallery({
        el: "#accomodations-video-carousel",
        across: 1
      });
      accommodationsGallery = new FadeGallery({
        el: "#accommodations-carousel"
      });
      parksGallery = new FadeGallery({
        el: "#our-parks-gallery"
      });
      parks = new ParksList({
        el: "#our-parks",
        gallery: parksGallery
      });
      parksGallery.goto(parks.selectedLogo(), true);
      parksGallery.parkList = parks;
      parksGallery.$target = $('#our-parks');
      resizebuttons = new ResizeButtons;
    } else {
      parks = new DraggableGallery({
        el: "#our-parks",
        across: 1
      });
      jobs = new DraggableGallery({
        el: "#jobs-section",
        across: 1
      });
      groups = new DraggableGallery({
        el: "#group-sales #select-testimony",
        across: 1
      });
      accommodations = new DraggableGallery({
        el: "#accomodations-video-carousel",
        across: 1
      });
      seasonalGallery = new FadeGallery({
        el: "#seasonal-video-gallery"
      });
      accommodationsGallery = new FadeGallery({
        el: "#accommodations-carousel"
      });
    }
    return ticker = new TickerList({
      el: "#stock-ticker"
    });
  };

  HomePage.prototype.resetTimeline = function() {
    HomePage.__super__.resetTimeline.call(this);
    if (!this.isPhone) {
      this.triggers.push(animations.scrollCircle());
      this.triggers.push(animations.groups());
      this.triggers.push(animations.accomodations());
      this.triggers.push(animations.seasonal());
      if (!this.isTablet) {

        /* Removed these animations from ipad since they were choppy */
        this.triggers.push(animations.parks());
        return this.triggers.push(animations.jobs());
      }
    }
  };

  return HomePage;

})(AnimationBase);

module.exports = HomePage;



},{"../abstract/AnimationBase.coffee":3,"../plugins/BasicOverlay.coffee":11,"../plugins/DraggableGallery.coffee":12,"../plugins/FadeGallery.coffee":13,"../plugins/HeaderAnimation.coffee":14,"../plugins/ParksList.coffee":15,"../plugins/ResizeButtons.coffee":16,"../plugins/TickerList.coffee":18,"../plugins/coasters/FrameAnimation.coffee":20,"./animations/global.coffee":9,"./animations/home.coffee":10,"async":1}],8:[function(require,module,exports){
var cloudsOnUpdate, setBobing, setRegistration;

cloudsOnUpdate = function(el, duration) {
  var windowWidth;
  windowWidth = window.innerWidth;
  TweenMax.set(el, {
    x: -2050
  });
  return TweenMax.to(el, duration, {
    x: windowWidth,
    onComplete: (function(_this) {
      return function() {
        return cloudsOnUpdate(el, duration);
      };
    })(this)
  });
};

setBobing = function($el, dur, delay) {
  var d, width, windowWidth;
  this.isTablet = $('html').hasClass('tablet');
  width = window.innerWidth;
  windowWidth = window.innerWidth;
  if (window.innerWidth > 767 && !this.isTablet) {
    d = 300 - ($el.data('cloud').speed * 250);
    return TweenMax.to($el, dur, {
      x: width,
      delay: delay,
      ease: Linear.easeNone,
      onUpdateParams: ["{self}"],
      onComplete: (function(_this) {
        return function(tween) {
          return cloudsOnUpdate($el, d);
        };
      })(this)
    });
  }
};

setRegistration = function($el, registration) {
  var align, offset, settings, values, viewportWidth;
  values = registration.split("|");
  viewportWidth = window.innerWidth;
  settings = {};
  align = values[0];
  offset = parseInt(values[1]) || 0;
  switch (align) {
    case 'left':
      settings.x = 0 + offset;
      break;
    case 'right':
      settings.x = viewportWidth + offset;
      break;
    case 'center':
      settings.x = (viewportWidth * .5 - $el.width() * .5) + offset;
  }
  return TweenMax.set($el, settings);
};

module.exports = function(options) {
  var $container, $el, cloudData, cloudDepth, cloudOffsetMin, cloudRegistration, cloudReverse, cloudSpeed, containerTopPadding, distance, e, lastScrollPercentage, maxRangePercentage, maxY, minRangePercentage, minY, offLeft, percentage, percentageRange, presentScrollPercentage, scrollDelta, totalRange;
  $el = options.$el;
  $container = $el.closest('[data-cloud-container]');
  containerTopPadding = parseInt($container.css('padding-top'));
  try {
    cloudData = $el.data().cloud;
  } catch (_error) {
    e = _error;
    console.error("Cloud Data Parse Error: Invalid JSON");
  }
  cloudDepth = $el.data('depth');
  cloudSpeed = cloudData.speed || 1;
  cloudOffsetMin = parseInt(cloudData.offsetMin) || 0;
  cloudReverse = cloudData.reverse || false;
  cloudRegistration = cloudData.register || "center";
  setRegistration($el, cloudRegistration);
  if (!($container.hasClass('splash-container'))) {
    offLeft = $el.offset().left;
    distance = (window.innerWidth - offLeft) / window.innerWidth;
    percentage = 250 - (cloudSpeed * 200);
    setBobing($el, percentage, cloudSpeed / 5);
  }
  minY = $container.offset().top;
  maxY = $(document).outerHeight();
  totalRange = $container.outerHeight();
  percentageRange = totalRange / maxY;
  minRangePercentage = minY / maxY;
  maxRangePercentage = minRangePercentage + percentageRange;
  lastScrollPercentage = presentScrollPercentage = scrollDelta = 0;
  if ($container.hasClass('splash-container') && $('html').hasClass('tablet')) {
    $container.hide();
  }
  return function(pos) {
    var cloudPositionPercentage, cloudY;
    if (($container.hasClass('splash-container')) && ($('html').hasClass('tablet'))) {
      return TweenMax.to($el, 0.25, {
        ease: Sine.easeOut
      });
    } else {
      cloudPositionPercentage = (pos - minRangePercentage) / (maxRangePercentage - minRangePercentage);
      if ((0 <= cloudPositionPercentage && cloudPositionPercentage <= 1)) {
        presentScrollPercentage = cloudPositionPercentage;
        if (cloudReverse) {
          cloudPositionPercentage = 1 - cloudPositionPercentage;
        }
        cloudY = (totalRange * cloudPositionPercentage) * cloudSpeed;
        cloudY = cloudY - containerTopPadding;
        cloudY = cloudY + cloudOffsetMin;
        scrollDelta = Math.abs(lastScrollPercentage - presentScrollPercentage) * 3;
        lastScrollPercentage = presentScrollPercentage;
        return TweenMax.to($el, 0.25, {
          y: cloudY,
          ease: Sine.easeOut
        });
      }
    }
  };
};



},{}],9:[function(require,module,exports){
var commas, tweenParallax;

commas = function(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

module.exports.count = function(el) {
  var $el, change, num, start, targetVal, tl, tweens;
  $el = $(el);
  targetVal = $(el).html();
  num = $(el).text().split(',').join('');
  start = num * .9995;
  change = num * .0005;
  tl = new TimelineMax({
    onStart: function() {
      return $el.html("42");
    },
    onComplete: function() {
      return $el.html(targetVal);
    }
  });
  tweens = [];
  tweens.push(TweenMax.fromTo($el, 0.25, {
    autoAlpha: 0,
    immediateRender: true,
    ease: Quint.easeOut
  }, {
    autoAlpha: 1
  }));
  tweens.push(TweenMax.to($el, 1.5, {
    ease: Quint.easeOut,
    onUpdate: function() {
      var els, html, value;
      value = parseInt(start + parseInt(change * this.progress()));
      value = commas(value);
      els = value.split('');
      html = '';
      $.each(els, function(name, value) {
        return html += value === ',' ? ',' : '<span>' + value + '</span>';
      });
      return $el.html(html);
    }
  }));
  tl.add(tweens);
  return tl;
};

tweenParallax = function(pos, tween, min, max, dur) {
  var amount, percent;
  percent = ((pos - min) / (max - min)) * 1;
  amount = percent * dur;
  if (pos <= max && pos >= min) {
    if (Math.abs(amount - tween.time()) >= .001) {
      return tween.tweenTo(amount, {
        overwrite: "preexisting",
        ease: Quad.easeOut
      });
    }
  }
};

module.exports.clouds = function(setId, min, max, dur) {
  var $el, cloud, clouds, duration, i, j, len, maxPos, minPos, offset, tween, tweens;
  minPos = min;
  maxPos = max;
  duration = dur;
  $el = $(".clouds" + setId);
  clouds = $el.find(".cloud");
  tween = new TimelineMax;
  tween.ns = {};
  tween.ns.name = setId;
  tweens = [];
  for (i = j = 0, len = clouds.length; j < len; i = ++j) {
    cloud = clouds[i];
    offset = "+=" + (250 * (i + 1));
    tweens.push(TweenMax.to(cloud, duration, {
      y: offset
    }));
  }
  tween.add(tweens);
  tween.paused(true);
  return function(pos) {
    return tweenParallax(pos, tween, minPos, maxPos, duration);
  };
};

module.exports.scroll = function(minPos, maxPos, duration, elem) {
  var tween, tweens;
  tween = new TimelineMax;
  tween.ns = {};
  tween.ns.name = ".scrollto";
  tweens = [];
  tweens.push(TweenMax.to(elem, duration, {
    opacity: 0
  }));
  tween.add(tweens);
  tween.paused(true);
  return function(pos) {
    return tweenParallax(pos, tween, minPos, maxPos, duration);
  };
};

module.exports.arms = function(min, max, dur) {
  var arm, duration, maxPos, minPos, tween, tweens;
  minPos = min;
  maxPos = max;
  duration = dur;
  arm = $(".arms");
  tween = new TimelineMax;
  tween.ns = {};
  tween.ns.name = ".arms";
  tweens = [];
  tweens.push(TweenMax.to(arm, duration, {
    top: 0
  }));
  tween.add(tweens);
  tween.paused(true);
  return function(pos) {
    return tweenParallax(pos, tween, minPos, maxPos, duration);
  };
};



},{}],10:[function(require,module,exports){
var global;

global = require('./global.coffee');

module.exports.funToUsTween = function() {
  var $el, tween;
  $el = $("#who-we-are .title-bucket");
  tween = TweenMax.fromTo($el, .8, {
    rotationX: 180,
    autoAlpha: 0
  }, {
    rotationX: 0,
    autoAlpha: 1,
    ease: Back.easeOut
  });
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.scrollCircle = function() {
  var $el, tween;
  $el = $("#who-we-are .circ-btn-wrapper");
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el.find("p"), .3, {
    autoAlpha: 0
  }, {
    autoAlpha: 1
  }));
  tween.add(TweenMax.fromTo($el.find("a"), .45, {
    scale: 0,
    rotation: 180,
    immediateRender: true
  }, {
    scale: 1,
    rotation: 0,
    ease: Back.easeOut
  }), "-=.2");
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.parks = function() {
  var $el, tween;
  $el = $("#our-parks");
  tween = new TimelineMax;
  tween.add(TweenMax.staggerFromTo($el.find('.title-bucket h1 , .title-bucket h2'), .5, {
    autoAlpha: 0
  }, {
    autoAlpha: 1
  }, .2));
  tween.add(TweenMax.staggerFromTo($el.find('#our-parks-logos li'), .35, {
    autoAlpha: 0,
    scale: 0
  }, {
    autoAlpha: 1,
    scale: 1
  }, .05), "-=.4");
  tween.add(TweenMax.fromTo($el.find("#our-parks-gallery ul"), .75, {
    rotationY: 180,
    autoAlpha: 0
  }, {
    rotationY: 0,
    autoAlpha: 1,
    ease: Back.easeOut
  }), "-=.3");
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.jobs = function() {
  var $el, tween;
  $el = $("#jobs-section");
  tween = new TimelineMax;
  tween.add(TweenMax.staggerFromTo($el.find('.title-bucket h1 , .title-bucket h2'), .5, {
    autoAlpha: 0
  }, {
    autoAlpha: 1
  }, .2));
  tween.add(TweenMax.staggerFromTo($el.find('.swiper-container li'), .5, {
    autoAlpha: 0,
    scale: 0,
    rotation: 180
  }, {
    autoAlpha: 1,
    scale: 1,
    rotation: 0,
    ease: Back.easeOut
  }, .05), "-=.4");
  tween.add(TweenMax.staggerFromTo($el.find(".btn-wrapper a"), .75, {
    autoAlpha: 0
  }, {
    autoAlpha: 1
  }, .2), "-=.3");
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.groups = function() {
  var $el, tween;
  $el = $("#group-sales");
  tween = new TimelineMax;
  tween.add(TweenMax.staggerFromTo($el.find('.title-bucket h1 , .title-bucket h2'), .5, {
    autoAlpha: 0
  }, {
    autoAlpha: 1
  }, .2));
  tween.add(TweenMax.staggerFromTo($el.find('.draggable-container li'), .35, {
    autoAlpha: 0,
    scale: 0,
    rotation: 180
  }, {
    autoAlpha: 1,
    scale: 1,
    rotation: 0,
    ease: Back.easeOut
  }, .05), "-=.4");
  tween.add(TweenMax.staggerFromTo($el.find(".btn-wrapper a"), .75, {
    autoAlpha: 0
  }, {
    autoAlpha: 1
  }, .2), "-=.3");
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.accomodations = function() {
  var $el, tween;
  $el = $("#accommodations");
  tween = new TimelineMax;
  tween.add(global.count($el.find('.title-bucket h1')));
  tween.add(TweenMax.fromTo($el.find('.title-bucket h2 , .title-bucket h3'), .5, {
    autoAlpha: 0
  }, {
    autoAlpha: 1
  }, .2), "-=1.2");
  tween.add(TweenMax.staggerFromTo($el.find(".btn-wrapper a"), .75, {
    autoAlpha: 0
  }, {
    autoAlpha: 1
  }, .2), "-=.3");
  tween.add(TweenMax.fromTo($el.find("#accommodations-carousel"), .75, {
    rotationY: 180,
    alpha: 0,
    scale: 0.5
  }, {
    rotationY: 0,
    alpha: 1,
    scale: 1,
    ease: Back.easeOut
  }, .2), 0.5);
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.seasonal = function() {
  var $el, blood, bloods, className, i, j, k, len, len1, letter, letters, particlesAdded, rotation, totalParticles, tween;
  $el = $("#seasonal");
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el.find(".overlay"), .85, {
    scale: 0.85
  }, {
    scale: 1
  }));
  tween.add(TweenMax.fromTo($el.find(".halloween-text"), .2, {
    scale: 2,
    z: 500,
    alpha: 0
  }, {
    scale: 1,
    z: 1,
    alpha: 1
  }), 0);
  letters = [];
  letters[0] = $el.find('.haunt-text div').get(0);
  letters[1] = $el.find('.haunt-text div').get(3);
  letters[2] = $el.find('.haunt-text div').get(2);
  letters[3] = $el.find('.haunt-text div').get(4);
  letters[4] = $el.find('.haunt-text div').get(1);
  for (i = j = 0, len = letters.length; j < len; i = ++j) {
    letter = letters[i];
    rotation = 0;
    if (i % 2 === 0) {
      rotation = 30;
    } else {
      rotation = -30;
    }
    tween.add(TweenMax.fromTo($(letter), .35, {
      opacity: 0,
      ease: Power0.easeNone,
      y: -15
    }, {
      opacity: 1,
      y: 0
    }), 1.15 + i * 0);
  }
  tween.add(TweenMax.fromTo($el.find(".fiftyfive"), .35, {
    alpha: 0,
    y: -15
  }, {
    alpha: 1,
    y: 0
  }), 1.5);
  tween.add(TweenMax.fromTo($el.find(".sightofblood"), .35, {
    alpha: 0,
    y: -15
  }, {
    alpha: 1,
    y: 0
  }), 1.85);
  tween.add(TweenMax.fromTo($el.find(".waitforhaunt"), .35, {
    alpha: 0,
    y: -15
  }, {
    alpha: 1,
    y: 0
  }), 2.2);

  /*=============== ARMS ============== */

  /*=============== ARMS ============== */

  /*=============== ARMS ============== */
  totalParticles = 34;
  particlesAdded = 0;
  while (particlesAdded < totalParticles) {
    className = 'HAUNT_PARTICLES-01_' + particlesAdded.toString();
    if (particlesAdded < (totalParticles - 1)) {
      tween.add(TweenMax.set($el.find(".particle-sprite"), {
        css: {
          className: '+=' + className
        },
        delay: .003 * particlesAdded
      }), 2.5 + (.05 * particlesAdded));
      particlesAdded++;
    } else {
      tween.add(TweenMax.set($el.find(".particle-sprite"), {
        css: {
          className: '+=' + className
        },
        delay: .003 * particlesAdded,
        onComplete: (function(_this) {
          return function() {
            $el.find(".particle-sprite.left").removeClass().addClass('particle-sprite').addClass('left');
            return $el.find(".particle-sprite.right").removeClass().addClass('particle-sprite').addClass('right');
          };
        })(this)
      }), 2.5 + (.05 * particlesAdded));
      particlesAdded++;
    }
  }
  tween.add(TweenMax.set($el.find(".arms.left"), {
    y: 1000
  }), 0);
  tween.add(TweenMax.to($el.find(".arms.left"), .15, {
    y: 550,
    x: -15,
    ease: Power1.easeIn
  }), 2.5);
  tween.add(TweenMax.to($el.find(".arms.left"), .4, {
    y: 350,
    rotation: 10,
    x: 15,
    ease: Power1.easeIn
  }), 2.65);
  tween.add(TweenMax.to($el.find(".arms.left"), .4, {
    y: 0,
    rotation: 0,
    x: 0,
    ease: Power1.easeIn
  }), 3.05);
  tween.add(TweenMax.set($el.find(".arms.right"), {
    y: 1000
  }), 0);
  tween.add(TweenMax.to($el.find(".arms.right"), .15, {
    y: 550,
    rotation: -10,
    x: 15,
    ease: Power0.easeNone
  }), 2.65);
  tween.add(TweenMax.to($el.find(".arms.right"), .4, {
    y: 350,
    x: -15,
    ease: Power0.easeNone
  }), 2.8);
  tween.add(TweenMax.to($el.find(".arms.right"), .4, {
    y: 0,
    rotation: 0,
    x: 0,
    ease: Power1.easeIn
  }), 3.2);
  bloods = [];
  bloods[0] = $el.find('.haunt-text img.blood').get(0);
  bloods[1] = $el.find('.haunt-text img.blood').get(3);
  bloods[2] = $el.find('.haunt-text img.blood').get(2);
  bloods[3] = $el.find('.haunt-text img.blood').get(4);
  bloods[4] = $el.find('.haunt-text img.blood').get(1);
  for (i = k = 0, len1 = bloods.length; k < len1; i = ++k) {
    blood = bloods[i];
    tween.add(TweenMax.fromTo($(blood), .15, {
      alpha: 0,
      y: 0,
      scale: 1
    }, {
      alpha: 1,
      y: 0,
      scale: 1
    }), 0.85 + i * .215);
  }
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};



},{"./global.coffee":9}],11:[function(require,module,exports){
var BasicOverlay, PluginBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

BasicOverlay = (function(superClass) {
  extend(BasicOverlay, superClass);

  function BasicOverlay(opts) {
    this.openLink = bind(this.openLink, this);
    BasicOverlay.__super__.constructor.call(this, opts);
  }

  BasicOverlay.prototype.initialize = function() {
    this.overlayTriggers = $('.overlay-trigger');
    this.addEvents();
    return BasicOverlay.__super__.initialize.call(this);
  };

  BasicOverlay.prototype.addEvents = function() {
    $('#basic-overlay, #overlay-basic-inner .overlay-close').click(this.closeOverlay);
    this.overlayTriggers.each((function(_this) {
      return function(i, t) {
        return $(t).on('click', _this.openOverlay);
      };
    })(this));
    return $('.overlay-content').on('click', 'li', this.openLink);
  };

  BasicOverlay.prototype.openLink = function(e) {
    var target;
    target = $(e.target).parents('.park');
    if (target.data('target')) {
      window.open(target.data('target'));
      return e.preventDefault();
    }
  };

  BasicOverlay.prototype.closeOverlay = function(e) {
    if (!((e.type === 'resize') && ($('#overlay video:visible').size() > 0))) {
      return $('.overlay-basic').animate({
        opacity: 0
      }, function() {
        $('.overlay-basic').hide();
        return $('#overlay').hide();
      });
    }
  };

  BasicOverlay.prototype.openOverlay = function(t) {
    var $el, $targetElement, addtop, c, isNews, isSmall, oc, overlaySource, position, scrollTop, top;
    $el = $(this);
    overlaySource = $el.data('source');
    $targetElement = $('#overlay-basic-inner .overlay-content');
    isNews = $el.hasClass('news');
    $('#overlay').show();
    if ($el.hasClass('offerings-option')) {
      oc = $('#offerings-overlay-content');
      oc.find('h1.title').text($el.find('span.offer').text());
      oc.find('div.description').html($el.find('div.description').html());
      oc.find('.content.media').css({
        backgroundImage: "url('" + $el.find('span.media').data('source') + "')"
      });
    }
    if ($('#' + overlaySource).size() === 1) {
      $targetElement.children().each((function(_this) {
        return function(i, t) {
          return $(t).appendTo('#overlay-content-sources');
        };
      })(this));
      if (isNews) {
        c = $el.next('.article').clone();
        $('#overlay_content').html(c.html());
      }
      $('#' + overlaySource).appendTo($targetElement);
      $el = $('#overlay-basic-inner');
      isSmall = $el.height() < $(window).height() && $($targetElement).find('.select-box-wrapper').size() === 0;
      scrollTop = $(window).scrollTop();
      addtop = isSmall ? 0 : scrollTop;
      position = $el.css('position', isSmall ? 'fixed' : 'absolute');
      top = Math.max(0, (($(window).height() - $el.outerHeight()) / 2) + addtop);
      if (!isSmall && (top < scrollTop)) {
        top = scrollTop;
      }
      $el.css("top", top + "px");
      return $('.overlay-basic').css('opacity', 0).delay(0).show().animate({
        opacity: 1
      });
    }
  };

  return BasicOverlay;

})(PluginBase);

module.exports = BasicOverlay;



},{"../abstract/PluginBase.coffee":4}],12:[function(require,module,exports){
var DraggableGallery, PluginBase, ViewBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

ViewBase = require('../abstract/ViewBase.coffee');

DraggableGallery = (function(superClass) {
  extend(DraggableGallery, superClass);

  function DraggableGallery(opts) {
    this.addPagination = bind(this.addPagination, this);
    this.onSlideChangeEnd = bind(this.onSlideChangeEnd, this);
    this.onSlideChangeStart = bind(this.onSlideChangeStart, this);
    this.sizeContainer = bind(this.sizeContainer, this);
    this.nextSlide = bind(this.nextSlide, this);
    this.prevSlide = bind(this.prevSlide, this);
    this.resumeJobsCarousel = bind(this.resumeJobsCarousel, this);
    this.pauseJobsCarousel = bind(this.pauseJobsCarousel, this);
    this.stopJobsCarousel = bind(this.stopJobsCarousel, this);
    DraggableGallery.__super__.constructor.call(this, opts);
  }

  DraggableGallery.prototype.initialize = function(opts) {
    this.gallery = this.$el.find(".swiper-container");
    if (this.gallery.length < 1) {
      this.gallery = this.$el.filter(".swiper-container");
    }
    if (opts.page === 'jobs') {
      this.jobsPage = true;
    } else {
      this.jobsPage = false;
    }
    this.galleryCreated = false;
    this.galleryContainer = this.gallery.find('ul');
    this.galleryItems = this.galleryContainer.find('li');
    this.currentIndex = this.galleryItems.filter('.selected').data('index');
    this.across = opts.across || 1;
    this.angleLeft = this.gallery.find('.fa-angle-left');
    this.angleRight = this.gallery.find('.fa-angle-right');
    this.pagination = opts.pagination || false;
    this.controls = opts.control || null;
    this.jobsCarouselStopped = false;
    this.jobsCarouselPaused = false;
    this.jobsInterval = null;
    this.sizeContainer();
    this.addArrows();
    return DraggableGallery.__super__.initialize.call(this);
  };

  DraggableGallery.prototype.addEvents = function() {
    $(window).on('resize', this.sizeContainer);
    $(this.$el).on('click', '.fa-angle-left', this.prevSlide);
    $(this.$el).on('click', '.fa-angle-right', this.nextSlide);
    if (this.jobsPage === true) {
      $(this.$el).on('click', '.swiper-container', this.stopJobsCarousel);
      $(this.$el).on('mouseover', '.swiper-container', this.pauseJobsCarousel);
      return $(this.$el).on('mouseleave', '.swiper-container', this.resumeJobsCarousel);
    }
  };

  DraggableGallery.prototype.stopJobsCarousel = function() {
    window.clearInterval(this.jobsInterval);
    return this.jobsCarouselStopped = true;
  };

  DraggableGallery.prototype.pauseJobsCarousel = function() {
    window.clearInterval(this.jobsInterval);
    return this.jobsCarouselPaused = true;
  };

  DraggableGallery.prototype.resumeJobsCarousel = function() {
    if (this.jobsCarouselStopped === false) {
      this.jobsInterval = setInterval((function() {
        return $('#jobs-gallery .fa-angle-right').trigger('click');
      }), 8000);
      return this.jobsCarouselPaused = false;
    }
  };

  DraggableGallery.prototype.prevSlide = function(e) {
    var gal, that;
    that = this.mySwiper;
    gal = this.gallery;
    return TweenMax.to($(gal), .2, {
      opacity: 0,
      scale: 1.1,
      onComplete: (function(_this) {
        return function() {
          that.swipePrev();
          TweenMax.set($(gal), {
            scale: 1
          });
          return TweenMax.to($(gal), .35, {
            opacity: 1,
            delay: .35
          });
        };
      })(this)
    });
  };

  DraggableGallery.prototype.nextSlide = function(e) {
    var gal, that;
    that = this.mySwiper;
    gal = this.gallery;
    return TweenMax.to($(gal), .2, {
      opacity: 0,
      scale: 1.1,
      onComplete: (function(_this) {
        return function() {
          that.swipeNext();
          TweenMax.set($(gal), {
            scale: 0.85
          });
          return TweenMax.to($(gal), .35, {
            opacity: 1,
            scale: 1,
            delay: .35
          });
        };
      })(this)
    });
  };

  DraggableGallery.prototype.addArrows = function() {
    var arrowLeft, arrowRight;
    this.isPhone = $("html").hasClass("phone");
    arrowLeft = $("<i class='gal-arrow fa fa-angle-left'></i>");
    arrowRight = $("<i class='gal-arrow fa fa-angle-right'></i>");
    this.$el.append(arrowLeft, arrowRight);
    return $('.gal-arrow').on('click', function() {
      var that;
      $(this).addClass('active');
      that = $(this);
      return setTimeout(function() {
        return $(that).removeClass('active', 100);
      });
    });
  };

  DraggableGallery.prototype.sizeContainer = function() {
    var itemLength;
    this.galleryContainer.css('width', "100%");
    if (this.across < 2) {
      this.galleryItems.css('width', "100%");
    } else if (this.across < 3) {
      this.galleryItems.css('width', "50%");
    } else {
      this.galleryItems.css('width', "33.333333%");
    }
    this.itemWidth = this.galleryItems.first().outerWidth();
    itemLength = this.galleryItems.length;
    this.galleryItems.css('width', this.itemWidth);
    this.galleryContainer.css('width', itemLength * this.itemWidth);
    TweenMax.set(this.galleryContainer, {
      x: -this.currentIndex * this.itemWidth
    });
    if (!this.galleryCreated) {
      return this.createDraggable();
    }
  };

  DraggableGallery.prototype.createDraggable = function() {
    var id, itemLength;
    itemLength = this.galleryItems.length;
    if (this.scroll) {
      this.scroll.kill();
    }
    id = $(this.$el).attr('id');
    if (this.pagination) {
      this.addPagination();
    }
    if (this.across < 3) {
      if (this.pagination) {
        this.mySwiper = new Swiper('#' + id + ' .swiper-container', {
          loop: true,
          grabCursor: true,
          slidesPerView: this.across,
          pagination: '#' + id + ' .swiper-pagination',
          paginationAsRange: true,
          onTouchStart: this.onSlideChangeStart,
          onTouchEnd: this.onSlideChangeEnd,
          onSlideChangeStart: this.onSlideChangeStart,
          onSlideChangeEnd: this.onSlideChangeEnd,
          slidesPerGroup: this.across
        });
      } else {
        this.mySwiper = new Swiper('#' + id + ' .swiper-container', {
          loop: true,
          grabCursor: true,
          slidesPerView: this.across,
          slidesPerGroup: this.across,
          onTouchStart: this.onSlideChangeStart,
          onTouchEnd: this.onSlideChangeEnd,
          onSlideChangeStart: this.onSlideChangeStart,
          onSlideChangeEnd: this.onSlideChangeEnd
        });
      }
    } else {
      this.mySwiper = new Swiper('#' + id + ' .swiper-container', {
        loop: true,
        grabCursor: true,
        slidesPerView: 3,
        slidesPerGroup: 3,
        onTouchStart: this.onSlideChangeStart,
        onTouchEnd: this.onSlideChangeEnd,
        onSlideChangeStart: this.onSlideChangeStart,
        onSlideChangeEnd: this.onSlideChangeEnd
      });
    }
    this.galleryCreated = true;
    if (this.jobsPage === true) {
      return this.jobsInterval = setInterval((function() {
        return $('#jobs-gallery .fa-angle-right').trigger('click');
      }), 8000);
    }
  };

  DraggableGallery.prototype.onSlideChangeStart = function() {
    $(this.$el).closest('.add-border-fade').addClass('showing');
    return $(this.$el).find('.add-border-fade').addClass('showing');
  };

  DraggableGallery.prototype.onSlideChangeEnd = function() {
    var park;
    $(this.$el).closest('.add-border-fade').removeClass('showing');
    $(this.$el).find('.add-border-fade').removeClass('showing');
    if (!(this.controls === null)) {
      park = this.mySwiper.activeSlide().data('id');
      $('#accommodations-gallery .swiper-container').removeClass('active');
      $('#accommodations-gallery .carousel-wrapper').removeClass('active');
      $('#accommodations-gallery div#' + park).addClass('active');
      $('#accommodations-gallery div#' + park).parent().addClass('active');
    }
    if (this.parkList) {
      return this.parkList.selectLogo($(this.$el).find('.swiper-slide-active').data('id'));
    }
  };

  DraggableGallery.prototype.addPagination = function() {
    var wrapper;
    wrapper = $("<div class='swiper-pagination'></div>");
    return $(this.$el).find('.swiper-container').addClass('addPagination').append(wrapper);
  };

  DraggableGallery.prototype.goto = function(id, initVal) {
    var tl, toIndex;
    if (!initVal) {
      $('body').animate({
        scrollTop: $('#' + ($(this.$el).attr('id'))).offset().top
      });
    }
    toIndex = $("li.park[data-id='" + id + "']").data('index');
    tl = new TimelineMax;
    tl.add(TweenMax.to(this.galleryContainer, .4, {
      autoAlpha: 0
    }));
    tl.addCallback((function(_this) {
      return function() {
        return _this.mySwiper.swipeTo(toIndex, 0);
      };
    })(this));
    tl.add(TweenMax.to(this.galleryContainer, .4, {
      autoAlpha: 1
    }));
    return this.currentIndex = toIndex;
  };

  return DraggableGallery;

})(PluginBase);

module.exports = DraggableGallery;



},{"../abstract/PluginBase.coffee":4,"../abstract/ViewBase.coffee":5}],13:[function(require,module,exports){
var FadeGallery, PluginBase, VideoOverlay,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

VideoOverlay = require('./VideoOverlay.coffee');

FadeGallery = (function(superClass) {
  extend(FadeGallery, superClass);

  function FadeGallery(opts) {
    this.handleVideoInteraction = bind(this.handleVideoInteraction, this);
    FadeGallery.__super__.constructor.call(this, opts);
  }

  FadeGallery.prototype.initialize = function(opts) {
    var target;
    console.log('initialize: ', opts);
    this.page = opts.page || null;
    target = opts.target || null;
    if ((target != null)) {
      this.$target = $(target);
    }
    if (!(this.page === null)) {
      this.infoBoxes = this.$el.find("li.video");
    } else {
      this.infoBoxes = this.$el.find("li");
    }
    this.currentSelected = this.infoBoxes.filter(":first-child");
    return FadeGallery.__super__.initialize.call(this);
  };

  FadeGallery.prototype.addEvents = function() {
    return this.infoBoxes.each((function(_this) {
      return function(i, t) {
        var $btn, videoEvents;
        $btn = $(t).find('.video-button');
        if ($btn.length > 0) {
          videoEvents = new Hammer($btn[0]);
          return videoEvents.on('tap', _this.handleVideoInteraction);
        }
      };
    })(this));
  };

  FadeGallery.prototype.handleVideoInteraction = function(e) {
    var $target, data;
    $target = $(e.target).closest(".video-button");
    if ($target.size() === 0) {
      $target = e.target;
    }
    if ($target.data('type') === 'image') {
      if ($target.data('full')) {
        this.imageSrc = $target.data('full');
      } else {
        this.imageSrc = $target.children('img').attr('src');
      }
    }
    data = {
      mp4: $target.data('mp4'),
      webm: $target.data('webm'),
      poster: this.imageSrc
    };
    return VideoOverlay.initVideoOverlay(data);
  };

  FadeGallery.prototype.goto = function(id, initVal) {
    var infoId, pos, target, tl, top;
    infoId = "#" + id + "-info";
    if (!(this.page === null)) {
      target = this.infoBoxes.parents('li.group-info');
    } else {
      target = this.infoBoxes;
    }
    tl = new TimelineMax;
    tl.add(TweenMax.to(target, .4, {
      autoAlpha: 0,
      overwrite: "all"
    }));
    tl.add(TweenMax.to(target.filter(infoId), .4, {
      autoAlpha: 1
    }));
    if ((this.$target != null)) {
      console.log(this.$target);
      top = this.$target.offset().top - ($('header').height());
      console.log(top);
      pos = $('body').scrollTop();
      if (pos < top) {
        return $('body').animate({
          scrollTop: top
        });
      }
    }
  };

  return FadeGallery;

})(PluginBase);

module.exports = FadeGallery;



},{"../abstract/PluginBase.coffee":4,"./VideoOverlay.coffee":19}],14:[function(require,module,exports){
var HeaderAnimation, PluginBase, globals,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

globals = require('../global/index.coffee');

PluginBase = require('../abstract/PluginBase.coffee');

HeaderAnimation = (function(superClass) {
  extend(HeaderAnimation, superClass);

  function HeaderAnimation(opts) {
    this.onClickMobileSubNavLink = bind(this.onClickMobileSubNavLink, this);
    this.handleArrowClick = bind(this.handleArrowClick, this);
    this.hideMobileSubNav = bind(this.hideMobileSubNav, this);
    this.showMobileSubNav = bind(this.showMobileSubNav, this);
    this.adjustMobileNav = bind(this.adjustMobileNav, this);
    this.toggleNav = bind(this.toggleNav, this);
    this.handleSubNav = bind(this.handleSubNav, this);
    this.hideSubNavLinks = bind(this.hideSubNavLinks, this);
    this.showSubNavLinks = bind(this.showSubNavLinks, this);
    this.hideSubNav = bind(this.hideSubNav, this);
    this.showSubNav = bind(this.showSubNav, this);
    this.handleNavHover = bind(this.handleNavHover, this);
    this.animateHeader = bind(this.animateHeader, this);
    this.positionSubNavLists = bind(this.positionSubNavLists, this);
    this.handleResize = bind(this.handleResize, this);
    this.toggleNav = bind(this.toggleNav, this);
    this.showInitialSubNav = bind(this.showInitialSubNav, this);
    this.handleSubNav = bind(this.handleSubNav, this);
    this.body = $("body");
    this.html = $("html");
    this.content = $("#content");
    this.mobnav = $("#mobile-header-nav");
    this.subnav = $(".subnav");
    this.subnavShowing = false;
    this.ourParksLeft = $('.nav-list a[data-page="our-parks"]').offset().left;
    this.partnershipLeft = $('.nav-list a[data-page="partnerships"]').offset().left;
    HeaderAnimation.__super__.constructor.call(this, opts);
  }

  HeaderAnimation.prototype.initialize = function() {
    HeaderAnimation.__super__.initialize.call(this);
    return this.showInitialSubNav();
  };

  HeaderAnimation.prototype.addEvents = function() {
    if (!$('html').hasClass('tablet')) {
      $('.nav-list a li').on('mouseenter', this.handleNavHover);
      $('header').on('mouseleave', this.hideSubNav);
    }
    window.onresize = this.handleResize;
    this.body.find("#navbar-menu").on('click', this.toggleNav);
    $('#mobile-header-nav a').on('click', this.showMobileSubNav);
    $('#mobile-header-nav i').on('click', this.handleArrowClick);
    this.body.find('.toggle-nav').on('click', function() {
      return $(this).parents('header').find('#navbar-menu img').trigger('click');
    });
    return $('#mobile-header-nav').on('click', '.mobile-sub-nav li', this.onClickMobileSubNavLink);
  };

  HeaderAnimation.prototype.handleSubNav = function() {
    var id, startPage;
    startPage = $('.subnav').data('page');
    id = $('.nav-list a[data-page-short="' + startPage + '"]').data('page');
    return this.showSubNavLinks(id);
  };

  HeaderAnimation.prototype.showInitialSubNav = function() {
    var section;
    section = $('.subnav').data('page');
    if (section === 'offerings' || section === 'accommodations' || section === 'ourparks') {
      return this.showSubNavLinks('our-parks');
    } else if (section === 'partnership-details' || section === 'partnership') {
      return this.showSubNavLinks('partnerships');
    }
  };

  HeaderAnimation.prototype.toggleNav = function(e) {};

  HeaderAnimation.prototype.handleResize = function() {
    this.handleSubNav();
    return this.adjustMobileNav();
  };

  HeaderAnimation.prototype.positionSubNavLists = function() {
    if ($('#header-top').hasClass('small')) {
      if (window.innerWidth < 993) {
        $('#our-parks-subnav-list').css('left', this.ourParksLeft - 90);
        return $('#partnerships-subnav-list').css('left', this.partnershipLeft - 133);
      } else {
        $('#our-parks-subnav-list').css('left', this.ourParksLeft - 90);
        return $('#partnerships-subnav-list').css('left', this.partnershipLeft - 118);
      }
    } else {
      if (window.innerWidth < 993) {
        $('#our-parks-subnav-list').css('left', this.ourParksLeft - 60);
        return $('#partnerships-subnav-list').css('left', this.partnershipLeft - 105);
      } else {
        $('#our-parks-subnav-list').css('left', this.ourParksLeft - 60);
        return $('#partnerships-subnav-list').css('left', this.partnershipLeft - 90);
      }
    }
  };

  HeaderAnimation.prototype.animateHeader = function(scrollY) {
    var $hb, $ht;
    if (this.html.hasClass('phone')) {
      return;
    }
    $ht = this.$el.find('#header-top');
    $hb = this.$el.find('#header-bottom');
    if (scrollY > 85) {
      if (!this.navCollapsed) {
        $('#header-top, #header-bottom, #navbar-logo, .nav-list, #buy, .header-contact, .header-social').addClass('small');
        this.navCollapsed = true;
        return this.positionSubNavLists();
      }
    } else {
      if (this.navCollapsed) {
        $('#header-top, #header-bottom, #navbar-logo, .nav-list, #buy, .header-contact, .header-social').removeClass('small');
        this.navCollapsed = false;
        this.handleSubNav();
        return this.positionSubNavLists();
      }
    }
  };

  HeaderAnimation.prototype.handleNavHover = function(e) {
    var parentID;
    parentID = $(e.target).parent().data('page');
    if ($('#' + parentID + '-subnav-list').find('a').length < 1) {
      return this.hideSubNav();
    } else {
      this.hideSubNavLinks();
      this.showSubNavLinks(parentID);
      if (!this.subnavShowing) {
        return this.showSubNav();
      }
    }
  };

  HeaderAnimation.prototype.showSubNav = function() {
    this.subnav.addClass('showing');
    return this.subnavShowing = true;
  };

  HeaderAnimation.prototype.hideSubNav = function() {
    this.subnav.removeClass('showing');
    this.subnavShowing = false;
    return this.handleSubNav();
  };

  HeaderAnimation.prototype.showSubNavLinks = function(page) {
    var a, helper, i, left, len, offset, ref;
    if (page != null) {
      left = $('.nav .nav-list a[data-page="' + page + '"]').position().left;
      offset = 0;
      helper = -45;
      if (window.innerWidth < 993) {
        helper = -20;
      }
      if ($('#' + page + '-subnav-list a').length < 3) {
        ref = $('#' + page + '-subnav-list a');
        for (i = 0, len = ref.length; i < len; i++) {
          a = ref[i];
          offset = offset + $(a).width();
        }
      }
      if (offset > 0) {
        $('#' + page + '-subnav-list').css('left', left - (offset / 3));
      } else {
        this.positionSubNavLists();
      }
      return $('#' + page + '-subnav-list').addClass('showing');
    }
  };

  HeaderAnimation.prototype.hideSubNavLinks = function() {
    return $('.subnav-list li').removeClass('showing');
  };

  HeaderAnimation.prototype.handleSubNav = function() {
    if ($('#header-bottom .subnav').hasClass('ourparks') || $('#header-bottom .subnav').hasClass('offerings') || $('#header-bottom .subnav').hasClass('accommodations')) {
      $('ul.subnav-list li').removeClass('showing');
      $('#our-parks-subnav-list').addClass('showing');
      this.showSubNavLinks('our-parks');
      if ($('#header-bottom .subnav').hasClass('offerings')) {
        $('a#our-parks-offerings-subnav-link').addClass('selected');
      }
      if ($('#header-bottom .subnav').hasClass('accommodations')) {
        return $('a#our-parks-accommodations-subnav-link').addClass('selected');
      }
    } else if ($('#header-bottom .subnav').hasClass('partnership') || $('#header-bottom .subnav').hasClass('partnership-details')) {
      $('ul.subnav-list li').removeClass('showing');
      $('#partnerships-subnav-list').addClass('showing');
      return this.showSubNavLinks('partnerships');
    }
  };

  HeaderAnimation.prototype.toggleNav = function(e) {
    var $hb, $hh, $mn, $t;
    e.preventDefault();
    $t = $(e.target);
    $hb = $('#header-bottom');
    $mn = $('#mobile-header-nav');
    $hh = $hb.height();
    $t.toggleClass('closed');
    console.log('second toggle');
    console.log($t);
    if ($t.hasClass('closed')) {
      this.adjustMobileNav();
      return TweenMax.to(this.mobnav, .35, {
        y: 800 + $hh,
        z: 0,
        ease: Power1.easeOut,
        onComplete: (function(_this) {
          return function() {
            return TweenMax.set(_this.mobnav, {
              z: 10
            });
          };
        })(this)
      });
    } else {
      TweenMax.set(this.mobnav, {
        z: -2
      });
      TweenMax.to(this.mobnav, .5, {
        y: 0,
        z: 0,
        ease: Power1.easeIn
      });
      $('.mobile-sub-nav').css('height', '0px');
      this.adjustMobileNav;
      this.hideMobileSubNav();
      return TweenMax.set(this.content, {
        y: 0
      });
    }
  };

  HeaderAnimation.prototype.adjustMobileNav = function() {
    var $hb, $hh, $ih, $iw, $mb, $mn, $nh;
    $hb = $('#header-bottom');
    $mn = $('#mobile-header-nav');
    $hh = $hb.height();
    $nh = $mn.height();
    $iw = window.innerWidth;
    $ih = window.innerHeight;
    $mb = $('#navbar-menu');
    if ($nh > $ih) {
      return $mn.css({
        height: $ih - $hh,
        overflow: 'scroll'
      });
    } else {
      return $mn.css({
        height: 400 + 'px'
      });
    }
  };

  HeaderAnimation.prototype.showMobileSubNav = function(e) {
    var howMany, target, thisSubNav, windowHeight;
    thisSubNav = $(e.target).parent().find('.mobile-sub-nav');
    if (thisSubNav.find('li').length < 1) {
      this.hideMobileSubNav();
      $(e.target).addClass('active');
      return;
    }
    if (!($(e.target).parent().hasClass('active'))) {
      e.preventDefault();
    }
    howMany = thisSubNav.find('li').length;
    windowHeight = window.innerHeight;
    target = $(e.target);
    this.hideMobileSubNav();
    target.find('i').addClass('active');
    target.addClass('active');
    target.parents('a').addClass('active');
    this.mobnav.css('height', (windowHeight - 100) + 'px');
    return thisSubNav.css('height', (howMany * 50) + 'px');
  };

  HeaderAnimation.prototype.hideMobileSubNav = function() {
    $('.mobile-sub-nav').css('height', '0px');
    this.mobnav.css('height', '400px');
    this.mobnav.find('i').removeClass('active');
    this.mobnav.find('li').removeClass('active');
    return this.mobnav.find('ul a').removeClass('active');
  };

  HeaderAnimation.prototype.handleArrowClick = function(e) {
    e.stopPropagation();
    e.preventDefault();
    if ($(e.target).hasClass('active')) {
      return this.hideMobileSubNav();
    } else {
      return $(e.target).parents('li').trigger('click');
    }
  };

  HeaderAnimation.prototype.onClickMobileSubNavLink = function(e) {
    var url;
    e.preventDefault();
    e.stopPropagation();
    if ($(e.target).data('href') != null) {
      url = $(e.target).data('href');
      return window.location.href = url;
    }
  };

  return HeaderAnimation;

})(PluginBase);

module.exports = HeaderAnimation;



},{"../abstract/PluginBase.coffee":4,"../global/index.coffee":6}],15:[function(require,module,exports){
var ParksList, PluginBase, VideoOverlay,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

VideoOverlay = require('./VideoOverlay.coffee');

ParksList = (function(superClass) {
  extend(ParksList, superClass);

  function ParksList(opts) {
    this.selectLogo = bind(this.selectLogo, this);
    this.showNewAccommodations = bind(this.showNewAccommodations, this);
    this.handleLogoInteraction = bind(this.handleLogoInteraction, this);
    this.$el = $(opts.el);
    ParksList.__super__.constructor.call(this, opts);
    this.gallery = opts.gallery;
    if (this.gallery != null) {
      this.gallery.on("itemIndex", this.selectLogo);
    }
    this.page = opts.page;
  }

  ParksList.prototype.initialize = function() {
    this.parkLogos = $(this.$el).find("li");
    this.currentSelected = this.parkLogos.filter(":first-child");
    if (this.gallery != null) {
      this.selectLogo(this.selectedLogo());
      this.gallery.goto(this.selectedLogo(), true);
    }
    return ParksList.__super__.initialize.call(this);
  };

  ParksList.prototype.addEvents = function() {
    this.$el.on('click', 'li.park', this.handleLogoInteraction);
    return this.parkLogos.each((function(_this) {
      return function(i, t) {
        var logoEvents;
        logoEvents = new Hammer(t);
        return logoEvents.on('tap', _this.handleLogoInteraction);
      };
    })(this));
  };

  ParksList.prototype.handleLogoInteraction = function(e) {
    var $target, id, whichPark;
    if (this.page === 'accommodation') {
      this.parkLogos.removeClass('selected');
      $(e.target).parents('li.park').addClass('selected');
      whichPark = $(e.target).parents('li.park').attr('id');
      this.showNewAccommodations(whichPark);
      return false;
    }
    $target = $(e.target).closest('li');
    id = $target.data('id');
    return this.displayContent(id);
  };

  ParksList.prototype.showNewAccommodations = function(park) {
    $('#accommodations-gallery .swiper-container').removeClass('active');
    $('#accommodations-gallery .carousel-wrapper').removeClass('active');
    $('#accommodations-gallery .swiper-container[data-logo="' + park + '"]').addClass('active');
    return $('#accommodations-gallery .swiper-container[data-logo="' + park + '"]').parent().addClass('active');
  };

  ParksList.prototype.displayContent = function(id) {
    this.selectLogo(id);
    return this.gallery.goto(id);
  };

  ParksList.prototype.selectLogo = function(id) {
    var logoId;
    logoId = "#" + id + "-logo";
    this.parkLogos.removeClass('selected');
    return this.parkLogos.filter(logoId).addClass('selected');
  };

  ParksList.prototype.selectedLogo = function() {
    return this.parkLogos.parent().find('li.selected').data('id');
  };

  return ParksList;

})(PluginBase);

module.exports = ParksList;



},{"../abstract/PluginBase.coffee":4,"./VideoOverlay.coffee":19}],16:[function(require,module,exports){
var PluginBase, ResizeButtons,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

ResizeButtons = (function(superClass) {
  extend(ResizeButtons, superClass);

  function ResizeButtons() {
    this.resizeButtons();
  }

  ResizeButtons.prototype.resizeButtons = function() {
    var btn_wrapper, btn_wrappers, btns, c, i, len, maxWidth, results, widestSpan;
    c = $('#content');
    btn_wrappers = c.find('.btn-wrapper');
    results = [];
    for (i = 0, len = btn_wrappers.length; i < len; i++) {
      btn_wrapper = btn_wrappers[i];
      btns = $(btn_wrapper).find('a');
      if (btns.length > 1) {
        maxWidth = 0;
        widestSpan = null;
        $(btns).each(function() {
          if ($(this).width() > maxWidth) {
            maxWidth = $(this).width();
            return widestSpan = $(this);
          }
        });
        results.push($(btns).each(function() {
          return $(this).css({
            width: maxWidth + 60
          });
        }));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return ResizeButtons;

})(PluginBase);

module.exports = ResizeButtons;



},{"../abstract/PluginBase.coffee":4}],17:[function(require,module,exports){
var SvgInject,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

SvgInject = (function() {
  function SvgInject(selector) {
    this.onLoadComplete = bind(this.onLoadComplete, this);
    this.onSvgLoaded = bind(this.onSvgLoaded, this);
    this.$svgs = $(selector);
    this.preloader = new createjs.LoadQueue(true, "", true);
    this.preloader.setMaxConnections(10);
    this.preloader.addEventListener('fileload', this.onSvgLoaded);
    this.preloader.addEventListener('complete', this.onLoadComplete);
    this.manifest = [];
    this.collectSvgUrls();
    this.loadSvgs();
  }

  SvgInject.prototype.collectSvgUrls = function() {
    var self;
    self = this;
    return this.$svgs.each(function() {
      var id, svgUrl;
      id = "svg-inject-" + (parseInt(Math.random() * 1000).toString());
      $(this).attr('id', id);
      $(this).attr('data-arb', "abc123");
      svgUrl = $(this).attr('src');
      return self.manifest.push({
        id: id,
        src: svgUrl
      });
    });
  };

  SvgInject.prototype.loadSvgs = function() {
    return this.preloader.loadManifest(this.manifest);
  };

  SvgInject.prototype.injectSvg = function(id, svgData) {
    var $el, cls, dimensions, imgClass, imgData, imgID, oh, ow, svg;
    $el = $("#" + id);
    imgID = $el.attr('id');
    imgClass = $el.attr('class');
    imgData = $el.clone(true).data() || [];
    dimensions = {
      w: $el.attr('width'),
      h: $el.attr('height')
    };
    svg = $(svgData).filter('svg');
    if (typeof imgID !== 'undefined') {
      svg = svg.attr("id", imgID);
    }
    if (typeof imgClass !== 'undefined') {
      cls = (svg.attr("class") !== 'undefined' ? svg.attr("class") : "");
      svg = svg.attr("class", imgClass + " " + cls + " replaced-svg");
    }
    $.each(imgData, function(name, value) {
      svg[0].setAttribute("data-" + name, value);
    });
    svg = svg.removeAttr("xmlns:a");
    ow = parseFloat(svg.attr("width"));
    oh = parseFloat(svg.attr("height"));
    if (dimensions.w && dimensions.h) {
      $(svg).attr("width", dimensions.w);
      $(svg).attr("height", dimensions.h);
    } else if (dimensions.w) {
      $(svg).attr("width", dimensions.w);
      $(svg).attr("height", (oh / ow) * dimensions.w);
    } else if (dimensions.h) {
      $(svg).attr("height", dimensions.h);
      $(svg).attr("width", (ow / oh) * dimensions.h);
    }
    return $el.replaceWith(svg);
  };

  SvgInject.prototype.onSvgLoaded = function(e) {
    return this.injectSvg(e.item.id, e.rawResult);
  };

  SvgInject.prototype.onLoadComplete = function(e) {};

  return SvgInject;

})();

module.exports = SvgInject;



},{}],18:[function(require,module,exports){
var PluginBase, TickerList,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

TickerList = (function(superClass) {
  extend(TickerList, superClass);

  function TickerList(opts) {
    this.onGetStockFail = bind(this.onGetStockFail, this);
    this.onGetStockSuccess = bind(this.onGetStockSuccess, this);
    TickerList.__super__.constructor.call(this, opts);
  }

  TickerList.prototype.initialize = function() {
    TickerList.__super__.initialize.call(this);
    this.tickerListWrapper = this.$el.find(".ticker-list-wrapper");
    this.tickerList1 = this.$el.find(".ticker-list.1");
    this.tickerList2 = this.$el.find(".ticker-list.2");
    this.tickerLists = this.$el.find(".ticker-list");
    this.tickers = this.$el.find("span.ticker");
    this.firstTicker = this.$el.find("span.ticker:first-child");
    return this.initializeTicker();
  };

  TickerList.prototype.getStockInfo = function() {

    /* AJAX call to grab Cedar Fair Stock Price from Google and insert into stock ticker */
    return $.ajax({
      url: "http://finance.google.com/finance/info?client=ig&q=NYSE:FUN",
      dataType: "jsonp",
      error: this.onGetStockFail,
      success: this.onGetStockSuccess
    });
  };

  TickerList.prototype.generateStockElement = function(info) {

    /* Setup the HTML to be inserted into the ticker */
    var amnt, amntEl, img, name, wrapper;
    wrapper = $("<span class='ticker' id='ticker-span-nyse'></span>");
    name = $("<p class='ticker-headline'>" + info.t + "</p>");
    amnt = info.c.substr(1, info.c.length - 1);
    if (info.c.indexOf('+') > -1) {
      img = $("<img class='ticker-arrow' src='images/icons/ticker-up-arrow.png' />");
    } else {
      img = $("<img class='ticker-arrow' src='images/icons/ticker-down-arrow.png' />");
    }
    amntEl = $("<p class='ticker-amount'>" + amnt + "</p>");

    /* Append the HTML to the ticker lists */
    wrapper.append(name, img, amntEl);
    return wrapper;
  };

  TickerList.prototype.initializeTicker = function(stockEl) {

    /* Set the width of the ticker list wrapper to be equal to sum of ticker1 and ticker2 width */
    var howMany, moveLeft, targetWidth, time;
    targetWidth = (this.tickerList1.width() * 2.1) + 200;
    console.log('targetWidth: ', targetWidth);
    this.tickerListWrapper.css({
      width: targetWidth
    });

    /* Define distance to slide left and setup TimelineMax */
    moveLeft = this.tickerLists.first().width();
    howMany = $('.ticker-list.1').children('span').length;
    time = howMany * 8;
    return TweenMax.to(this.tickerListWrapper, time, {
      repeat: -1,
      force3D: true,
      x: -moveLeft,
      ease: Linear.easeNone
    });
  };

  TickerList.prototype.onGetStockSuccess = function(data) {
    var info, stockEl;
    info = data[0];
    stockEl = this.generateStockElement(info);
    return this.initializeTicker(stockEl);
  };

  TickerList.prototype.onGetStockFail = function() {
    return this.initializeTicker();
  };

  return TickerList;

})(PluginBase);

module.exports = TickerList;



},{"../abstract/PluginBase.coffee":4}],19:[function(require,module,exports){
var VideoOverlay, overlay,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

VideoOverlay = (function() {
  function VideoOverlay(el) {
    this.showImage = bind(this.showImage, this);
    this.playVideo = bind(this.playVideo, this);
    this.closeOverlay = bind(this.closeOverlay, this);
    this.$el = $(el);
    this.$inner = this.$el.find(".overlay-inner");
    this.$container = this.$el.find(".overlay-inner-container");
    if (this.$container.find('.overlay-content').size() === 1) {
      this.$container = this.$container.find('.overlay-content');
    }
    this.$close = this.$el.find(".overlay-close");
    this.createVideoInstance();
    this.createOverlayTransition();
    this.addEvents();
  }

  VideoOverlay.prototype.createOverlayTransition = function() {
    this.tl = new TimelineMax;
    this.$el.show();
    this.tl.add(TweenMax.fromTo($('#overlay'), .01, {
      zIndex: -1,
      display: 'none',
      z: 0
    }, {
      zIndex: 5000,
      display: 'block',
      z: 9999999999
    }));
    this.tl.add(TweenMax.to(this.$el, .35, {
      autoAlpha: 1
    }));
    this.tl.add(TweenMax.to(this.$inner, .55, {
      alpha: 1
    }));
    this.tl.add(TweenMax.to(this.$close, .25, {
      alpha: 1
    }, "-=.15"));
    this.tl.addLabel("initContent");
    return this.tl.stop();
  };

  VideoOverlay.prototype.createVideoInstance = function() {};

  VideoOverlay.prototype.addEvents = function() {
    return this.closeEvent = new Hammer(this.$close[0]);
  };

  VideoOverlay.prototype.transitionInOverlay = function(next) {
    console.log('transitionInOverlay');
    this.transInCb = next;
    this.tl.addCallback(this.transInCb, "initContent");
    this.tl.play();
    return this.closeEvent.on('tap', this.closeOverlay);
  };

  VideoOverlay.prototype.transitionOutOverlay = function() {
    console.log('transitionOutOverlay');
    this.closeEvent.off('tap', this.closeOverlay);
    this.tl.removeCallback(this.transInCb);
    this.tl.reverse();
    return delete this.transInCb;
  };

  VideoOverlay.prototype.closeOverlay = function(e) {
    this.removeVideo();
    return this.transitionOutOverlay();
  };

  VideoOverlay.prototype.removeVideo = function() {
    if (this.videoInstance) {
      this.videoInstance.pause();
      return this.videoInstance.currentTime(0);
    }
  };

  VideoOverlay.prototype.resizeOverlay = function() {
    var $h, $vid, $w;
    $vid = this.$el.find('video');
    $w = window.innerWidth;
    return $h = $vid.height();
  };

  VideoOverlay.prototype.appendData = function(data) {
    var mp4, webm;
    if (data.mp4 === "" || (data.mp4 == null)) {
      console.log('no video, its an image');
      this.poster = $("<div class='video-js'><img class='vjs-tech' src='" + data.poster + "' class='media-image-poster' /></div>");
      this.$container.html(this.poster);
      this.poster.css('height', '100%');
      this.removeVideo();
      return false;
    }
    mp4 = $("<source src=\"" + data.mp4 + "\" type=\"video/mp4\" /> ");
    webm = $("<source src=\"" + data.webm + "\" type=\"video/webm\" /> ");
    this.$videoEl = $("<video id='overlay-player' class='vjs-default-skin video-js' controls preload='auto' />");
    this.$videoEl.append(mp4);
    this.$videoEl.append(webm);
    this.$container.html(this.$videoEl);
    if (this.videoInstance != null) {
      this.videoInstance.dispose();
    }
    return this.videoInstance = videojs("overlay-player", {
      width: "100%",
      height: "100%"
    });
  };

  VideoOverlay.prototype.playVideo = function() {
    if (this.videoInstance != null) {
      return this.videoInstance.play();
    }
  };

  VideoOverlay.prototype.showImage = function() {
    return console.log('showImage');
  };

  return VideoOverlay;

})();

overlay = new VideoOverlay("#overlay");

module.exports.initVideoOverlay = function(data) {
  console.log('data2: ', data);
  overlay.appendData(data);
  if (!(data.mp4 === "")) {
    console.log('data.mp4 !== ""');
    return overlay.transitionInOverlay(overlay.playVideo);
  } else {
    console.log('data.mp4 === ""');
    return overlay.transitionInOverlay(overlay.showImage);
  }
};



},{}],20:[function(require,module,exports){
var FrameAnimation, FramesModel, PluginBase, matchFrameNum,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../../abstract/PluginBase.coffee');

FramesModel = require('./FramesModel.coffee');

matchFrameNum = /\d+(?=\.[a-zA-Z]+)/;

FrameAnimation = (function(superClass) {
  extend(FrameAnimation, superClass);

  function FrameAnimation(opts) {
    this.inViewport = bind(this.inViewport, this);
    this.checkCoasterVisibility = bind(this.checkCoasterVisibility, this);
    this.onFramesLoaded = bind(this.onFramesLoaded, this);
    this.onTrackLoaded = bind(this.onTrackLoaded, this);
    this.setupCanvas = bind(this.setupCanvas, this);
    var depth;
    this.$el = $(opts.el);
    this.async = opts.async || false;
    depth = opts.depth || 1;
    this.$container = $("<div class='coaster-container' />");
    this.$container.attr('id', opts.id);
    this.$container.css('z-index', depth);
    TweenMax.set(this.$container, {
      z: depth * 10
    });
    FrameAnimation.__super__.constructor.call(this, opts);
  }

  FrameAnimation.prototype.initialize = function(opts) {
    FrameAnimation.__super__.initialize.call(this, opts);
    this.model = new FramesModel(opts);
    this.model.on("dataLoaded", this.setupCanvas);
    this.model.on("trackLoaded", this.onTrackLoaded);
    this.model.on("framesLoaded", this.onFramesLoaded);
    return this.model.loadData();
  };

  FrameAnimation.prototype.loadFrames = function() {
    if (this.model.data != null) {
      return this.model.preloadFrames();
    } else {
      return this.deferLoading = true;
    }
  };

  FrameAnimation.prototype.setupCanvas = function() {
    this.canvasWidth = this.model.get('global').width;
    this.canvasHeight = this.model.get('global').height;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext('2d');
    this.canvas.setAttribute('width', this.canvasWidth);
    this.canvas.setAttribute('height', this.canvasHeight);
    this.$container.append(this.canvas);
    this.$el.prepend(this.$container);
    this.model.preloadTrack();
    if (this.deferLoading) {
      return this.model.preloadFrames();
    }
  };

  FrameAnimation.prototype.displayTrack = function() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    return this.context.drawImage(this.trackImage.tag, 0, 0, this.canvasWidth, this.canvasHeight);
  };

  FrameAnimation.prototype.displayFrame = function(num) {
    var asset, frameAsset, manifest;
    manifest = this.model.get('manifest');
    if (manifest.length > num) {
      asset = manifest[num];
      frameAsset = this.model.getAsset(asset.filename);
      return this.context.drawImage(frameAsset.tag, asset.x, asset.y, asset.width, asset.height);
    }
  };

  FrameAnimation.prototype.initAnimation = function() {
    var delay, duration, frames, repeatDelay, self, speed;
    frames = this.model.get('manifest').length;
    speed = this.model.get('global').fps;
    delay = this.model.get('global').delay || 0;
    repeatDelay = this.model.get('global').repeatDelay || 10;
    duration = frames / speed;
    self = this;
    this.lastFrameNum = -1;
    return this.timeline = window.coaster = TweenMax.to(this.canvas, duration, {
      onUpdate: function() {
        var frameNum;
        frameNum = Math.floor(frames * this.progress());
        if (frameNum !== this.lastFrameNum) {
          self.displayTrack();
          self.displayFrame(frameNum);
        }
        return this.lastFrameNum = frameNum;
      },
      repeat: -1,
      repeatDelay: repeatDelay,
      delay: delay
    });
  };

  FrameAnimation.prototype.onTrackLoaded = function() {
    this.trackImage = this.model.getAsset('track');
    return this.displayTrack();
  };

  FrameAnimation.prototype.onFramesLoaded = function() {
    if (typeof this.async === 'function') {
      this.async();
    }
    $(window).on('scroll', this.checkCoasterVisibility);
    return this.checkCoasterVisibility();
  };

  FrameAnimation.prototype.checkCoasterVisibility = function() {
    if (this.inViewport()) {
      $(window).off('scroll', this.checkCoasterVisibility);
      return this.initAnimation();
    }
  };

  FrameAnimation.prototype.inViewport = function() {
    var bottom, height, scrollBottom, scrollTop, top;
    top = this.$container.offset().top;
    height = this.$container.find('canvas').first().height();
    bottom = top + height;
    scrollTop = $(window).scrollTop();
    scrollBottom = $(window).scrollTop() + $(window).height();
    if ((scrollTop <= top && top <= scrollBottom)) {
      return true;
    } else {
      return false;
    }
  };

  return FrameAnimation;

})(PluginBase);

module.exports = FrameAnimation;



},{"../../abstract/PluginBase.coffee":4,"./FramesModel.coffee":21}],21:[function(require,module,exports){
var FramesModel, matchFrameNum,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

matchFrameNum = /\d+(?=\.[a-zA-Z]+)/;

FramesModel = (function(superClass) {
  extend(FramesModel, superClass);

  function FramesModel(opts) {
    this.onAssetsComplete = bind(this.onAssetsComplete, this);
    this.onTrackAssetsComplete = bind(this.onTrackAssetsComplete, this);
    this.onDataLoaded = bind(this.onDataLoaded, this);
    this.baseUrl = opts.baseUrl;
    this.url = opts.url;
    this.loadManifest = [];
    this.trackManifest = [];
    this.initLoader();
    FramesModel.__super__.constructor.call(this, opts);
  }

  FramesModel.prototype.loadData = function() {
    return $.ajax({
      url: this.baseUrl + this.url,
      method: "GET",
      dataType: "json",
      success: this.onDataLoaded,
      error: this.handleError
    });
  };

  FramesModel.prototype.handleError = function(err) {
    throw err;
  };

  FramesModel.prototype.onDataLoaded = function(data) {
    this.data = data;
    this.transformData();
    return this.emit("dataLoaded");
  };

  FramesModel.prototype.sortSequence = function(a, b) {
    var aFrame, bFrame;
    aFrame = matchFrameNum.exec(a.filename);
    bFrame = matchFrameNum.exec(b.filename);
    if (parseInt(aFrame[0]) < parseInt(bFrame[0])) {
      return -1;
    } else {
      return 1;
    }
  };

  FramesModel.prototype.transformData = function() {
    var frame, i, len, ref, results;
    this.data.manifest.sort(this.sortSequence);
    this.trackManifest.push({
      id: "track",
      src: this.data.global.folder + "/" + this.data.global.track
    });
    ref = this.data.manifest;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      frame = ref[i];
      frame.src = this.data.global.folder + "/" + frame.filename;
      results.push(this.loadManifest.push({
        id: frame.filename,
        src: frame.src
      }));
    }
    return results;
  };

  FramesModel.prototype.initLoader = function() {
    this.trackLoader = new createjs.LoadQueue(true, this.baseUrl, true);
    this.preloader = new createjs.LoadQueue(true, this.baseUrl, true);
    this.trackLoader.setMaxConnections(10);
    return this.preloader.setMaxConnections(15);
  };

  FramesModel.prototype.preloadTrack = function() {
    this.trackLoader.addEventListener('complete', this.onTrackAssetsComplete);
    return this.trackLoader.loadManifest(this.trackManifest);
  };

  FramesModel.prototype.preloadFrames = function() {
    this.preloader.addEventListener('complete', this.onAssetsComplete);
    return this.preloader.loadManifest(this.loadManifest);
  };

  FramesModel.prototype.onTrackAssetsComplete = function(e) {
    this.trackLoader.removeEventListener('complete', this.onTrackAssetsComplete);
    return this.emit("trackLoaded");
  };

  FramesModel.prototype.onAssetsComplete = function(e) {
    this.preloader.removeEventListener('complete', this.onAssetsComplete);
    return this.emit("framesLoaded");
  };

  FramesModel.prototype.getAsset = function(id) {
    var item;
    item = this.preloader.getItem(id);
    if (item == null) {
      item = this.trackLoader.getItem(id);
    }
    return item;
  };

  FramesModel.prototype.get = function(key) {
    var k, ref, v;
    ref = this.data;
    for (k in ref) {
      v = ref[k];
      if (k === key) {
        return v;
      }
    }
  };

  FramesModel.prototype.set = function(key, val) {
    return this.data[key] = val;
  };

  return FramesModel;

})(EventEmitter);

module.exports = FramesModel;



},{}],22:[function(require,module,exports){
var ScrollBar, ViewBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ViewBase = require("../abstract/ViewBase.coffee");

ScrollBar = (function(superClass) {
  extend(ScrollBar, superClass);

  function ScrollBar() {
    this.showScrollbar = bind(this.showScrollbar, this);
    this.hideScrollbar = bind(this.hideScrollbar, this);
    this.onResize = bind(this.onResize, this);
    this.onMouseMove = bind(this.onMouseMove, this);
    this.onHandleUp = bind(this.onHandleUp, this);
    this.onHandleDown = bind(this.onHandleDown, this);
    this.onRailClick = bind(this.onRailClick, this);
    this.updateHandle = bind(this.updateHandle, this);
    this.setEvents = bind(this.setEvents, this);
    return ScrollBar.__super__.constructor.apply(this, arguments);
  }

  ScrollBar.prototype.scrolling = false;

  ScrollBar.prototype.offsetY = 0;

  ScrollBar.prototype.position = 0;

  ScrollBar.prototype.hideTimeout = 0;

  ScrollBar.prototype.initialize = function() {
    this.onResize();
    this.setEvents();
    if (window.isTierTablet) {
      return this.$el.hide();
    }
  };

  ScrollBar.prototype.setEvents = function() {
    this.delegateEvents({
      "mousedown .handle": "onHandleDown",
      "click .rail": "onRailClick"
    });
    $(document).on("mouseup", this.onHandleUp);
    return $(document).on("mousemove", this.onMouseMove);
  };

  ScrollBar.prototype.updateHandle = function(pos) {
    this.position = pos;
    this.$el.find('.handle').css({
      top: this.position * ($(window).height() - this.$el.find(".handle").height())
    });
    this.showScrollbar();
    return this.hideScrollbar();
  };

  ScrollBar.prototype.onRailClick = function(e) {
    this.offsetY = e.offsetY !== void 0 ? e.offsetY : e.originalEvent.layerY;
    this.position = this.offsetY / $(window).height();
    return this.trigger("customScrollJump", this.position);
  };

  ScrollBar.prototype.onHandleDown = function(e) {
    this.$el.css({
      width: "100%"
    });
    this.offsetY = e.offsetY !== void 0 ? e.offsetY : e.originalEvent.layerY;
    return this.scrolling = true;
  };

  ScrollBar.prototype.onHandleUp = function(e) {
    this.$el.css({
      width: "15px"
    });
    return this.scrolling = false;
  };

  ScrollBar.prototype.onMouseMove = function(e) {
    if (this.scrolling) {
      if (e.pageY - this.offsetY <= 0) {
        $(".handle").css({
          top: 1
        });
      } else if (e.pageY - this.offsetY >= $(window).height() - $("#scrollbar .handle").height()) {
        $(".handle").css({
          top: ($(window).height() - $("#scrollbar .handle").height()) - 1
        });
      } else {
        $(".handle").css({
          top: e.pageY - this.offsetY
        });
      }
      this.position = parseInt($("#scrollbar .handle").css("top")) / ($(window).height() - $("#scrollbar .handle").height());
      if (this.position < parseFloat(.005)) {
        this.position = 0;
      } else if (this.position > parseFloat(.995)) {
        this.position = 1;
      }
      this.trigger("customScroll", this.position);
    }
    if (this.mouseX !== e.clientX && this.mouseY !== e.clientY) {
      this.showScrollbar();
      this.hideScrollbar();
    }
    this.mouseX = e.clientX;
    return this.mouseY = e.clientY;
  };

  ScrollBar.prototype.onResize = function(e) {
    this.$el.find('.handle').css({
      height: ($(window).height() / $("section").height()) * $(window).height()
    });
    return this.updateHandle(this.position);
  };

  ScrollBar.prototype.hideScrollbar = function() {
    if (this.hideTimeout != null) {
      clearTimeout(this.hideTimeout);
    }
    return this.hideTimeout = setTimeout(((function(_this) {
      return function() {
        if (_this.mouseY > 72) {
          return TweenMax.to(_this.$el, .5, {
            autoAlpha: 0
          });
        }
      };
    })(this)), 2000);
  };

  ScrollBar.prototype.showScrollbar = function() {
    return TweenMax.to(this.$el, .5, {
      autoAlpha: .5
    });
  };

  return ScrollBar;

})(ViewBase);

module.exports = ScrollBar;



},{"../abstract/ViewBase.coffee":5}],23:[function(require,module,exports){
var Sharer;

Sharer = (function() {
  function Sharer() {}

  Sharer.initFacebook = function() {
    return FB.init({
      appId: "215224705307341",
      channelUrl: "/channel.html",
      status: true,
      xfbl: true
    });
  };

  Sharer.shareTwitter = function(shareMessage, url, hashtags) {
    var text, twURL;
    text = shareMessage;
    hashtags = "";
    url = url;
    twURL = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url);
    if (hashtags) {
      str += "&hashtags=" + hashtags;
    }
    return this.openPopup(575, 420, twURL, "Twitter");
  };

  Sharer.shareFacebook = function(name, caption, description, link, picture) {
    return FB.ui({
      method: "feed",
      link: link,
      picture: picture,
      name: name,
      caption: caption,
      description: description
    });
  };

  Sharer.shareGoogle = function(url) {
    return this.openPopup(600, 400, "https://plus.google.com/share?url=" + url, "Google");
  };

  Sharer.sharePinterest = function(url, description, picture) {
    description = description.split(" ").join("+");
    return this.openPopup(780, 320, "http://pinterest.com/pin/create/button/?url=" + (encodeURIComponent(url)) + "&amp;description=" + description + "&amp;media=" + (encodeURIComponent(picture)));
  };

  Sharer.emailLink = function(subject, body) {
    var x;
    x = this.openPopup(1, 1, "mailto:&subject=" + (encodeURIComponent(subject)) + "&body=" + (encodeURIComponent(body)));
    return x.close();
  };

  Sharer.openPopup = function(w, h, url, name) {
    return window.open(url, name, "status=1,width=" + w + ",height=" + h + ",left=" + (screen.width - w) / 2 + ",top=" + (screen.height - h) / 2);
  };

  return Sharer;

})();

module.exports = Sharer;



},{}],24:[function(require,module,exports){
var DraggableGallery, FadeGallery, HeaderAnimation, HomePage, ParksList, TickerList, globals;

globals = require('./com/global/index.coffee');

ParksList = require('./com/plugins/ParksList.coffee');

DraggableGallery = require('./com/plugins/DraggableGallery.coffee');

FadeGallery = require('./com/plugins/FadeGallery.coffee');

TickerList = require('./com/plugins/TickerList.coffee');

HeaderAnimation = require('./com/plugins/HeaderAnimation.coffee');

HomePage = require('./com/pages/HomePage.coffee');

$(document).ready(function() {
  var home;
  home = new HomePage({
    el: "body"
  });
  return $('.circle').on('click', function() {
    var target;
    target = $(this);
    return TweenMax.fromTo(target, .5, {
      rotationY: 720
    }, {
      rotationY: 0
    });
  });
});



},{"./com/global/index.coffee":6,"./com/pages/HomePage.coffee":7,"./com/plugins/DraggableGallery.coffee":12,"./com/plugins/FadeGallery.coffee":13,"./com/plugins/HeaderAnimation.coffee":14,"./com/plugins/ParksList.coffee":15,"./com/plugins/TickerList.coffee":18}]},{},[24])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXN5bmMvbGliL2FzeW5jLmpzIiwibm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9hYnN0cmFjdC9BbmltYXRpb25CYXNlLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9hYnN0cmFjdC9WaWV3QmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vZ2xvYmFsL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wYWdlcy9Ib21lUGFnZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvYW5pbWF0aW9ucy9jbG91ZHMuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BhZ2VzL2FuaW1hdGlvbnMvZ2xvYmFsLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wYWdlcy9hbmltYXRpb25zL2hvbWUuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0RyYWdnYWJsZUdhbGxlcnkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvRmFkZUdhbGxlcnkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9SZXNpemVCdXR0b25zLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL1N2Z0luamVjdC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9UaWNrZXJMaXN0LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL1ZpZGVvT3ZlcmxheS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9jb2FzdGVycy9GcmFtZUFuaW1hdGlvbi5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9jb2FzdGVycy9GcmFtZXNNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vdXRpbC9TY3JvbGxCYXIuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3V0aWwvU2hhcmVyLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2hvbWUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNubUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBLElBQUEsMkRBQUE7RUFBQTs7NkJBQUE7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUixDQUFY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O0tBQTVCLEVBQStDO0FBQUEsTUFBQyxTQUFBLEVBQVcsQ0FBWjtLQUEvQyxFQUZxQjtFQUFBLENBQXpCLEVBVGM7QUFBQSxDQUFsQixDQVJBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gKiBhc3luY1xuICogaHR0cHM6Ly9naXRodWIuY29tL2Nhb2xhbi9hc3luY1xuICpcbiAqIENvcHlyaWdodCAyMDEwLTIwMTQgQ2FvbGFuIE1jTWFob25cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4vKmpzaGludCBvbmV2YXI6IGZhbHNlLCBpbmRlbnQ6NCAqL1xuLypnbG9iYWwgc2V0SW1tZWRpYXRlOiBmYWxzZSwgc2V0VGltZW91dDogZmFsc2UsIGNvbnNvbGU6IGZhbHNlICovXG4oZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGFzeW5jID0ge307XG5cbiAgICAvLyBnbG9iYWwgb24gdGhlIHNlcnZlciwgd2luZG93IGluIHRoZSBicm93c2VyXG4gICAgdmFyIHJvb3QsIHByZXZpb3VzX2FzeW5jO1xuXG4gICAgcm9vdCA9IHRoaXM7XG4gICAgaWYgKHJvb3QgIT0gbnVsbCkge1xuICAgICAgcHJldmlvdXNfYXN5bmMgPSByb290LmFzeW5jO1xuICAgIH1cblxuICAgIGFzeW5jLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBwcmV2aW91c19hc3luYztcbiAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmx5X29uY2UoZm4pIHtcbiAgICAgICAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHJvb3QsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLy8vIGNyb3NzLWJyb3dzZXIgY29tcGF0aWJsaXR5IGZ1bmN0aW9ucyAvLy8vXG5cbiAgICB2YXIgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuICAgIHZhciBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gX3RvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgdmFyIF9lYWNoID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgaWYgKGFyci5mb3JFYWNoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJyLmZvckVhY2goaXRlcmF0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihhcnJbaV0sIGksIGFycik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIF9tYXAgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvcikge1xuICAgICAgICBpZiAoYXJyLm1hcCkge1xuICAgICAgICAgICAgcmV0dXJuIGFyci5tYXAoaXRlcmF0b3IpO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIF9lYWNoKGFyciwgZnVuY3Rpb24gKHgsIGksIGEpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChpdGVyYXRvcih4LCBpLCBhKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgdmFyIF9yZWR1Y2UgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgbWVtbykge1xuICAgICAgICBpZiAoYXJyLnJlZHVjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGFyci5yZWR1Y2UoaXRlcmF0b3IsIG1lbW8pO1xuICAgICAgICB9XG4gICAgICAgIF9lYWNoKGFyciwgZnVuY3Rpb24gKHgsIGksIGEpIHtcbiAgICAgICAgICAgIG1lbW8gPSBpdGVyYXRvcihtZW1vLCB4LCBpLCBhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG5cbiAgICB2YXIgX2tleXMgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgfTtcblxuICAgIC8vLy8gZXhwb3J0ZWQgYXN5bmMgbW9kdWxlIGZ1bmN0aW9ucyAvLy8vXG5cbiAgICAvLy8vIG5leHRUaWNrIGltcGxlbWVudGF0aW9uIHdpdGggYnJvd3Nlci1jb21wYXRpYmxlIGZhbGxiYWNrIC8vLy9cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICd1bmRlZmluZWQnIHx8ICEocHJvY2Vzcy5uZXh0VGljaykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGFzeW5jLm5leHRUaWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgLy8gbm90IGEgZGlyZWN0IGFsaWFzIGZvciBJRTEwIGNvbXBhdGliaWxpdHlcbiAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoZm4pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IGFzeW5jLm5leHRUaWNrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUgPSBhc3luYy5uZXh0VGljaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBwcm9jZXNzLm5leHRUaWNrO1xuICAgICAgICBpZiAodHlwZW9mIHNldEltbWVkaWF0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAvLyBub3QgYSBkaXJlY3QgYWxpYXMgZm9yIElFMTAgY29tcGF0aWJpbGl0eVxuICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoZm4pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IGFzeW5jLm5leHRUaWNrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMuZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICBpZiAoIWFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb21wbGV0ZWQgPSAwO1xuICAgICAgICBfZWFjaChhcnIsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBvbmx5X29uY2UoZG9uZSkgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZ1bmN0aW9uIGRvbmUoZXJyKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICAgIGlmIChjb21wbGV0ZWQgPj0gYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgYXN5bmMuZm9yRWFjaCA9IGFzeW5jLmVhY2g7XG5cbiAgICBhc3luYy5lYWNoU2VyaWVzID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge307XG4gICAgICAgIGlmICghYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvbXBsZXRlZCA9IDA7XG4gICAgICAgIHZhciBpdGVyYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaXRlcmF0b3IoYXJyW2NvbXBsZXRlZF0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZCA+PSBhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGl0ZXJhdGUoKTtcbiAgICB9O1xuICAgIGFzeW5jLmZvckVhY2hTZXJpZXMgPSBhc3luYy5lYWNoU2VyaWVzO1xuXG4gICAgYXN5bmMuZWFjaExpbWl0ID0gZnVuY3Rpb24gKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZm4gPSBfZWFjaExpbWl0KGxpbWl0KTtcbiAgICAgICAgZm4uYXBwbHkobnVsbCwgW2FyciwgaXRlcmF0b3IsIGNhbGxiYWNrXSk7XG4gICAgfTtcbiAgICBhc3luYy5mb3JFYWNoTGltaXQgPSBhc3luYy5lYWNoTGltaXQ7XG5cbiAgICB2YXIgX2VhY2hMaW1pdCA9IGZ1bmN0aW9uIChsaW1pdCkge1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge307XG4gICAgICAgICAgICBpZiAoIWFyci5sZW5ndGggfHwgbGltaXQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNvbXBsZXRlZCA9IDA7XG4gICAgICAgICAgICB2YXIgc3RhcnRlZCA9IDA7XG4gICAgICAgICAgICB2YXIgcnVubmluZyA9IDA7XG5cbiAgICAgICAgICAgIChmdW5jdGlvbiByZXBsZW5pc2ggKCkge1xuICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWQgPj0gYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAocnVubmluZyA8IGxpbWl0ICYmIHN0YXJ0ZWQgPCBhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgcnVubmluZyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihhcnJbc3RhcnRlZCAtIDFdLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVubmluZyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWQgPj0gYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGVuaXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9O1xuICAgIH07XG5cblxuICAgIHZhciBkb1BhcmFsbGVsID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgW2FzeW5jLmVhY2hdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICB2YXIgZG9QYXJhbGxlbExpbWl0ID0gZnVuY3Rpb24obGltaXQsIGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgW19lYWNoTGltaXQobGltaXQpXS5jb25jYXQoYXJncykpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgdmFyIGRvU2VyaWVzID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgW2FzeW5jLmVhY2hTZXJpZXNdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgIH07XG4gICAgfTtcblxuXG4gICAgdmFyIF9hc3luY01hcCA9IGZ1bmN0aW9uIChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFyciA9IF9tYXAoYXJyLCBmdW5jdGlvbiAoeCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIHtpbmRleDogaSwgdmFsdWU6IHh9O1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IoeC52YWx1ZSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IoeC52YWx1ZSwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW3guaW5kZXhdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGFzeW5jLm1hcCA9IGRvUGFyYWxsZWwoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBTZXJpZXMgPSBkb1NlcmllcyhfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcExpbWl0ID0gZnVuY3Rpb24gKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gX21hcExpbWl0KGxpbWl0KShhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIHZhciBfbWFwTGltaXQgPSBmdW5jdGlvbihsaW1pdCkge1xuICAgICAgICByZXR1cm4gZG9QYXJhbGxlbExpbWl0KGxpbWl0LCBfYXN5bmNNYXApO1xuICAgIH07XG5cbiAgICAvLyByZWR1Y2Ugb25seSBoYXMgYSBzZXJpZXMgdmVyc2lvbiwgYXMgZG9pbmcgcmVkdWNlIGluIHBhcmFsbGVsIHdvbid0XG4gICAgLy8gd29yayBpbiBtYW55IHNpdHVhdGlvbnMuXG4gICAgYXN5bmMucmVkdWNlID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2hTZXJpZXMoYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHgsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICBtZW1vID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLy8gaW5qZWN0IGFsaWFzXG4gICAgYXN5bmMuaW5qZWN0ID0gYXN5bmMucmVkdWNlO1xuICAgIC8vIGZvbGRsIGFsaWFzXG4gICAgYXN5bmMuZm9sZGwgPSBhc3luYy5yZWR1Y2U7XG5cbiAgICBhc3luYy5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmV2ZXJzZWQgPSBfbWFwKGFyciwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICB9KS5yZXZlcnNlKCk7XG4gICAgICAgIGFzeW5jLnJlZHVjZShyZXZlcnNlZCwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuICAgIC8vIGZvbGRyIGFsaWFzXG4gICAgYXN5bmMuZm9sZHIgPSBhc3luYy5yZWR1Y2VSaWdodDtcblxuICAgIHZhciBfZmlsdGVyID0gZnVuY3Rpb24gKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgYXJyID0gX21hcChhcnIsIGZ1bmN0aW9uICh4LCBpKSB7XG4gICAgICAgICAgICByZXR1cm4ge2luZGV4OiBpLCB2YWx1ZTogeH07XG4gICAgICAgIH0pO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgudmFsdWUsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKF9tYXAocmVzdWx0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgICAgICAgICAgfSksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHgudmFsdWU7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgYXN5bmMuZmlsdGVyID0gZG9QYXJhbGxlbChfZmlsdGVyKTtcbiAgICBhc3luYy5maWx0ZXJTZXJpZXMgPSBkb1NlcmllcyhfZmlsdGVyKTtcbiAgICAvLyBzZWxlY3QgYWxpYXNcbiAgICBhc3luYy5zZWxlY3QgPSBhc3luYy5maWx0ZXI7XG4gICAgYXN5bmMuc2VsZWN0U2VyaWVzID0gYXN5bmMuZmlsdGVyU2VyaWVzO1xuXG4gICAgdmFyIF9yZWplY3QgPSBmdW5jdGlvbiAoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBhcnIgPSBfbWFwKGFyciwgZnVuY3Rpb24gKHgsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiB7aW5kZXg6IGksIHZhbHVlOiB4fTtcbiAgICAgICAgfSk7XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeC52YWx1ZSwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKF9tYXAocmVzdWx0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgICAgICAgICAgfSksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHgudmFsdWU7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgYXN5bmMucmVqZWN0ID0gZG9QYXJhbGxlbChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RTZXJpZXMgPSBkb1NlcmllcyhfcmVqZWN0KTtcblxuICAgIHZhciBfZGV0ZWN0ID0gZnVuY3Rpb24gKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgbWFpbl9jYWxsYmFjaykge1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIG1haW5fY2FsbGJhY2soeCk7XG4gICAgICAgICAgICAgICAgICAgIG1haW5fY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIG1haW5fY2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBhc3luYy5kZXRlY3QgPSBkb1BhcmFsbGVsKF9kZXRlY3QpO1xuICAgIGFzeW5jLmRldGVjdFNlcmllcyA9IGRvU2VyaWVzKF9kZXRlY3QpO1xuXG4gICAgYXN5bmMuc29tZSA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBtYWluX2NhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2goYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFpbl9jYWxsYmFjayh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgbWFpbl9jYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIG1haW5fY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8vIGFueSBhbGlhc1xuICAgIGFzeW5jLmFueSA9IGFzeW5jLnNvbWU7XG5cbiAgICBhc3luYy5ldmVyeSA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBtYWluX2NhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2goYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgICAgICAgICAgIG1haW5fY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBtYWluX2NhbGxiYWNrID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgbWFpbl9jYWxsYmFjayh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvLyBhbGwgYWxpYXNcbiAgICBhc3luYy5hbGwgPSBhc3luYy5ldmVyeTtcblxuICAgIGFzeW5jLnNvcnRCeSA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5tYXAoYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uIChlcnIsIGNyaXRlcmlhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwge3ZhbHVlOiB4LCBjcml0ZXJpYTogY3JpdGVyaWF9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGZuID0gZnVuY3Rpb24gKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYSwgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IDA7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBfbWFwKHJlc3VsdHMuc29ydChmbiksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmF1dG8gPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge307XG4gICAgICAgIHZhciBrZXlzID0gX2tleXModGFza3MpO1xuICAgICAgICB2YXIgcmVtYWluaW5nVGFza3MgPSBrZXlzLmxlbmd0aFxuICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHRzID0ge307XG5cbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICB2YXIgYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy51bnNoaWZ0KGZuKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNbaV0gPT09IGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciB0YXNrQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZW1haW5pbmdUYXNrcy0tXG4gICAgICAgICAgICBfZWFjaChsaXN0ZW5lcnMuc2xpY2UoMCksIGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBhZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoZUNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgICAgICAgICAgLy8gcHJldmVudCBmaW5hbCBjYWxsYmFjayBmcm9tIGNhbGxpbmcgaXRzZWxmIGlmIGl0IGVycm9yc1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24gKCkge307XG5cbiAgICAgICAgICAgICAgICB0aGVDYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgX2VhY2goa2V5cywgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciB0YXNrID0gX2lzQXJyYXkodGFza3Nba10pID8gdGFza3Nba106IFt0YXNrc1trXV07XG4gICAgICAgICAgICB2YXIgdGFza0NhbGxiYWNrID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2FmZVJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgX2VhY2goX2tleXMocmVzdWx0cyksIGZ1bmN0aW9uKHJrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW3JrZXldID0gcmVzdWx0c1tya2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW2tdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBzYWZlUmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3Agc3Vic2VxdWVudCBlcnJvcnMgaGl0dGluZyBjYWxsYmFjayBtdWx0aXBsZSB0aW1lc1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSh0YXNrQ29tcGxldGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgcmVxdWlyZXMgPSB0YXNrLnNsaWNlKDAsIE1hdGguYWJzKHRhc2subGVuZ3RoIC0gMSkpIHx8IFtdO1xuICAgICAgICAgICAgdmFyIHJlYWR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVkdWNlKHJlcXVpcmVzLCBmdW5jdGlvbiAoYSwgeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGEgJiYgcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eSh4KSk7XG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSkgJiYgIXJlc3VsdHMuaGFzT3duUHJvcGVydHkoayk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5yZXRyeSA9IGZ1bmN0aW9uKHRpbWVzLCB0YXNrLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgREVGQVVMVF9USU1FUyA9IDU7XG4gICAgICAgIHZhciBhdHRlbXB0cyA9IFtdO1xuICAgICAgICAvLyBVc2UgZGVmYXVsdHMgaWYgdGltZXMgbm90IHBhc3NlZFxuICAgICAgICBpZiAodHlwZW9mIHRpbWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHRhc2s7XG4gICAgICAgICAgICB0YXNrID0gdGltZXM7XG4gICAgICAgICAgICB0aW1lcyA9IERFRkFVTFRfVElNRVM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRpbWVzIGlzIGEgbnVtYmVyXG4gICAgICAgIHRpbWVzID0gcGFyc2VJbnQodGltZXMsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICB2YXIgd3JhcHBlZFRhc2sgPSBmdW5jdGlvbih3cmFwcGVkQ2FsbGJhY2ssIHdyYXBwZWRSZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgcmV0cnlBdHRlbXB0ID0gZnVuY3Rpb24odGFzaywgZmluYWxBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmllc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2soZnVuY3Rpb24oZXJyLCByZXN1bHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2soIWVyciB8fCBmaW5hbEF0dGVtcHQsIHtlcnI6IGVyciwgcmVzdWx0OiByZXN1bHR9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgd3JhcHBlZFJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2hpbGUgKHRpbWVzKSB7XG4gICAgICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUF0dGVtcHQodGFzaywgISh0aW1lcy09MSkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFzeW5jLnNlcmllcyhhdHRlbXB0cywgZnVuY3Rpb24oZG9uZSwgZGF0YSl7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGFbZGF0YS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAod3JhcHBlZENhbGxiYWNrIHx8IGNhbGxiYWNrKShkYXRhLmVyciwgZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgYSBjYWxsYmFjayBpcyBwYXNzZWQsIHJ1biB0aGlzIGFzIGEgY29udHJvbGwgZmxvd1xuICAgICAgICByZXR1cm4gY2FsbGJhY2sgPyB3cmFwcGVkVGFzaygpIDogd3JhcHBlZFRhc2tcbiAgICB9O1xuXG4gICAgYXN5bmMud2F0ZXJmYWxsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICBpZiAoIV9pc0FycmF5KHRhc2tzKSkge1xuICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IHRvIHdhdGVyZmFsbCBtdXN0IGJlIGFuIGFycmF5IG9mIGZ1bmN0aW9ucycpO1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgd3JhcEl0ZXJhdG9yID0gZnVuY3Rpb24gKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2god3JhcEl0ZXJhdG9yKG5leHQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICB3cmFwSXRlcmF0b3IoYXN5bmMuaXRlcmF0b3IodGFza3MpKSgpO1xuICAgIH07XG5cbiAgICB2YXIgX3BhcmFsbGVsID0gZnVuY3Rpb24oZWFjaGZuLCB0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgaWYgKF9pc0FycmF5KHRhc2tzKSkge1xuICAgICAgICAgICAgZWFjaGZuLm1hcCh0YXNrcywgZnVuY3Rpb24gKGZuLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgICAgICBmbihmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChudWxsLCBlcnIsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgZWFjaGZuLmVhY2goX2tleXModGFza3MpLCBmdW5jdGlvbiAoaywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0YXNrc1trXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5wYXJhbGxlbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKHsgbWFwOiBhc3luYy5tYXAsIGVhY2g6IGFzeW5jLmVhY2ggfSwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMucGFyYWxsZWxMaW1pdCA9IGZ1bmN0aW9uKHRhc2tzLCBsaW1pdCwgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKHsgbWFwOiBfbWFwTGltaXQobGltaXQpLCBlYWNoOiBfZWFjaExpbWl0KGxpbWl0KSB9LCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5zZXJpZXMgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge307XG4gICAgICAgIGlmIChfaXNBcnJheSh0YXNrcykpIHtcbiAgICAgICAgICAgIGFzeW5jLm1hcFNlcmllcyh0YXNrcywgZnVuY3Rpb24gKGZuLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgICAgICBmbihmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChudWxsLCBlcnIsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgYXN5bmMuZWFjaFNlcmllcyhfa2V5cyh0YXNrcyksIGZ1bmN0aW9uIChrLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHRhc2tzW2tdKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLml0ZXJhdG9yID0gZnVuY3Rpb24gKHRhc2tzKSB7XG4gICAgICAgIHZhciBtYWtlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBmbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tzW2luZGV4XS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZm4ubmV4dCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZuLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpbmRleCA8IHRhc2tzLmxlbmd0aCAtIDEpID8gbWFrZUNhbGxiYWNrKGluZGV4ICsgMSk6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbWFrZUNhbGxiYWNrKDApO1xuICAgIH07XG5cbiAgICBhc3luYy5hcHBseSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkoXG4gICAgICAgICAgICAgICAgbnVsbCwgYXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIHZhciBfY29uY2F0ID0gZnVuY3Rpb24gKGVhY2hmbiwgYXJyLCBmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHIgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGNiKSB7XG4gICAgICAgICAgICBmbih4LCBmdW5jdGlvbiAoZXJyLCB5KSB7XG4gICAgICAgICAgICAgICAgciA9IHIuY29uY2F0KHkgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBhc3luYy5jb25jYXQgPSBkb1BhcmFsbGVsKF9jb25jYXQpO1xuICAgIGFzeW5jLmNvbmNhdFNlcmllcyA9IGRvU2VyaWVzKF9jb25jYXQpO1xuXG4gICAgYXN5bmMud2hpbHN0ID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodGVzdCgpKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN5bmMud2hpbHN0KHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZG9XaGlsc3QgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIGl0ZXJhdG9yKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgIGlmICh0ZXN0LmFwcGx5KG51bGwsIGFyZ3MpKSB7XG4gICAgICAgICAgICAgICAgYXN5bmMuZG9XaGlsc3QoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy51bnRpbCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCF0ZXN0KCkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhc3luYy51bnRpbCh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmRvVW50aWwgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIGl0ZXJhdG9yKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgIGlmICghdGVzdC5hcHBseShudWxsLCBhcmdzKSkge1xuICAgICAgICAgICAgICAgIGFzeW5jLmRvVW50aWwoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5xdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgICAgIGlmIChjb25jdXJyZW5jeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwb3MsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgaWYgKCFxLnN0YXJ0ZWQpe1xuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICBpZiAocS5kcmFpbikge1xuICAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIF9lYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogbnVsbFxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIGlmIChwb3MpIHtcbiAgICAgICAgICAgICAgICBxLnRhc2tzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcS50YXNrcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHEuc2F0dXJhdGVkICYmIHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdvcmtlcnMgPSAwO1xuICAgICAgICB2YXIgcSA9IHtcbiAgICAgICAgICAgIHRhc2tzOiBbXSxcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5OiBjb25jdXJyZW5jeSxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogbnVsbCxcbiAgICAgICAgICAgIGVtcHR5OiBudWxsLFxuICAgICAgICAgICAgZHJhaW46IG51bGwsXG4gICAgICAgICAgICBzdGFydGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBhdXNlZDogZmFsc2UsXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtpbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcS5kcmFpbiA9IG51bGw7XG4gICAgICAgICAgICAgIHEudGFza3MgPSBbXTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bnNoaWZ0OiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCB0cnVlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghcS5wYXVzZWQgJiYgd29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS50YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhc2sgPSBxLnRhc2tzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChxLmVtcHR5ICYmIHEudGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd29ya2VycyArPSAxO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YXNrLmNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5jYWxsYmFjay5hcHBseSh0YXNrLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHEuZHJhaW4gJiYgcS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcS5wcm9jZXNzKCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IG9ubHlfb25jZShuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgd29ya2VyKHRhc2suZGF0YSwgY2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXJzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlkbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAocS5wYXVzZWQgPT09IHRydWUpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChxLnBhdXNlZCA9PT0gZmFsc2UpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcbiAgICBcbiAgICBhc3luYy5wcmlvcml0eVF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIF9jb21wYXJlVGFza3MoYSwgYil7XG4gICAgICAgICAgcmV0dXJuIGEucHJpb3JpdHkgLSBiLnByaW9yaXR5O1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gX2JpbmFyeVNlYXJjaChzZXF1ZW5jZSwgaXRlbSwgY29tcGFyZSkge1xuICAgICAgICAgIHZhciBiZWcgPSAtMSxcbiAgICAgICAgICAgICAgZW5kID0gc2VxdWVuY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgICB3aGlsZSAoYmVnIDwgZW5kKSB7XG4gICAgICAgICAgICB2YXIgbWlkID0gYmVnICsgKChlbmQgLSBiZWcgKyAxKSA+Pj4gMSk7XG4gICAgICAgICAgICBpZiAoY29tcGFyZShpdGVtLCBzZXF1ZW5jZVttaWRdKSA+PSAwKSB7XG4gICAgICAgICAgICAgIGJlZyA9IG1pZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGVuZCA9IG1pZCAtIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiZWc7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgaWYgKCFxLnN0YXJ0ZWQpe1xuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICBpZiAocS5kcmFpbikge1xuICAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIF9lYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IHByaW9yaXR5LFxuICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogbnVsbFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoX2JpbmFyeVNlYXJjaChxLnRhc2tzLCBpdGVtLCBfY29tcGFyZVRhc2tzKSArIDEsIDAsIGl0ZW0pO1xuXG4gICAgICAgICAgICAgIGlmIChxLnNhdHVyYXRlZCAmJiBxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG5vcm1hbCBxdWV1ZVxuICAgICAgICB2YXIgcSA9IGFzeW5jLnF1ZXVlKHdvcmtlciwgY29uY3VycmVuY3kpO1xuICAgICAgICBcbiAgICAgICAgLy8gT3ZlcnJpZGUgcHVzaCB0byBhY2NlcHQgc2Vjb25kIHBhcmFtZXRlciByZXByZXNlbnRpbmcgcHJpb3JpdHlcbiAgICAgICAgcS5wdXNoID0gZnVuY3Rpb24gKGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIFJlbW92ZSB1bnNoaWZ0IGZ1bmN0aW9uXG4gICAgICAgIGRlbGV0ZSBxLnVuc2hpZnQ7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLmNhcmdvID0gZnVuY3Rpb24gKHdvcmtlciwgcGF5bG9hZCkge1xuICAgICAgICB2YXIgd29ya2luZyAgICAgPSBmYWxzZSxcbiAgICAgICAgICAgIHRhc2tzICAgICAgID0gW107XG5cbiAgICAgICAgdmFyIGNhcmdvID0ge1xuICAgICAgICAgICAgdGFza3M6IHRhc2tzLFxuICAgICAgICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogbnVsbCxcbiAgICAgICAgICAgIGVtcHR5OiBudWxsLFxuICAgICAgICAgICAgZHJhaW46IG51bGwsXG4gICAgICAgICAgICBkcmFpbmVkOiB0cnVlLFxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfZWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNhcmdvLmRyYWluZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmdvLnNhdHVyYXRlZCAmJiB0YXNrcy5sZW5ndGggPT09IHBheWxvYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmdvLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGNhcmdvLnByb2Nlc3MpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIHByb2Nlc3MoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdvcmtpbmcpIHJldHVybjtcbiAgICAgICAgICAgICAgICBpZiAodGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGNhcmdvLmRyYWluICYmICFjYXJnby5kcmFpbmVkKSBjYXJnby5kcmFpbigpO1xuICAgICAgICAgICAgICAgICAgICBjYXJnby5kcmFpbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciB0cyA9IHR5cGVvZiBwYXlsb2FkID09PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGFza3Muc3BsaWNlKDAsIHBheWxvYWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0YXNrcy5zcGxpY2UoMCwgdGFza3MubGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHZhciBkcyA9IF9tYXAodHMsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmRhdGE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZihjYXJnby5lbXB0eSkgY2FyZ28uZW1wdHkoKTtcbiAgICAgICAgICAgICAgICB3b3JraW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB3b3JrZXIoZHMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgd29ya2luZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICBfZWFjaCh0cywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jYWxsYmFjay5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcHJvY2VzcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxlbmd0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JraW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gY2FyZ287XG4gICAgfTtcblxuICAgIHZhciBfY29uc29sZV9mbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY29uc29sZVtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2VhY2goYXJncywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlW25hbWVdKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XSkpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgYXN5bmMubG9nID0gX2NvbnNvbGVfZm4oJ2xvZycpO1xuICAgIGFzeW5jLmRpciA9IF9jb25zb2xlX2ZuKCdkaXInKTtcbiAgICAvKmFzeW5jLmluZm8gPSBfY29uc29sZV9mbignaW5mbycpO1xuICAgIGFzeW5jLndhcm4gPSBfY29uc29sZV9mbignd2FybicpO1xuICAgIGFzeW5jLmVycm9yID0gX2NvbnNvbGVfZm4oJ2Vycm9yJyk7Ki9cblxuICAgIGFzeW5jLm1lbW9pemUgPSBmdW5jdGlvbiAoZm4sIGhhc2hlcikge1xuICAgICAgICB2YXIgbWVtbyA9IHt9O1xuICAgICAgICB2YXIgcXVldWVzID0ge307XG4gICAgICAgIGhhc2hlciA9IGhhc2hlciB8fCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBtZW1vaXplZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGtleSBpbiBtZW1vKSB7XG4gICAgICAgICAgICAgICAgYXN5bmMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5IGluIHF1ZXVlcykge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0gPSBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XSA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgdmFyIHEgPSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcVtpXS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbWVtb2l6ZWQubWVtbyA9IG1lbW87XG4gICAgICAgIG1lbW9pemVkLnVubWVtb2l6ZWQgPSBmbjtcbiAgICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgIH07XG5cbiAgICBhc3luYy51bm1lbW9pemUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAoZm4udW5tZW1vaXplZCB8fCBmbikuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGFzeW5jLnRpbWVzID0gZnVuY3Rpb24gKGNvdW50LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNvdW50ZXIgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb3VudGVyLnB1c2goaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFzeW5jLm1hcChjb3VudGVyLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy50aW1lc1NlcmllcyA9IGZ1bmN0aW9uIChjb3VudCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjb3VudGVyID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY291bnRlci5wdXNoKGkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhc3luYy5tYXBTZXJpZXMoY291bnRlciwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VxID0gZnVuY3Rpb24gKC8qIGZ1bmN0aW9ucy4uLiAqLykge1xuICAgICAgICB2YXIgZm5zID0gYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIGFzeW5jLnJlZHVjZShmbnMsIGFyZ3MsIGZ1bmN0aW9uIChuZXdhcmdzLCBmbiwgY2IpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBuZXdhcmdzLmNvbmNhdChbZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgICAgICAgICBjYihlcnIsIG5leHRhcmdzKTtcbiAgICAgICAgICAgICAgICB9XSkpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoYXQsIFtlcnJdLmNvbmNhdChyZXN1bHRzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY29tcG9zZSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgIHJldHVybiBhc3luYy5zZXEuYXBwbHkobnVsbCwgQXJyYXkucHJvdG90eXBlLnJldmVyc2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuXG4gICAgdmFyIF9hcHBseUVhY2ggPSBmdW5jdGlvbiAoZWFjaGZuLCBmbnMgLyphcmdzLi4uKi8pIHtcbiAgICAgICAgdmFyIGdvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHJldHVybiBlYWNoZm4oZm5zLCBmdW5jdGlvbiAoZm4sIGNiKSB7XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncy5jb25jYXQoW2NiXSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgICAgICAgICByZXR1cm4gZ28uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZ287XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGFzeW5jLmFwcGx5RWFjaCA9IGRvUGFyYWxsZWwoX2FwcGx5RWFjaCk7XG4gICAgYXN5bmMuYXBwbHlFYWNoU2VyaWVzID0gZG9TZXJpZXMoX2FwcGx5RWFjaCk7XG5cbiAgICBhc3luYy5mb3JldmVyID0gZnVuY3Rpb24gKGZuLCBjYWxsYmFjaykge1xuICAgICAgICBmdW5jdGlvbiBuZXh0KGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm4obmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dCgpO1xuICAgIH07XG5cbiAgICAvLyBOb2RlLmpzXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gYXN5bmM7XG4gICAgfVxuICAgIC8vIEFNRCAvIFJlcXVpcmVKU1xuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBpbmNsdWRlZCBkaXJlY3RseSB2aWEgPHNjcmlwdD4gdGFnXG4gICAgZWxzZSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBhc3luYztcbiAgICB9XG5cbn0oKSk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IHRydWU7XG4gICAgdmFyIGN1cnJlbnRRdWV1ZTtcbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgdmFyIGkgPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW2ldKCk7XG4gICAgICAgIH1cbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xufVxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICBxdWV1ZS5wdXNoKGZ1bik7XG4gICAgaWYgKCFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuL1ZpZXdCYXNlLmNvZmZlZVwiXG5TY3JvbGxCYXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TY3JvbGxCYXIuY29mZmVlXCJcbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcbmNsb3VkcyA9IHJlcXVpcmUgJy4uL3BhZ2VzL2FuaW1hdGlvbnMvY2xvdWRzLmNvZmZlZSdcblxuY2xhc3MgQW5pbWF0aW9uQmFzZSBleHRlbmRzIFZpZXdCYXNlXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIHN1cGVyKGVsKVxuICAgICAgICBAdGltZWxpbmUgPSBudWxsXG4gICAgICAgIEB0b3VjaFkgPSAwXG4gICAgICAgIEB0b3VjaFlMYXN0ID0gMFxuICAgICAgICBAZ2xvYmFsU2Nyb2xsQW1vdW50ID0gaWYgQGlzVGFibGV0IHRoZW4gLjUgZWxzZSAxXG4gICAgICAgIEBwcmV2U2Nyb2xsVG8gPSAwXG4gICAgICAgIEBwcmV2RGVsdGEgPSAwXG4gICAgICAgIEBjdXJyZW50UHJvZ3Jlc3MgPSAwXG4gICAgICAgIEB0b3RhbEFuaW1hdGlvblRpbWUgPSAxMFxuICAgICAgICBAc21vb3RoTXVsdGlwbGllciA9IDVcbiAgICAgICAgQG5hdlRpbWVyID0gbnVsbFxuICAgICAgICBAdmlkZW8gPSBudWxsXG4gICAgICAgIEBpbmxpbmVWaWRlbyA9IG51bGxcbiAgICAgICAgQGlzVGFibGV0ID0gJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIGlmICFAaXNQaG9uZSAgXG4gICAgICAgICAgICBAcmVzZXRUaW1lbGluZSgpXG4gICAgICAgICAgICBAdG9nZ2xlVG91Y2hNb3ZlKClcbiAgICAgICAgICAgIEBvblJlc2l6ZSgpXG4gICAgICAgICAgICBAdXBkYXRlVGltZWxpbmUoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG4gICAgICAgIEBoZWFkZXIgPSBuZXcgSGVhZGVyQW5pbWF0aW9uIFxuICAgICAgICAgICAgZWw6J2hlYWRlcidcblxuICAgIFxuXG5cbiAgICB0b2dnbGVUb3VjaE1vdmU6ICgpID0+XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZiAnc2Nyb2xsJyAsIEBvblNjcm9sbFxuICAgICAgICBcbiAgICAgICAgQHNjcm9sbCA9XG4gICAgICAgICAgICBwb3NpdGlvbjogMFxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAwXG4gICAgICAgICQoZG9jdW1lbnQpLnNjcm9sbCBAb25TY3JvbGxcbiAgICAgICAgQG9uU2Nyb2xsKClcblxuXG4gICAgZ2V0U2Nyb2xsYWJsZUFyZWE6IC0+XG4gICAgICAgIE1hdGguYWJzKCQoXCIjY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gQHN0YWdlSGVpZ2h0KVxuICAgIFxuICAgIGdldFNjcm9sbFRvcDogLT5cbiAgICAgICAgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkgLyBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAgICAgXG4gICAgXG4gICAgXG4gICAgc2V0U2Nyb2xsVG9wOiAocGVyKSAtPiAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlclxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8gMCAsIHBvc1xuXG5cbiAgICBzZXREcmFnZ2FibGVQb3NpdGlvbjogKHBlcikgLT4gICAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlciAgICAgICAgXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkKFwiI2NvbnRlbnRcIikgLFxuICAgICAgICAgICAgeTogLXBvcyBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgb25TY3JvbGw6IChlKSA9PlxuICAgICAgICBpZiAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSA+IDMwXG4gICAgICAgICAgICAkKCcuY2lyYy1idG4td3JhcHBlcicpLmFkZENsYXNzICdpbnZpc2libGUnXG4gICAgICAgICAgICBcbiAgICAgICAgQHNjcm9sbC5wb3NpdGlvbiA9IEBnZXRTY3JvbGxUb3AoKVxuICAgICAgICBAc2Nyb2xsLnNjcm9sbFRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpICAgICAgICBcbiAgICAgICAgXG5cbiAgICBvbkRyYWc6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEBzY3JvbGwucG9zaXRpb24gPSBNYXRoLmFicyBAc2Nyb2xsLnkgLyAgQGdldFNjcm9sbGFibGVBcmVhKClcbiAgICAgICAgQHNjcm9sbC5zY3JvbGxUb3AgPSAtQHNjcm9sbC55XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpXG5cblxuICAgIG9uUmVzaXplOiA9PlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIGlmICFAaXNUYWJsZXRcbiAgICAgICAgICAgIEByZXNldFRpbWVsaW5lKClcbiAgICAgICAgICAgIFxuICAgICAgICBAY2VudGVyT2Zmc2V0ID0gKEBzdGFnZUhlaWdodCAqIC42NjY3KVxuICAgICAgICBpZiBAc2Nyb2xsP1xuICAgICAgICAgICAgcG9zID0gQHNjcm9sbC5wb3NpdGlvbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHRvZ2dsZVRvdWNoTW92ZSgpXG4gICAgICAgICAgICBpZiAhQGlzVGFibGV0XG4gICAgICAgICAgICAgICAgQHNldFNjcm9sbFRvcChwb3MpXG4gICAgICAgICAgICBcblxuICAgIHJlc2V0VGltZWxpbmU6ID0+XG4gICAgICAgIEB0aW1lbGluZSA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICBAdHJpZ2dlcnMgPSBbXVxuICAgICAgICBAcGFyYWxsYXggPSBbXVxuXG4gICAgICAgICQoJ1tkYXRhLWNsb3VkXScpLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRlbCA9ICQodClcbiAgICAgICAgICAgICRjbG9zZXN0Q29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKVxuICAgICAgICAgICAgaW5pdFBvcyA9ICRjbG9zZXN0Q29udGFpbmVyLmRhdGEoKS5jbG91ZENvbnRhaW5lci5pbml0UG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xvdWRGdW5jdGlvbiA9IGNsb3Vkc1xuICAgICAgICAgICAgICAgICRlbDokZWxcblxuICAgICAgICAgICAgaWYgaW5pdFBvcyBcbiAgICAgICAgICAgICAgICBjbG91ZEZ1bmN0aW9uKGluaXRQb3MpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAcGFyYWxsYXgucHVzaCBjbG91ZEZ1bmN0aW9uXG5cbiAgICB1cGRhdGVUaW1lbGluZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBoZWFkZXIuYW5pbWF0ZUhlYWRlcihAc2Nyb2xsLnNjcm9sbFRvcClcblxuICAgICAgICBmb3IgdCBpbiBAdHJpZ2dlcnNcbiAgICAgICAgICAgIGlmIEBzY3JvbGwuc2Nyb2xsVG9wID4gdC5vZmZzZXQgLSBAY2VudGVyT2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBsYXkoKVxuICAgICAgICAgICAgZWxzZSBpZiBAc2Nyb2xsLnNjcm9sbFRvcCArIEBzdGFnZUhlaWdodCA8IHQub2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBhdXNlZCh0cnVlKVxuICAgICAgICAgICAgICAgIHQuYS5zZWVrKDApXG5cblxuICAgICAgICBmb3IgcCBpbiBAcGFyYWxsYXhcbiAgICAgICAgICAgIHAoQHNjcm9sbC5wb3NpdGlvbilcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25CYXNlXG4iLCJjbGFzcyBQbHVnaW5CYXNlIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIEAkZWwgPSBpZiBvcHRzLmVsPyB0aGVuICQgb3B0cy5lbFxuXG4gICAgICAgIEBpbml0aWFsaXplKG9wdHMpXG5cblxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgQGFkZEV2ZW50cygpXG5cbiAgICBhZGRFdmVudHM6IC0+XG5cblxuXG4gICAgcmVtb3ZlRXZlbnRzOiAtPlxuXG5cbiAgICBkZXN0cm95OiAtPlxuICAgICAgICBAcmVtb3ZlRXZlbnRzKClcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsdWdpbkJhc2VcblxuIiwiXG5TaGFyZXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TaGFyZXIuY29mZmVlXCIgXG5cblxuY2xhc3MgVmlld0Jhc2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cblxuICAgICAgICBAJGVsID0gJChlbClcbiAgICAgICAgQGlzVGFibGV0ID0gJChcImh0bWxcIikuaGFzQ2xhc3MoXCJ0YWJsZXRcIilcbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG4gICAgICAgIEBjZG5Sb290ID0gJCgnYm9keScpLmRhdGEoJ2NkbicpIG9yIFwiL1wiXG4gICAgICAgICQod2luZG93KS5vbiBcInJlc2l6ZS5hcHBcIiAsIEBvblJlc2l6ZVxuXG4gICAgICAgIEBzdGFnZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICBAc3RhZ2VXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG4gICAgICAgIEBtb3VzZVggPSAwXG4gICAgICAgIEBtb3VzZVkgPSAwXG5cbiAgICAgICAgI0BkZWxlZ2F0ZUV2ZW50cyhAZ2VuZXJhdGVFdmVudHMoKSlcbiAgICAgICAgQGluaXRpYWxpemUoKVxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAaW5pdENvbXBvbmVudHMoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG5cbiAgICBvblJlc2l6ZTogPT5cbiAgICAgICAgQHN0YWdlSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICAgIEBzdGFnZVdpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblxuXG4gICAgZ2VuZXJhdGVFdmVudHM6IC0+XG4gICAgICAgIHJldHVybiB7fVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld0Jhc2VcbiIsIkJhc2ljT3ZlcmxheSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSdcblN2Z0luamVjdCA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvU3ZnSW5qZWN0LmNvZmZlZSdcblxuXG5cbmlmIHdpbmRvdy5jb25zb2xlIGlzIHVuZGVmaW5lZCBvciB3aW5kb3cuY29uc29sZSBpcyBudWxsXG4gIHdpbmRvdy5jb25zb2xlID1cbiAgICBsb2c6IC0+XG4gICAgd2FybjogLT5cbiAgICBmYXRhbDogLT5cblxuXG5cbiQoZG9jdW1lbnQpLnJlYWR5IC0+XG4gICAgIyQoJy5zdmctaW5qZWN0Jykuc3ZnSW5qZWN0KClcbiAgICAjbmV3IFN2Z0luamVjdCBcIi5zdmctaW5qZWN0XCJcbiAgICBcbiAgICBiYXNpY092ZXJsYXlzID0gbmV3IEJhc2ljT3ZlcmxheVxuICAgICAgICBlbDogJCgnI2NvbnRlbnQnKVxuXG5cbiAgICAkKCcuc2Nyb2xsdG8nKS5jbGljayAtPlxuICAgICAgIHQgPSAkKHRoaXMpLmRhdGEoJ3RhcmdldCcpXG4gICAgICAgJCgnYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjJyt0KS5vZmZzZXQoKS50b3AgLSA3MCAjIDcwIGZvciB0aGUgY29sbGFwc2VkIGhlYWRlclxuICAgICAgICB9KTtcblxuICAgICNpZiB3aW5kb3cuZGRscz9cbiAgICAjIGNvbnNvbGUubG9nICdjbGlja3knXG4gICAgJCh3aW5kb3cpLmNsaWNrIC0+XG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgdCkgLT5cbiAgICAgICAgICAgICAgICBpZiB0LmlzT3BlbiBhbmQgbm90IHQuaXNIb3ZlcmVkXG4gICAgICAgICAgICAgICAgICAgIHQuY2xvc2VNZW51KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAkKCdbZGF0YS1kZXB0aF0nKS5lYWNoIC0+XG4gICAgICAgICRlbCA9ICQoQClcbiAgICAgICAgZGVwdGggPSAkZWwuZGF0YSgpLmRlcHRoXG4gICAgICAgIFxuICAgICAgICAkZWwuY3NzKCd6LWluZGV4JywgZGVwdGgpXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkZWwgLCBcbiAgICAgICAgICAgIHo6IGRlcHRoICogMTBcblxuXG5cbiAgICAkKCdib2R5Jykub24gJ0RPTU5vZGVJbnNlcnRlZCcsICAtPlxuICAgICAgICAkKCdhJykuZWFjaCAtPiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSAkKEApLmF0dHIoJ2hyZWYnKVxuICAgICAgICAgICAgaWYgaHJlZj9cbiAgICAgICAgICAgICAgICBocmVmID0gaHJlZi50cmltKClcbiAgICAgICAgICAgICAgICBpZiBocmVmLmluZGV4T2YoJ2h0dHA6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignaHR0cHM6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignLnBkZicpIGlzIChocmVmLmxlbmd0aCAtIDQpXG4gICAgICAgICAgICAgICAgICAgICQoQCkuYXR0cigndGFyZ2V0JywgJ19ibGFuaycpXG5cblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VlbnRlcicsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLjA1LFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VsZWF2ZScsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJyNqb2JzLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXIgbGknKS5vbignbW91c2VlbmV0ZXInLCAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnaGVsbG8nXG4gICAgKVxuXG5cbiMgdGhpcyBpcyBzaGl0dHksIGJ1dCBpdCdzIG15IG9ubHkgd29ya2Fyb3VuZCBmb3IgdGhlIGNsaXBwaW5nIGlzc3VlIChDRi0xNzEpXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSAtPlxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlIGlzICdjb21wbGV0ZScpXG4gICAgICAgIHNldFRpbWVvdXQoLT5cbiAgICAgICAgICAgICQoJy5xdW90ZScpLmFkZENsYXNzKCdrZWVwaXRhaHVuZHJlZCcpXG4gICAgICAgICwgMjAwKVxuIiwiQW5pbWF0aW9uQmFzZSA9IHJlcXVpcmUgXCIuLi9hYnN0cmFjdC9BbmltYXRpb25CYXNlLmNvZmZlZVwiXG5QYXJrc0xpc3QgPSByZXF1aXJlICcuLi9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUnXG5EcmFnZ2FibGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSdcbkZhZGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9GYWRlR2FsbGVyeS5jb2ZmZWUnXG5UaWNrZXJMaXN0ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9UaWNrZXJMaXN0LmNvZmZlZSdcbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcbkZyYW1lQW5pbWF0aW9uID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9jb2FzdGVycy9GcmFtZUFuaW1hdGlvbi5jb2ZmZWUnXG5SZXNpemVCdXR0b25zID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9SZXNpemVCdXR0b25zLmNvZmZlZSdcbkJhc2ljT3ZlcmxheSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSdcbmFuaW1hdGlvbnMgPSByZXF1aXJlICcuL2FuaW1hdGlvbnMvaG9tZS5jb2ZmZWUnXG5nbG9iYWxBbmltYXRpb25zID0gcmVxdWlyZSAnLi9hbmltYXRpb25zL2dsb2JhbC5jb2ZmZWUnXG5hc3luYyA9IHJlcXVpcmUoJ2FzeW5jJylcblxuICAgICAgICBcblxuY2xhc3MgSG9tZVBhZ2UgZXh0ZW5kcyBBbmltYXRpb25CYXNlXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIEB0b3RhbEFuaW1hdGlvblRpbWUgPSAyNVxuICAgICAgICBzdXBlcihlbClcbiAgICAgICAgXG4gICAgaW5pdENvYXN0ZXJzOiAtPlxuICAgICAgICBjZG5Sb290ID0gQGNkblJvb3RcbiAgICAgICAgaWYgIUBpc1Bob25lXG4gICAgICAgICAgICBjb2FzdGVyVGFza3MgPSBbXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAhQGlzVGFibGV0XG4gICAgICAgICAgICAgICAgYzEgPSBuZXcgRnJhbWVBbmltYXRpb25cbiAgICAgICAgICAgICAgICAgICAgaWQ6XCJob21lLWNvYXN0ZXItMS1hXCJcbiAgICAgICAgICAgICAgICAgICAgZWw6XCIjaG9tZS1zZWN0aW9uMVwiXG4gICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6IFwiI3tjZG5Sb290fWNvYXN0ZXJzL1wiXG4gICAgICAgICAgICAgICAgICAgIHVybDogXCJzaG90LTEvZGF0YS5qc29uXCJcbiAgICAgICAgICAgICAgICAgICAgZGVwdGg6MjBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjMiA9IG5ldyBGcmFtZUFuaW1hdGlvblxuICAgICAgICAgICAgICAgICAgICBpZDpcImhvbWUtY29hc3Rlci0xLWJcIlxuICAgICAgICAgICAgICAgICAgICBlbDpcIiNob21lLXNlY3Rpb24xXCJcbiAgICAgICAgICAgICAgICAgICAgYmFzZVVybDogXCIje2NkblJvb3R9Y29hc3RlcnMvXCJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcInNob3QtNS9kYXRhLmpzb25cIlxuICAgICAgICAgICAgICAgICAgICBkZXB0aDoyMFxuXG4gICAgICAgICAgICAgICAgYzMgPSBuZXcgRnJhbWVBbmltYXRpb25cbiAgICAgICAgICAgICAgICAgICAgaWQ6XCJob21lLWNvYXN0ZXItMy1hXCJcbiAgICAgICAgICAgICAgICAgICAgZWw6XCIjaG9tZS1zZWN0aW9uM1wiXG4gICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6IFwiI3tjZG5Sb290fWNvYXN0ZXJzL1wiXG4gICAgICAgICAgICAgICAgICAgIHVybDogXCJzaG90LTMvZGF0YS5qc29uXCJcblxuICAgICAgICAgICAgICAgIGM0ID0gbmV3IEZyYW1lQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlkOlwiaG9tZS1jb2FzdGVyLTMtYlwiXG4gICAgICAgICAgICAgICAgICAgIGVsOlwiI2hvbWUtc2VjdGlvbjNcIlxuICAgICAgICAgICAgICAgICAgICBiYXNlVXJsOiBcIiN7Y2RuUm9vdH1jb2FzdGVycy9cIlxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwic2hvdC00L2RhdGEuanNvblwiXG5cbiAgICAgICAgICAgICAgICBjMS5hc3luYyA9IC0+XG4gICAgICAgICAgICAgICAgICAgIGNvYXN0ZXJUYXNrcy5wdXNoIChkb25lKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgYzIuYXN5bmMgPSBkb25lXG4gICAgICAgICAgICAgICAgICAgICAgICBjMi5sb2FkRnJhbWVzKClcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgY29hc3RlclRhc2tzLnB1c2ggKGRvbmUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjMy5hc3luYyA9IGRvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGMzLmxvYWRGcmFtZXMoKVxuXG4gICAgICAgICAgICAgICAgICAgIGNvYXN0ZXJUYXNrcy5wdXNoIChkb25lKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgYzQuYXN5bmMgPSBkb25lXG4gICAgICAgICAgICAgICAgICAgICAgICBjNC5sb2FkRnJhbWVzKClcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMucGFyYWxsZWwgY29hc3RlclRhc2tzICwgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgJ2NvYXN0ZXJzIGxvYWRlZCdcbiAgICBcbiAgICBcbiAgICAgICAgICAgICAgICBjMS5sb2FkRnJhbWVzKClcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGMyID0gbmV3IEZyYW1lQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlkOlwiaG9tZS1jb2FzdGVyLTEtYlwiXG4gICAgICAgICAgICAgICAgICAgIGVsOlwiI2hvbWUtc2VjdGlvbjFcIlxuICAgICAgICAgICAgICAgICAgICBiYXNlVXJsOiBcIiN7Y2RuUm9vdH1jb2FzdGVycy9cIlxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwic2hvdC01L2RhdGEuanNvblwiXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoOjIwXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGMzID0gbmV3IEZyYW1lQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlkOlwiaG9tZS1jb2FzdGVyLTMtYVwiXG4gICAgICAgICAgICAgICAgICAgIGVsOlwiI2hvbWUtc2VjdGlvbjNcIlxuICAgICAgICAgICAgICAgICAgICBiYXNlVXJsOiBcIiN7Y2RuUm9vdH1jb2FzdGVycy9cIlxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwic2hvdC0zL2RhdGEuanNvblwiXG5cbiAgICAgICAgICAgICAgICBjMi5hc3luYyA9IC0+XG4gICAgICAgICAgICAgICAgICAgIGNvYXN0ZXJUYXNrcy5wdXNoIChkb25lKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgYzMuYXN5bmMgPSBkb25lXG4gICAgICAgICAgICAgICAgICAgICAgICBjMy5sb2FkRnJhbWVzKClcblxuICAgICAgICAgICAgICAgICAgICBhc3luYy5wYXJhbGxlbCBjb2FzdGVyVGFza3MgLCAtPlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyAnY29hc3RlcnMgbG9hZGVkJ1xuXG5cbiAgICAgICAgICAgICAgICBjMi5sb2FkRnJhbWVzKClcbiAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIGluaXRDb21wb25lbnRzOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICAgICAgQGluaXRDb2FzdGVycygpXG5cbiAgICAgICAgaWYgIUBpc1Bob25lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNlYXNvbmFsR2FsbGVyeSA9IG5ldyBGYWRlR2FsbGVyeVxuICAgICAgICAgICAgICAgIGVsOiBcIiNzZWFzb25hbC12aWRlby1nYWxsZXJ5XCJcblxuICAgIFxuICAgICAgICAgICAgZ3JvdXBzID0gbmV3IERyYWdnYWJsZUdhbGxlcnlcbiAgICAgICAgICAgICAgICBlbDpcIiNncm91cC1zYWxlcyAjc2VsZWN0LXRlc3RpbW9ueVwiXG4gICAgICAgICAgICAgICAgYWNyb3NzOiAxXG4gICAgXG4gICAgICAgICAgICBhY2NvbW1vZGF0aW9ucyA9IG5ldyBEcmFnZ2FibGVHYWxsZXJ5XG4gICAgICAgICAgICAgICAgZWw6IFwiI2FjY29tb2RhdGlvbnMtdmlkZW8tY2Fyb3VzZWxcIlxuICAgICAgICAgICAgICAgIGFjcm9zczogMVxuXG4gICAgICAgICAgICBhY2NvbW1vZGF0aW9uc0dhbGxlcnkgPSBuZXcgRmFkZUdhbGxlcnlcbiAgICAgICAgICAgICAgICBlbDogXCIjYWNjb21tb2RhdGlvbnMtY2Fyb3VzZWxcIlxuXG4gICAgICAgICAgICBwYXJrc0dhbGxlcnkgPSBuZXcgRmFkZUdhbGxlcnlcbiAgICAgICAgICAgICAgICBlbDogXCIjb3VyLXBhcmtzLWdhbGxlcnlcIlxuXG4gICAgICAgICAgICBwYXJrcyA9IG5ldyBQYXJrc0xpc3RcbiAgICAgICAgICAgICAgICBlbDpcIiNvdXItcGFya3NcIlxuICAgICAgICAgICAgICAgIGdhbGxlcnk6IHBhcmtzR2FsbGVyeVxuXG4gICAgICAgICAgICBwYXJrc0dhbGxlcnkuZ290byBwYXJrcy5zZWxlY3RlZExvZ28oKSwgdHJ1ZVxuICAgICAgICAgICAgcGFya3NHYWxsZXJ5LnBhcmtMaXN0ID0gcGFya3NcbiAgICAgICAgICAgIHBhcmtzR2FsbGVyeS4kdGFyZ2V0ID0gJCgnI291ci1wYXJrcycpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlc2l6ZWJ1dHRvbnMgPSBuZXcgUmVzaXplQnV0dG9uc1xuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmtzID0gbmV3IERyYWdnYWJsZUdhbGxlcnlcbiAgICAgICAgICAgICAgICBlbDpcIiNvdXItcGFya3NcIlxuICAgICAgICAgICAgICAgIGFjcm9zczogMVxuXG5cbiAgICAgICAgICAgIGpvYnMgPSBuZXcgRHJhZ2dhYmxlR2FsbGVyeVxuICAgICAgICAgICAgICAgIGVsOlwiI2pvYnMtc2VjdGlvblwiXG4gICAgICAgICAgICAgICAgYWNyb3NzOiAxXG5cbiAgICAgICAgICAgIGdyb3VwcyA9IG5ldyBEcmFnZ2FibGVHYWxsZXJ5XG4gICAgICAgICAgICAgICAgZWw6XCIjZ3JvdXAtc2FsZXMgI3NlbGVjdC10ZXN0aW1vbnlcIlxuICAgICAgICAgICAgICAgIGFjcm9zczogMVxuICAgIFxuICAgICAgICAgICAgYWNjb21tb2RhdGlvbnMgPSBuZXcgRHJhZ2dhYmxlR2FsbGVyeVxuICAgICAgICAgICAgICAgIGVsOiBcIiNhY2NvbW9kYXRpb25zLXZpZGVvLWNhcm91c2VsXCJcbiAgICAgICAgICAgICAgICBhY3Jvc3M6IDFcblxuICAgICAgICAgICAgc2Vhc29uYWxHYWxsZXJ5ID0gbmV3IEZhZGVHYWxsZXJ5XG4gICAgICAgICAgICAgICAgZWw6IFwiI3NlYXNvbmFsLXZpZGVvLWdhbGxlcnlcIlxuXG4gICAgICAgICAgICBhY2NvbW1vZGF0aW9uc0dhbGxlcnkgPSBuZXcgRmFkZUdhbGxlcnlcbiAgICAgICAgICAgICAgICBlbDogXCIjYWNjb21tb2RhdGlvbnMtY2Fyb3VzZWxcIlxuXG4gICAgICAgICAgXG4gICAgICAgIHRpY2tlciA9IG5ldyBUaWNrZXJMaXN0XG4gICAgICAgICAgICAgICAgZWw6XCIjc3RvY2stdGlja2VyXCJcblxuXG5cbiAgICByZXNldFRpbWVsaW5lOiA9PlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICBpZiAhQGlzUGhvbmUgICAgICAgIFxuICAgICAgICAgICAgQHRyaWdnZXJzLnB1c2ggYW5pbWF0aW9ucy5zY3JvbGxDaXJjbGUoKVxuICAgICAgICAgICAgQHRyaWdnZXJzLnB1c2ggYW5pbWF0aW9ucy5ncm91cHMoKVxuICAgICAgICAgICAgQHRyaWdnZXJzLnB1c2ggYW5pbWF0aW9ucy5hY2NvbW9kYXRpb25zKClcbiAgICAgICAgICAgIEB0cmlnZ2Vycy5wdXNoIGFuaW1hdGlvbnMuc2Vhc29uYWwoKVxuXG4gICAgICAgICAgICBpZiAhQGlzVGFibGV0XG4gICAgICAgICAgICAgICAgIyMjIFJlbW92ZWQgdGhlc2UgYW5pbWF0aW9ucyBmcm9tIGlwYWQgc2luY2UgdGhleSB3ZXJlIGNob3BweSAjIyNcbiAgICAgICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnBhcmtzKClcbiAgICAgICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLmpvYnMoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSG9tZVBhZ2VcblxuXG4iLCJcbmNsb3Vkc09uVXBkYXRlID0gKGVsLCBkdXJhdGlvbikgLT5cbiAgICB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgXG4gICAgVHdlZW5NYXguc2V0IGVsLFxuICAgICAgICB4OiAtMjA1MFxuICAgICAgICBcbiAgICBUd2Vlbk1heC50byBlbCwgZHVyYXRpb24gLCBcbiAgICAgICAgeDogd2luZG93V2lkdGhcbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgIGNsb3Vkc09uVXBkYXRlIGVsICwgZHVyYXRpb25cbiAgICAgICAgXG5cblxuc2V0Qm9iaW5nID0gKCRlbCAsIGR1cixkZWxheSkgLT5cbiAgICBcbiAgICBAaXNUYWJsZXQgPSAkKCdodG1sJykuaGFzQ2xhc3MgJ3RhYmxldCdcbiAgICB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIFxuICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoID4gNzY3ICYmICFAaXNUYWJsZXRcblxuIyAgICAgICAgZCA9ICgod2luZG93LmlubmVyV2lkdGggKyAxNTUwKSAvIHdpbmRvdy5pbm5lcldpZHRoKSAqIDE4MFxuICAgICAgICBkID0gMzAwIC0gKCRlbC5kYXRhKCdjbG91ZCcpLnNwZWVkICogMjUwKVxuICAgICAgICBcbiAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgZHVyICwgXG4gICAgICAgICAgICB4OiB3aWR0aFxuICAgICAgICAgICAgZGVsYXk6ZGVsYXlcbiAgICAgICAgICAgIGVhc2U6TGluZWFyLmVhc2VOb25lXG4gICAgICAgICAgICBvblVwZGF0ZVBhcmFtczogW1wie3NlbGZ9XCJdXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiAodHdlZW4pID0+XG4gICAgICAgICAgICAgICAgY2xvdWRzT25VcGRhdGUgJGVsICwgZFxuXG5cblxuc2V0UmVnaXN0cmF0aW9uID0gKCRlbCwgcmVnaXN0cmF0aW9uKSAtPlxuICAgIFxuICAgIHZhbHVlcyA9IHJlZ2lzdHJhdGlvbi5zcGxpdChcInxcIilcbiAgICBcbiAgICB2aWV3cG9ydFdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBzZXR0aW5ncyA9IHt9XG4gICAgXG4gICAgYWxpZ24gPSB2YWx1ZXNbMF1cbiAgICBvZmZzZXQgPSBwYXJzZUludCh2YWx1ZXNbMV0pIG9yIDBcblxuICAgIHN3aXRjaCBhbGlnblxuICAgICAgICB3aGVuICdsZWZ0J1xuICAgICAgICAgICAgc2V0dGluZ3MueCA9IDAgKyBvZmZzZXRcbiAgICAgICAgd2hlbiAncmlnaHQnXG4gICAgICAgICAgICBzZXR0aW5ncy54ID0gdmlld3BvcnRXaWR0aCArIG9mZnNldCAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIHdoZW4gJ2NlbnRlcidcbiAgICAgICAgICAgIHNldHRpbmdzLnggPSAodmlld3BvcnRXaWR0aCouNSAtICRlbC53aWR0aCgpKi41KSArIG9mZnNldCAgICBcbiAgICBcbiAgICBUd2Vlbk1heC5zZXQgJGVsICwgc2V0dGluZ3NcbiAgICBcbiAgICBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gKG9wdGlvbnMpIC0+XG4gICAgXG4gICAgJGVsID0gb3B0aW9ucy4kZWxcbiAgICAkY29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKSAgICBcbiAgICBjb250YWluZXJUb3BQYWRkaW5nID0gcGFyc2VJbnQoJGNvbnRhaW5lci5jc3MoJ3BhZGRpbmctdG9wJykpXG4gICAgXG4gICAgXG4gICAgdHJ5ICAgICAgICBcbiAgICAgICAgY2xvdWREYXRhID0gJGVsLmRhdGEoKS5jbG91ZFxuICAgICAgIFxuICAgIGNhdGNoIGVcbiAgICAgICAgY29uc29sZS5lcnJvciBcIkNsb3VkIERhdGEgUGFyc2UgRXJyb3I6IEludmFsaWQgSlNPTlwiICAgICAgICBcbiAgICAgICAgXG4gICAgY2xvdWREZXB0aCA9ICRlbC5kYXRhKCdkZXB0aCcpXG4gICAgY2xvdWRTcGVlZCA9IGNsb3VkRGF0YS5zcGVlZCBvciAxXG4gICAgY2xvdWRPZmZzZXRNaW4gPSBwYXJzZUludChjbG91ZERhdGEub2Zmc2V0TWluKSBvciAwXG4gICAgY2xvdWRSZXZlcnNlID0gY2xvdWREYXRhLnJldmVyc2Ugb3IgZmFsc2VcbiAgICBjbG91ZFJlZ2lzdHJhdGlvbiA9IGNsb3VkRGF0YS5yZWdpc3RlciBvciBcImNlbnRlclwiXG5cblxuICAgIFxuICAgIHNldFJlZ2lzdHJhdGlvbiAkZWwgLCBjbG91ZFJlZ2lzdHJhdGlvblxuICAgIGlmICEoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpKVxuICAgICAgICBvZmZMZWZ0ID0gJGVsLm9mZnNldCgpLmxlZnRcbiAgICAgICAgZGlzdGFuY2UgPSAod2luZG93LmlubmVyV2lkdGggLSBvZmZMZWZ0KSAvIHdpbmRvdy5pbm5lcldpZHRoXG4jICAgICAgICBwZXJjZW50YWdlID0gZGlzdGFuY2UgKiAxODAgXG4gICAgICAgIHBlcmNlbnRhZ2UgPSAyNTAgLSAoY2xvdWRTcGVlZCAqIDIwMClcbiAgICAgICAgXG4gICAgICAgIHNldEJvYmluZyAkZWwsIHBlcmNlbnRhZ2UsIGNsb3VkU3BlZWQvNVxuIFxuICAgIG1pblkgPSAkY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgIG1heFkgPSAkKGRvY3VtZW50KS5vdXRlckhlaWdodCgpXG4gICAgdG90YWxSYW5nZT0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpXG4gICAgXG4gICAgXG4gICAgXG4gICAgcGVyY2VudGFnZVJhbmdlID0gdG90YWxSYW5nZS9tYXhZXG4gICAgbWluUmFuZ2VQZXJjZW50YWdlID0gbWluWS9tYXhZICAgIFxuICAgIG1heFJhbmdlUGVyY2VudGFnZSA9IG1pblJhbmdlUGVyY2VudGFnZSArIHBlcmNlbnRhZ2VSYW5nZVxuXG4jICAgIGNvbnNvbGUubG9nIG1pblJhbmdlUGVyY2VudGFnZSAsIG1heFJhbmdlUGVyY2VudGFnZVxuXG5cbiAgICBsYXN0U2Nyb2xsUGVyY2VudGFnZSA9IHByZXNlbnRTY3JvbGxQZXJjZW50YWdlID0gc2Nyb2xsRGVsdGEgPSAwXG5cbiAgICBpZiAoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpICYmICQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JykpXG4gICAgICAgICRjb250YWluZXIuaGlkZSgpXG4gICAgICAgIFxuICAgIFxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICBpZiAoKCRjb250YWluZXIuaGFzQ2xhc3MoJ3NwbGFzaC1jb250YWluZXInKSkgJiYgKCQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JykpKVxuICAgICAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgMC4yNSAsXG4gICAgICAgICAgICAgICAgZWFzZTpTaW5lLmVhc2VPdXRcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA9IChwb3MgLSBtaW5SYW5nZVBlcmNlbnRhZ2UpIC8gKG1heFJhbmdlUGVyY2VudGFnZSAtIG1pblJhbmdlUGVyY2VudGFnZSlcbiAgICAgICAgICAgIGlmIDAgPD0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPD0gMVxuICAgICAgICAgICAgICAgIHByZXNlbnRTY3JvbGxQZXJjZW50YWdlID0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBpZiBjbG91ZFJldmVyc2UgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPSAxIC0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSAodG90YWxSYW5nZSAqIGNsb3VkUG9zaXRpb25QZXJjZW50YWdlKSAqIGNsb3VkU3BlZWRcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSBjbG91ZFkgLSBjb250YWluZXJUb3BQYWRkaW5nXG4gICAgICAgICAgICAgICAgY2xvdWRZID0gY2xvdWRZICsgY2xvdWRPZmZzZXRNaW5cbiAgICBcbiAgICAgICAgICAgICAgICAjTWF5YmUgdXNlIHRoaXM/XG4gICAgICAgICAgICAgICAgc2Nyb2xsRGVsdGEgPSBNYXRoLmFicyhsYXN0U2Nyb2xsUGVyY2VudGFnZSAtIHByZXNlbnRTY3JvbGxQZXJjZW50YWdlKSAqIDNcbiAgICBcbiAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsUGVyY2VudGFnZSA9IHByZXNlbnRTY3JvbGxQZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvICRlbCAsIDAuMjUgLCBcbiAgICAgICAgICAgICAgICAgICAgeTpjbG91ZFlcbiAgICAgICAgICAgICAgICAgICAgZWFzZTpTaW5lLmVhc2VPdXRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICBcbiIsIlxuXG4jQ291bnRcbmNvbW1hcyA9ICh4KSAtPlxuICB4LnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5cblxubW9kdWxlLmV4cG9ydHMuY291bnQgPSAoZWwpIC0+XG4gICAgXG4gICAgXG4gICAgJGVsID0gJChlbClcbiAgICB0YXJnZXRWYWwgPSAkKGVsKS5odG1sKClcbiAgICBudW0gPSAkKGVsKS50ZXh0KCkuc3BsaXQoJywnKS5qb2luKCcnKVxuXG4gICAgc3RhcnQgPSBudW0gKiAuOTk5NVxuICAgIGNoYW5nZSA9IG51bSAqIC4wMDA1XG4gICAgXG4gICAgdGwgPSBuZXcgVGltZWxpbmVNYXhcbiAgICAgICAgb25TdGFydDogLT5cbiAgICAgICAgICAgICRlbC5odG1sKFwiNDJcIilcbiAgICAgICAgb25Db21wbGV0ZTogLT5cbiAgICAgICAgICAgICRlbC5odG1sKHRhcmdldFZhbClcbiAgICAgICAgICAgIFxuICAgIHR3ZWVucyA9IFtdXG5cbiAgICAgICAgXG5cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC5mcm9tVG8gJGVsICwgMC4yNSwgICAgICAgIFxuICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICBpbW1lZGlhdGVSZW5kZXI6dHJ1ZVxuICAgICAgICBlYXNlOlF1aW50LmVhc2VPdXRcbiAgICAsXG4gICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byAkZWwgLCAxLjUsIFxuICAgICAgICBlYXNlOlF1aW50LmVhc2VPdXRcbiAgICAgICAgXG4gICAgICAgIG9uVXBkYXRlOiAtPlxuICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUludChzdGFydCArIHBhcnNlSW50KGNoYW5nZSAqIEBwcm9ncmVzcygpKSlcbiAgICAgICAgICAgIHZhbHVlID0gY29tbWFzKHZhbHVlKVxuICAgICAgICAgICAgZWxzID0gdmFsdWUuc3BsaXQoJycpXG4gICAgICAgICAgICBodG1sID0gJydcbiAgICAgICAgICAgICQuZWFjaCBlbHMsIChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBodG1sICs9IGlmICh2YWx1ZSBpcyAnLCcpIHRoZW4gJywnIGVsc2UgJzxzcGFuPicgKyB2YWx1ZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgJGVsLmh0bWwoaHRtbClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgdGwuYWRkIHR3ZWVuc1xuICAgIFxuICAgIHRsXG5cbiNTY3JvbGxpbmdcblxuXG5cbnR3ZWVuUGFyYWxsYXggPSAocG9zLHR3ZWVuLG1pbixtYXgsZHVyKSAtPlxuXG5cblxuICAgIHBlcmNlbnQgPSAoKHBvcy1taW4pIC8gKG1heC1taW4pKSAqIDFcbiAgICBhbW91bnQgPSBwZXJjZW50ICogZHVyXG5cblxuXG4gICAgaWYgcG9zIDw9IG1heCBhbmQgcG9zID49IG1pblxuICAgICAgICAjY29uc29sZS5sb2cgcGVyY2VudCAsIHR3ZWVuLm5zLm5hbWUgLCBwb3NcbiAgICAgICAgaWYgTWF0aC5hYnMoYW1vdW50IC0gdHdlZW4udGltZSgpKSA+PSAuMDAxXG4gICAgICAgICAgICB0d2Vlbi50d2VlblRvICBhbW91bnQgLFxuICAgICAgICAgICAgICAgIG92ZXJ3cml0ZTpcInByZWV4aXN0aW5nXCIsXG4gICAgICAgICAgICAgICAgZWFzZTpRdWFkLmVhc2VPdXRcblxuXG5tb2R1bGUuZXhwb3J0cy5jbG91ZHMgPSAoc2V0SWQsIG1pbiwgbWF4LCBkdXIpIC0+XG5cbiAgICBtaW5Qb3MgPSBtaW5cbiAgICBtYXhQb3MgPSBtYXhcbiAgICBkdXJhdGlvbiA9IGR1clxuXG4gICAgJGVsID0gJChcIi5jbG91ZHMje3NldElkfVwiKVxuICAgIGNsb3VkcyA9ICRlbC5maW5kKFwiLmNsb3VkXCIpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuICAgIHR3ZWVuLm5zID0ge31cbiAgICB0d2Vlbi5ucy5uYW1lID0gc2V0SWRcblxuICAgIHR3ZWVucyA9IFtdXG4gICAgZm9yIGNsb3VkLGkgaW4gY2xvdWRzXG4gICAgICAgIG9mZnNldCA9IFwiKz0jezI1MCooaSsxKX1cIlxuXG5cbiAgICAgICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gY2xvdWQgLCBkdXJhdGlvbiAsXG4gICAgICAgICAgICB5Om9mZnNldFxuXG5cblxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcblxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuXG5tb2R1bGUuZXhwb3J0cy5zY3JvbGwgPSAobWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uLCBlbGVtKSAtPlxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICB0d2Vlbi5ucyA9IHt9XG4gICAgdHdlZW4ubnMubmFtZSA9IFwiLnNjcm9sbHRvXCJcbiAgICBcbiAgICB0d2VlbnMgPSBbXVxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LnRvIGVsZW0gLCBkdXJhdGlvbiAsIG9wYWNpdHk6MFxuICAgIFxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcbiAgICBcbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzLmFybXMgPSAobWluLCBtYXgsIGR1cikgLT5cblxuICAgIG1pblBvcyA9IG1pblxuICAgIG1heFBvcyA9IG1heFxuICAgIGR1cmF0aW9uID0gZHVyXG5cbiAgICBhcm0gPSAkKFwiLmFybXNcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgdHdlZW4ubnMgPSB7fVxuICAgIHR3ZWVuLm5zLm5hbWUgPSBcIi5hcm1zXCJcblxuICAgIHR3ZWVucyA9IFtdXG4gICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gYXJtICwgZHVyYXRpb24gLCB0b3A6MFxuXG5cblxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcblxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuIiwiXG5nbG9iYWwgPSByZXF1aXJlICcuL2dsb2JhbC5jb2ZmZWUnXG5cblxuXG4jVHJpZ2dlcnNcblxubW9kdWxlLmV4cG9ydHMuZnVuVG9Vc1R3ZWVuID0gKCkgLT5cbiAgICAkZWwgPSAkKFwiI3doby13ZS1hcmUgLnRpdGxlLWJ1Y2tldFwiKVxuICAgIHR3ZWVuID0gVHdlZW5NYXguZnJvbVRvICRlbCAsIC44ICxcbiAgICAgICAgICAgIHJvdGF0aW9uWDoxODBcbiAgICAgICAgICAgIGF1dG9BbHBoYTowXG4gICAgICAgICxcbiAgICAgICAgICAgIHJvdGF0aW9uWDowXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuICAgICAgICAgICAgZWFzZTpCYWNrLmVhc2VPdXRcblxuICAgIGE6dHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuXG5cbm1vZHVsZS5leHBvcnRzLnNjcm9sbENpcmNsZSA9IC0+XG4gICAgJGVsID0gJChcIiN3aG8td2UtYXJlIC5jaXJjLWJ0bi13cmFwcGVyXCIpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZChcInBcIikgLCAuMyAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuICAgIClcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoXCJhXCIpICwgLjQ1ICxcbiAgICAgICAgICAgIHNjYWxlOjBcbiAgICAgICAgICAgIHJvdGF0aW9uOjE4MFxuICAgICAgICAgICAgaW1tZWRpYXRlUmVuZGVyOnRydWVcbiAgICAgICAgLFxuICAgICAgICAgICAgc2NhbGU6MVxuICAgICAgICAgICAgcm90YXRpb246MFxuICAgICAgICAgICAgZWFzZTpCYWNrLmVhc2VPdXRcbiAgICApICwgXCItPS4yXCJcblxuXG4gICAgXG4gICAgYTp0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG4gICAgXG4gICAgXG5tb2R1bGUuZXhwb3J0cy5wYXJrcyA9IC0+XG4gICAgJGVsID0gJChcIiNvdXItcGFya3NcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguc3RhZ2dlckZyb21UbygkZWwuZmluZCgnLnRpdGxlLWJ1Y2tldCBoMSAsIC50aXRsZS1idWNrZXQgaDInKSAsIC41ICwgXG4gICAgICAgICAgICBhdXRvQWxwaGE6MCAjZnJvbVxuICAgICAgICAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MSAjdG8gXG4gICAgICAgICxcbiAgICAgICAgICAgIC4yICNzdGFnZ2VyIGFtb3VudCAgICBcbiAgICApXG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguc3RhZ2dlckZyb21UbygkZWwuZmluZCgnI291ci1wYXJrcy1sb2dvcyBsaScpICwgLjM1ICwgICAgICAgIFxuICAgICAgICAgICAgYXV0b0FscGhhOjBcbiAgICAgICAgICAgIHNjYWxlOjBcbiAgICAgICAgLFxuICAgICAgICAgICAgYXV0b0FscGhhOjFcbiAgICAgICAgICAgIHNjYWxlOjFcbiAgICAgICAgLFxuICAgICAgICAgICAgLjA1ICAgIFxuICAgICksIFwiLT0uNFwiXG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKFwiI291ci1wYXJrcy1nYWxsZXJ5IHVsXCIpICwgLjc1ICxcbiAgICAgICAgICAgIHJvdGF0aW9uWToxODBcbiAgICAgICAgICAgIGF1dG9BbHBoYTowXG4gICAgICAgICxcbiAgICAgICAgICAgIHJvdGF0aW9uWTowXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuICAgICAgICAgICAgZWFzZTpCYWNrLmVhc2VPdXQgICAgXG4gICAgKSwgXCItPS4zXCJcblxuXG4gICAgdHdlZW4ucGF1c2VkKHRydWUpXG5cbiAgICBhOnR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcbiAgICBcbiAgICBcbm1vZHVsZS5leHBvcnRzLmpvYnMgPSAtPlxuICAgICRlbCA9ICQoXCIjam9icy1zZWN0aW9uXCIpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LnN0YWdnZXJGcm9tVG8oJGVsLmZpbmQoJy50aXRsZS1idWNrZXQgaDEgLCAudGl0bGUtYnVja2V0IGgyJykgLCAuNSAsIFxuICAgICAgICAgICAgYXV0b0FscGhhOjAgI2Zyb21cbiAgICAgICAgLFxuICAgICAgICAgICAgYXV0b0FscGhhOjEgI3RvIFxuICAgICAgICAsXG4gICAgICAgICAgICAuMiAjc3RhZ2dlciBhbW91bnQgICAgXG4gICAgKVxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LnN0YWdnZXJGcm9tVG8oJGVsLmZpbmQoJy5zd2lwZXItY29udGFpbmVyIGxpJykgLCAuNSAsICAgICAgICAgXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICAgICAgc2NhbGU6MFxuICAgICAgICAgICAgcm90YXRpb246MTgwXG4gICAgICAgICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG4gICAgICAgICAgICBzY2FsZToxXG4gICAgICAgICAgICByb3RhdGlvbjowXG4gICAgICAgICAgICBlYXNlOkJhY2suZWFzZU91dCAgICAgICAgICAgIFxuICAgICAgICAsXG4gICAgICAgICAgICAuMDUgICAgXG4gICAgKSwgXCItPS40XCJcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5zdGFnZ2VyRnJvbVRvKCRlbC5maW5kKFwiLmJ0bi13cmFwcGVyIGFcIikgLCAuNzUgLCAgICAgICAgXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuICAgIFxuICAgICAgICAsXG4gICAgICAgICAgICAuMiAgICBcbiAgICApLCBcIi09LjNcIlxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcblxuICAgIGE6dHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuXG5cbm1vZHVsZS5leHBvcnRzLmdyb3VwcyA9IC0+XG4gICAgJGVsID0gJChcIiNncm91cC1zYWxlc1wiKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICBcbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguc3RhZ2dlckZyb21UbygkZWwuZmluZCgnLnRpdGxlLWJ1Y2tldCBoMSAsIC50aXRsZS1idWNrZXQgaDInKSAsIC41ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYTowICNmcm9tXG4gICAgICAgICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxICN0byBcbiAgICAgICAgLFxuICAgICAgICAgICAgLjIgI3N0YWdnZXIgYW1vdW50ICAgIFxuICAgIClcbiAgICBcbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguc3RhZ2dlckZyb21UbygkZWwuZmluZCgnLmRyYWdnYWJsZS1jb250YWluZXIgbGknKSAsIC4zNSAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICAgICAgc2NhbGU6MFxuICAgICAgICAgICAgcm90YXRpb246MTgwXG4gICAgICAgICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG4gICAgICAgICAgICBzY2FsZToxXG4gICAgICAgICAgICByb3RhdGlvbjowXG4gICAgICAgICAgICBlYXNlOkJhY2suZWFzZU91dFxuICAgICAgICAsXG4gICAgICAgICAgICAuMDVcbiAgICApLCBcIi09LjRcIlxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LnN0YWdnZXJGcm9tVG8oJGVsLmZpbmQoXCIuYnRuLXdyYXBwZXIgYVwiKSAsIC43NSAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuICAgICAgICAsXG4gICAgICAgICAgICAuMlxuXG4gICAgKSwgXCItPS4zXCJcblxuXG4gICAgdHdlZW4ucGF1c2VkKHRydWUpXG5cbiAgICBhOnR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcblxuXG5cbm1vZHVsZS5leHBvcnRzLmFjY29tb2RhdGlvbnMgPSAtPlxuICAgICRlbCA9ICQoXCIjYWNjb21tb2RhdGlvbnNcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgXG4gICAgXG4gICAgdHdlZW4uYWRkIGdsb2JhbC5jb3VudCgkZWwuZmluZCgnLnRpdGxlLWJ1Y2tldCBoMScpKVxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZCgnLnRpdGxlLWJ1Y2tldCBoMiAsIC50aXRsZS1idWNrZXQgaDMnKSAsIC41ICxcbiAgICAgICAgYXV0b0FscGhhOjAgI2Zyb21cbiAgICAsXG4gICAgICAgIGF1dG9BbHBoYToxICN0byBcbiAgICAsXG4gICAgICAgIC4yICNzdGFnZ2VyIGFtb3VudCAgICBcbiAgICApLCBcIi09MS4yXCJcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5zdGFnZ2VyRnJvbVRvKCRlbC5maW5kKFwiLmJ0bi13cmFwcGVyIGFcIikgLCAuNzUgLFxuICAgICAgICBhdXRvQWxwaGE6MFxuICAgICxcbiAgICAgICAgYXV0b0FscGhhOjFcbiAgICAsXG4gICAgICAgIC4yXG5cbiAgICApLCBcIi09LjNcIlxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZChcIiNhY2NvbW1vZGF0aW9ucy1jYXJvdXNlbFwiKSAsIC43NSAsXG4gICAgICAgIHJvdGF0aW9uWToxODBcbiAgICAgICAgYWxwaGE6MFxuICAgICAgICBzY2FsZTogMC41XG4gICAgLFxuICAgICAgICByb3RhdGlvblk6MFxuICAgICAgICBhbHBoYToxXG4gICAgICAgIHNjYWxlOiAxXG4gICAgICAgIGVhc2U6QmFjay5lYXNlT3V0XG4gICAgLFxuICAgICAgICAuMlxuICAgICksIDAuNVxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcblxuICAgIGE6dHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuICAgIFxuICAgIFxuICAgIFxubW9kdWxlLmV4cG9ydHMuc2Vhc29uYWwgPSAtPlxuICAgICRlbCA9ICQoXCIjc2Vhc29uYWxcIilcbiAgICBcbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuICAgIFxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoXCIub3ZlcmxheVwiKSwgLjg1ICwgIFxuICAgICAgICBzY2FsZTogMC44NVxuICAgICxcbiAgICAgICAgc2NhbGU6IDFcbiAgICApXG4gICAgXG4gICAgXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZChcIi5oYWxsb3dlZW4tdGV4dFwiKSAsIC4yICxcbiAgICAgICAgc2NhbGU6IDJcbiAgICAgICAgLHo6IDUwMFxuICAgICAgICAsYWxwaGE6IDBcbiAgICAsIFxuICAgICAgICBzY2FsZTogMVxuICAgICAgICAsejogMVxuICAgICAgICAsYWxwaGE6IDFcbiAgICApLCAwXG4gICAgXG4gICAgbGV0dGVycyA9IFtdXG4gICAgbGV0dGVyc1swXSA9ICRlbC5maW5kKCcuaGF1bnQtdGV4dCBkaXYnKS5nZXQoMClcbiAgICBsZXR0ZXJzWzFdID0gJGVsLmZpbmQoJy5oYXVudC10ZXh0IGRpdicpLmdldCgzKVxuICAgIGxldHRlcnNbMl0gPSAkZWwuZmluZCgnLmhhdW50LXRleHQgZGl2JykuZ2V0KDIpXG4gICAgbGV0dGVyc1szXSA9ICRlbC5maW5kKCcuaGF1bnQtdGV4dCBkaXYnKS5nZXQoNClcbiAgICBsZXR0ZXJzWzRdID0gJGVsLmZpbmQoJy5oYXVudC10ZXh0IGRpdicpLmdldCgxKVxuXG4gICAgXG4gICAgZm9yIGxldHRlcixpIGluIGxldHRlcnNcbiAgICAgICAgcm90YXRpb24gPSAwXG4gICAgICAgIFxuICAgICAgICBpZiBpJTIgPT0gMFxuICAgICAgICAgICAgcm90YXRpb24gPSAzMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByb3RhdGlvbiA9IC0zMFxuICAgICAgICAgICAgXG4gICAgICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJChsZXR0ZXIpICwgLjM1ICwgXG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAsZWFzZTogUG93ZXIwLmVhc2VOb25lXG4gICAgICAgICAgICAseTogLTE1XG4gICAgICAgICxcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgICx5OiAwXG4gICAgICAgICksICgxLjE1ICsgaSowKVxuXG4gICAgICAgIFxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoXCIuZmlmdHlmaXZlXCIpLCAuMzUgLFxuICAgICAgICBhbHBoYTogMFxuICAgICAgICAseTotMTVcbiAgICAsXG4gICAgICAgIGFscGhhOiAxXG4gICAgICAgICx5OiAwXG4gICAgKSwgMS41XG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKFwiLnNpZ2h0b2ZibG9vZFwiKSwgLjM1ICxcbiAgICAgICAgYWxwaGE6IDBcbiAgICAgICAgLHk6LTE1XG4gICAgLFxuICAgICAgICBhbHBoYTogMVxuICAgICAgICAseTogMFxuICAgICksIDEuODVcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoXCIud2FpdGZvcmhhdW50XCIpLCAuMzUgLFxuICAgICAgICBhbHBoYTogMFxuICAgICAgICAseTotMTVcbiAgICAsXG4gICAgICAgIGFscGhhOiAxXG4gICAgICAgICx5OiAwXG4gICAgKSwgMi4yXG5cblxuXG4gICAgIyMjPT09PT09PT09PT09PT09IEFSTVMgPT09PT09PT09PT09PT0jIyNcbiAgICAjIyM9PT09PT09PT09PT09PT0gQVJNUyA9PT09PT09PT09PT09PSMjI1xuICAgICMjIz09PT09PT09PT09PT09PSBBUk1TID09PT09PT09PT09PT09IyMjXG5cbiAgICB0b3RhbFBhcnRpY2xlcyA9IDM0XG4gICAgcGFydGljbGVzQWRkZWQgPSAwXG5cbiAgICBcbiAgICB3aGlsZSBwYXJ0aWNsZXNBZGRlZCA8IHRvdGFsUGFydGljbGVzXG4gICAgICAgIGNsYXNzTmFtZSA9ICdIQVVOVF9QQVJUSUNMRVMtMDFfJyArIHBhcnRpY2xlc0FkZGVkLnRvU3RyaW5nKClcbiAgICAgICAgaWYgcGFydGljbGVzQWRkZWQgPCAodG90YWxQYXJ0aWNsZXMgLSAxKVxuICAgICAgICAgICAgdHdlZW4uYWRkIFR3ZWVuTWF4LnNldCgkZWwuZmluZChcIi5wYXJ0aWNsZS1zcHJpdGVcIikgLFxuICAgICAgICAgICAgICAgIGNzczoge2NsYXNzTmFtZTogJys9JyArIGNsYXNzTmFtZX1cbiAgICAgICAgICAgICAgICBkZWxheTogKC4wMDMqcGFydGljbGVzQWRkZWQpXG4gICAgICAgICAgICApLCAyLjUgKyAoLjA1KnBhcnRpY2xlc0FkZGVkKSBcbiAgICAgICAgICAgIHBhcnRpY2xlc0FkZGVkKytcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHdlZW4uYWRkIFR3ZWVuTWF4LnNldCgkZWwuZmluZChcIi5wYXJ0aWNsZS1zcHJpdGVcIikgLFxuICAgICAgICAgICAgICAgIGNzczoge2NsYXNzTmFtZTogJys9JyArIGNsYXNzTmFtZX1cbiAgICAgICAgICAgICAgICBkZWxheTogKC4wMDMqcGFydGljbGVzQWRkZWQpXG4gICAgICAgICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgICAgJGVsLmZpbmQoXCIucGFydGljbGUtc3ByaXRlLmxlZnRcIikucmVtb3ZlQ2xhc3MoKS5hZGRDbGFzcygncGFydGljbGUtc3ByaXRlJykuYWRkQ2xhc3MoJ2xlZnQnKVxuICAgICAgICAgICAgICAgICAgICAkZWwuZmluZChcIi5wYXJ0aWNsZS1zcHJpdGUucmlnaHRcIikucmVtb3ZlQ2xhc3MoKS5hZGRDbGFzcygncGFydGljbGUtc3ByaXRlJykuYWRkQ2xhc3MoJ3JpZ2h0JylcbiAgICAgICAgICAgICksIDIuNSArICguMDUqcGFydGljbGVzQWRkZWQpXG4gICAgICAgICAgICBwYXJ0aWNsZXNBZGRlZCsrXG4gICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5zZXQoJGVsLmZpbmQoXCIuYXJtcy5sZWZ0XCIpICwgXG4gICAgICAgIHk6IDEwMDBcbiAgICApLCAwXG4gICAgICAgICAgICBcbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXgudG8oJGVsLmZpbmQoXCIuYXJtcy5sZWZ0XCIpICwgLjE1ICxcbiAgICAgICAgeTogNTUwXG4gICAgICAgICx4Oi0xNVxuICAgICAgICAsZWFzZTogUG93ZXIxLmVhc2VJblxuICAgICksIDIuNVxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LnRvKCRlbC5maW5kKFwiLmFybXMubGVmdFwiKSAsIC40ICxcbiAgICAgICAgeTogMzUwXG4gICAgICAgICxyb3RhdGlvbjogMTBcbiAgICAgICAgLHg6IDE1XG4gICAgICAgICxlYXNlOiBQb3dlcjEuZWFzZUluXG4gICAgKSwgMi42NVxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LnRvKCRlbC5maW5kKFwiLmFybXMubGVmdFwiKSAsIC40ICxcbiAgICAgICAgeTogMFxuICAgICAgICAscm90YXRpb246IDBcbiAgICAgICAgLHg6IDBcbiAgICAgICAgLGVhc2U6IFBvd2VyMS5lYXNlSW5cbiAgICApLCAzLjA1XG5cbiAgICBcbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguc2V0KCRlbC5maW5kKFwiLmFybXMucmlnaHRcIikgLCBcbiAgICAgICAgeTogMTAwMFxuICAgICksIDBcbiAgICBcbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXgudG8oJGVsLmZpbmQoXCIuYXJtcy5yaWdodFwiKSAsIC4xNSAsXG4gICAgICAgIHk6IDU1MFxuICAgICAgICAscm90YXRpb246IC0xMFxuICAgICAgICAseDogMTVcbiAgICAgICAgLGVhc2U6IFBvd2VyMC5lYXNlTm9uZVxuICAgICksIDIuNjVcblxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LnRvKCRlbC5maW5kKFwiLmFybXMucmlnaHRcIikgLCAuNCAsXG4gICAgICAgIHk6IDM1MFxuICAgICAgICAseDogLTE1XG4gICAgICAgICxlYXNlOiBQb3dlcjAuZWFzZU5vbmVcbiAgICApLCAyLjhcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC50bygkZWwuZmluZChcIi5hcm1zLnJpZ2h0XCIpICwgLjQgLFxuICAgICAgICB5OiAwXG4gICAgICAgICxyb3RhdGlvbjogMFxuICAgICAgICAseDogMFxuICAgICAgICAsZWFzZTogUG93ZXIxLmVhc2VJblxuICAgICksIDMuMlxuXG5cbiAgICBibG9vZHMgPSBbXVxuICAgIGJsb29kc1swXSA9ICRlbC5maW5kKCcuaGF1bnQtdGV4dCBpbWcuYmxvb2QnKS5nZXQoMClcbiAgICBibG9vZHNbMV0gPSAkZWwuZmluZCgnLmhhdW50LXRleHQgaW1nLmJsb29kJykuZ2V0KDMpXG4gICAgYmxvb2RzWzJdID0gJGVsLmZpbmQoJy5oYXVudC10ZXh0IGltZy5ibG9vZCcpLmdldCgyKVxuICAgIGJsb29kc1szXSA9ICRlbC5maW5kKCcuaGF1bnQtdGV4dCBpbWcuYmxvb2QnKS5nZXQoNClcbiAgICBibG9vZHNbNF0gPSAkZWwuZmluZCgnLmhhdW50LXRleHQgaW1nLmJsb29kJykuZ2V0KDEpXG4gICAgXG4gICAgZm9yIGJsb29kLGkgaW4gYmxvb2RzXG4gICAgICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJChibG9vZCksIC4xNSAsXG4gICAgICAgICAgICBhbHBoYTogMFxuICAgICAgICAgICAgLHk6MFxuICAgICAgICAgICAgLHNjYWxlOiAxXG4gICAgICAgICxcbiAgICAgICAgICAgIGFscGhhOiAxXG4gICAgICAgICAgICAseTogMFxuICAgICAgICAgICAgLHNjYWxlOiAxXG4gICAgICAgICksICgwLjg1ICsgaSouMjE1KVxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcblxuICAgIGE6dHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuICAgIFxuICAgIFxuICAgIFxuICAgIFxuIiwiUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBCYXNpY092ZXJsYXkgZXh0ZW5kcyBQbHVnaW5CYXNlXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgIyBAJGVsID0gJChlbClcbiAgICAgICAgQG92ZXJsYXlUcmlnZ2VycyA9ICQoJy5vdmVybGF5LXRyaWdnZXInKVxuICAgICAgICBAYWRkRXZlbnRzKClcblxuICAgICAgICBzdXBlcigpXG5cbiAgICBcbiAgICBhZGRFdmVudHM6IC0+XG5cbiAgICAgICAgJCgnI2Jhc2ljLW92ZXJsYXksICNvdmVybGF5LWJhc2ljLWlubmVyIC5vdmVybGF5LWNsb3NlJykuY2xpY2soQGNsb3NlT3ZlcmxheSk7XG4gICAgICAgIEBvdmVybGF5VHJpZ2dlcnMuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgJCh0KS5vbiAnY2xpY2snLCBAb3Blbk92ZXJsYXlcblxuICAgICAgICAjZ2xvYmFsIGJ1eSB0aWNrZXRzIGxpbmtzXG5cbiAgICAgICAgJCgnLm92ZXJsYXktY29udGVudCcpLm9uICdjbGljaycsICdsaScgLEBvcGVuTGlua1xuIyAgICAgICAgJCh3aW5kb3cpLm9uICdyZXNpemUnLCBAY2xvc2VPdmVybGF5XG4gICAgICAgIFxuICAgIG9wZW5MaW5rOiAoZSkgPT5cbiAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldCkucGFyZW50cyAnLnBhcmsnXG4gICAgICAgIGlmIHRhcmdldC5kYXRhKCd0YXJnZXQnKVxuICAgICAgICAgICAgd2luZG93Lm9wZW4odGFyZ2V0LmRhdGEoJ3RhcmdldCcpKVxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgXG4gICAgY2xvc2VPdmVybGF5OiAoZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICEgKChlLnR5cGUgaXMgJ3Jlc2l6ZScpIGFuZCAoJCgnI292ZXJsYXkgdmlkZW86dmlzaWJsZScpLnNpemUoKSA+IDApKVxuICAgICAgICAgICAgJCgnLm92ZXJsYXktYmFzaWMnKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICB9LCAoKSAtPiBcbiAgICAgICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNvdmVybGF5JykuaGlkZSgpXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvcGVuT3ZlcmxheTogKHQpIC0+XG4gICAgICAgICRlbCA9ICQodGhpcylcbiAgICAgICAgb3ZlcmxheVNvdXJjZSA9ICRlbC5kYXRhKCdzb3VyY2UnKVxuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICQoJyNvdmVybGF5LWJhc2ljLWlubmVyIC5vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICBpc05ld3MgPSAkZWwuaGFzQ2xhc3MoJ25ld3MnKVxuXG4gICAgICAgICQoJyNvdmVybGF5Jykuc2hvdygpXG4gICAgICAgIFxuICAgICAgICBpZiAkZWwuaGFzQ2xhc3MgJ29mZmVyaW5ncy1vcHRpb24nXG4gICAgICAgICAgICBvYyA9ICQoJyNvZmZlcmluZ3Mtb3ZlcmxheS1jb250ZW50JylcbiAgICAgICAgICAgIG9jLmZpbmQoJ2gxLnRpdGxlJykudGV4dCgkZWwuZmluZCgnc3Bhbi5vZmZlcicpLnRleHQoKSlcbiAgICAgICAgICAgIG9jLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoJGVsLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoKSlcbiAgICAgICAgICAgIG9jLmZpbmQoJy5jb250ZW50Lm1lZGlhJykuY3NzKHtiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKCdcIiArICRlbC5maW5kKCdzcGFuLm1lZGlhJykuZGF0YSgnc291cmNlJykgKyBcIicpXCJ9KVxuXG4gICAgICAgIFxuICAgICAgICBpZiAoJCgnIycgKyBvdmVybGF5U291cmNlKS5zaXplKCkgaXMgMSkgXG4gICAgICAgICAgICAjaHRtbCA9ICQoJyMnICsgb3ZlcmxheVNvdXJjZSkuaHRtbCgpXG5cbiAgICAgICAgICAgICR0YXJnZXRFbGVtZW50LmNoaWxkcmVuKCkuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgICAgICQodCkuYXBwZW5kVG8oJyNvdmVybGF5LWNvbnRlbnQtc291cmNlcycpXG5cbiAgICAgICAgICAgIGlmIGlzTmV3c1xuICAgICAgICAgICAgICAgIGMgPSAkZWwubmV4dCgnLmFydGljbGUnKS5jbG9uZSgpXG4gICAgICAgICAgICAgICAgJCgnI292ZXJsYXlfY29udGVudCcpLmh0bWwoYy5odG1sKCkpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjJyArIG92ZXJsYXlTb3VyY2UpLmFwcGVuZFRvKCR0YXJnZXRFbGVtZW50KVxuXG4gICAgICAgICAgICAkZWwgPSAkKCcjb3ZlcmxheS1iYXNpYy1pbm5lcicpXG4gICAgICAgICAgICBpc1NtYWxsID0gJGVsLmhlaWdodCgpIDwgJCh3aW5kb3cpLmhlaWdodCgpIGFuZCAkKCR0YXJnZXRFbGVtZW50KS5maW5kKCcuc2VsZWN0LWJveC13cmFwcGVyJykuc2l6ZSgpIGlzIDBcbiAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKVxuICAgICAgICAgICAgYWRkdG9wID0gaWYgaXNTbWFsbCB0aGVuIDAgZWxzZSBzY3JvbGxUb3A7XG4gICAgICAgICAgICBwb3NpdGlvbiA9ICRlbC5jc3MgJ3Bvc2l0aW9uJywgaWYgaXNTbWFsbCB0aGVuICdmaXhlZCcgZWxzZSAnYWJzb2x1dGUnXG4gICAgICAgICAgICB0b3AgPSBNYXRoLm1heCgwLCAoKCQod2luZG93KS5oZWlnaHQoKSAtICRlbC5vdXRlckhlaWdodCgpKSAvIDIpICsgYWRkdG9wKVxuICAgICAgICAgICAgaWYgIWlzU21hbGwgYW5kICh0b3AgPCBzY3JvbGxUb3ApIHRoZW4gdG9wID0gc2Nyb2xsVG9wXG4gICAgICAgICAgICAkZWwuY3NzKFwidG9wXCIsIHRvcCArIFwicHhcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgaGVpZ2h0OlxuICAgICAgICAgICAgIyRlbC5jc3MoXCJsZWZ0XCIsIE1hdGgubWF4KDAsICgoJCh3aW5kb3cpLndpZHRoKCkgLSAkZWwub3V0ZXJXaWR0aCgpKSAvIDIpICsgYWRkbGVmdCkgKyBcInB4XCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmNzcygnb3BhY2l0eScsIDApLmRlbGF5KDApLnNob3coKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICB9KVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzaWNPdmVybGF5XG5cblxuXG5cblxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZXdCYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBEcmFnZ2FibGVHYWxsZXJ5IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cblxuICAgICAgICBAZ2FsbGVyeSA9IEAkZWwuZmluZCBcIi5zd2lwZXItY29udGFpbmVyXCJcblxuICAgICAgICBpZihAZ2FsbGVyeS5sZW5ndGggPCAxKVxuICAgICAgICAgICAgQGdhbGxlcnkgPSBAJGVsLmZpbHRlciBcIi5zd2lwZXItY29udGFpbmVyXCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvcHRzLnBhZ2UgPT0gJ2pvYnMnXG4gICAgICAgICAgICBAam9ic1BhZ2UgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBqb2JzUGFnZSA9IGZhbHNlXG5cbiAgICAgICAgQGdhbGxlcnlDcmVhdGVkID0gZmFsc2VcbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIgPSBAZ2FsbGVyeS5maW5kKCd1bCcpXG4gICAgICAgIEBnYWxsZXJ5SXRlbXMgPSBAZ2FsbGVyeUNvbnRhaW5lci5maW5kKCdsaScpXG4gICAgICAgIEBjdXJyZW50SW5kZXggPSBAZ2FsbGVyeUl0ZW1zLmZpbHRlcignLnNlbGVjdGVkJykuZGF0YSgnaW5kZXgnKVxuICAgICAgICBAYWNyb3NzID0gb3B0cy5hY3Jvc3Mgb3IgMVxuICAgICAgICBAYW5nbGVMZWZ0ID0gQGdhbGxlcnkuZmluZCAnLmZhLWFuZ2xlLWxlZnQnXG4gICAgICAgIEBhbmdsZVJpZ2h0ID0gQGdhbGxlcnkuZmluZCAnLmZhLWFuZ2xlLXJpZ2h0J1xuICAgICAgICBAcGFnaW5hdGlvbiA9IG9wdHMucGFnaW5hdGlvbiBvciBmYWxzZVxuICAgICAgICBAY29udHJvbHMgPSBvcHRzLmNvbnRyb2wgb3IgbnVsbFxuICAgICAgICBAam9ic0Nhcm91c2VsU3RvcHBlZCA9IGZhbHNlXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxQYXVzZWQgPSBmYWxzZVxuICAgICAgICBAam9ic0ludGVydmFsID0gbnVsbFxuXG4gICAgICAgIEBzaXplQ29udGFpbmVyKClcblxuICAgICAgICBAYWRkQXJyb3dzKClcblxuICAgICAgICBzdXBlcigpXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgICQod2luZG93KS5vbiAncmVzaXplJyAsIEBzaXplQ29udGFpbmVyXG5cbiAgICAgICAgJChAJGVsKS5vbiAnY2xpY2snLCAnLmZhLWFuZ2xlLWxlZnQnLCBAcHJldlNsaWRlXG4gICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5mYS1hbmdsZS1yaWdodCcsIEBuZXh0U2xpZGVcbiAgICAgICAgaWYgQGpvYnNQYWdlID09IHRydWVcbiAgICAgICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5zd2lwZXItY29udGFpbmVyJywgQHN0b3BKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgICQoQCRlbCkub24gJ21vdXNlb3ZlcicsICcuc3dpcGVyLWNvbnRhaW5lcicsIEBwYXVzZUpvYnNDYXJvdXNlbFxuICAgICAgICAgICAgJChAJGVsKS5vbiAnbW91c2VsZWF2ZScsICcuc3dpcGVyLWNvbnRhaW5lcicsIEByZXN1bWVKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICBzdG9wSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAam9ic0ludGVydmFsKVxuICAgICAgICBAam9ic0Nhcm91c2VsU3RvcHBlZCA9IHRydWVcblxuICAgIHBhdXNlSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAam9ic0ludGVydmFsKVxuICAgICAgICBAam9ic0Nhcm91c2VsUGF1c2VkID0gdHJ1ZVxuXG4gICAgcmVzdW1lSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICBpZiBAam9ic0Nhcm91c2VsU3RvcHBlZCA9PSBmYWxzZVxuICAgICAgICAgICAgQGpvYnNJbnRlcnZhbCA9IHNldEludGVydmFsICgtPlxuICAgICAgICAgICAgICAgICQoJyNqb2JzLWdhbGxlcnkgLmZhLWFuZ2xlLXJpZ2h0JykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgKSwgODAwMFxuICAgICAgICAgICAgQGpvYnNDYXJvdXNlbFBhdXNlZCA9IGZhbHNlXG5cbiAgICBwcmV2U2xpZGU6IChlKSA9PlxuICAgICAgICB0aGF0ID0gQG15U3dpcGVyXG4gICAgICAgIGdhbCA9IEBnYWxsZXJ5XG4gICAgICAgIFxuICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4yLCBcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgIHNjYWxlOiAxLjFcbiAgICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgdGhhdC5zd2lwZVByZXYoKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnNldCgkKGdhbCksXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjM1LCBcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgICAgICAgICBkZWxheTogLjM1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgXG4gICAgbmV4dFNsaWRlOiAoZSkgPT5cbiAgICAgICAgdGhhdCA9IEBteVN3aXBlclxuICAgICAgICBnYWwgPSBAZ2FsbGVyeVxuXG4gICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjIsXG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICBzY2FsZTogMS4xXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgIHRoYXQuc3dpcGVOZXh0KClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC5zZXQoJChnYWwpLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMC44NVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4zNSxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgICAgICAgICBkZWxheTogLjM1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG5cblxuICAgIGFkZEFycm93czogLT5cbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG5cbiAgICAgICAgYXJyb3dMZWZ0ID0gJChcIjxpIGNsYXNzPSdnYWwtYXJyb3cgZmEgZmEtYW5nbGUtbGVmdCc+PC9pPlwiKVxuICAgICAgICBhcnJvd1JpZ2h0ID0gJChcIjxpIGNsYXNzPSdnYWwtYXJyb3cgZmEgZmEtYW5nbGUtcmlnaHQnPjwvaT5cIilcblxuICAgICAgICBAJGVsLmFwcGVuZChhcnJvd0xlZnQsIGFycm93UmlnaHQpXG5cbiAgICAgICAgJCgnLmdhbC1hcnJvdycpLm9uICdjbGljaycsIC0+XG4gICAgICAgICAgICAkKEApLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICB0aGF0ID0gJChAKVxuICAgICAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgICAgICQodGhhdCkucmVtb3ZlQ2xhc3MgJ2FjdGl2ZScsIDEwMFxuICAgICAgICAgICAgXG5cbiAgICBzaXplQ29udGFpbmVyOiAoKSA9PlxuICAgICAgICBAZ2FsbGVyeUNvbnRhaW5lci5jc3MoJ3dpZHRoJywgXCIxMDAlXCIpXG4gICAgICAgIGlmIEBhY3Jvc3MgPCAyXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCIxMDAlXCIpXG4gICAgICAgIGVsc2UgaWYgQGFjcm9zcyA8IDNcbiAgICAgICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcgLCBcIjUwJVwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCIzMy4zMzMzMzMlXCIpXG5cbiAgICAgICAgQGl0ZW1XaWR0aCA9IEBnYWxsZXJ5SXRlbXMuZmlyc3QoKS5vdXRlcldpZHRoKClcbiAgICAgICAgaXRlbUxlbmd0aCA9IEBnYWxsZXJ5SXRlbXMubGVuZ3RoXG5cbiAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJywgQGl0ZW1XaWR0aClcbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIuY3NzKCd3aWR0aCcsIGl0ZW1MZW5ndGggKiAoQGl0ZW1XaWR0aCkpXG4gICAgICAgIFR3ZWVuTWF4LnNldCBAZ2FsbGVyeUNvbnRhaW5lciAsXG4gICAgICAgICAgICB4OiAtQGN1cnJlbnRJbmRleCAqIEBpdGVtV2lkdGhcbiAgICAgICAgXG4gICAgICAgIGlmICFAZ2FsbGVyeUNyZWF0ZWQgICAgXG4gICAgICAgICAgICBAY3JlYXRlRHJhZ2dhYmxlKClcbiMgICAgICAgICAgICBAbXlTd2lwZXIuc3dpcGVOZXh0KClcbiAgICAgICAgXG4gICAgY3JlYXRlRHJhZ2dhYmxlOiAoKSAtPlxuICAgICAgICBpdGVtTGVuZ3RoID0gQGdhbGxlcnlJdGVtcy5sZW5ndGhcblxuICAgICAgICBpZiBAc2Nyb2xsIHRoZW4gQHNjcm9sbC5raWxsKClcblxuICAgICAgICBpZCA9ICQoQC4kZWwpLmF0dHIgJ2lkJ1xuXG5cbiAgICAgICAgaWYgQHBhZ2luYXRpb25cbiAgICAgICAgICAgIEBhZGRQYWdpbmF0aW9uKClcblxuICAgICAgICBpZiBAYWNyb3NzIDwgM1xuICAgICAgICAgICAgaWYgQHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICBAbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcjJyArIGlkICsgJyAuc3dpcGVyLWNvbnRhaW5lcicse1xuICAgICAgICAgICAgICAgICAgICBsb29wOnRydWUsXG4gICAgICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IEBhY3Jvc3MsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb246ICcjJyArIGlkICsgJyAuc3dpcGVyLXBhZ2luYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQXNSYW5nZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IEBhY3Jvc3NcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgICAgIGxvb3A6dHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZ3JhYkN1cnNvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogQGFjcm9zcyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IEBhY3Jvc3NcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgbG9vcDp0cnVlLFxuICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJHcm91cDogM1xuICAgICAgICAgICAgICAgIG9uVG91Y2hTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZUVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgIEBnYWxsZXJ5Q3JlYXRlZCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIEBqb2JzUGFnZSA9PSB0cnVlXG4gICAgICAgICAgICBAam9ic0ludGVydmFsID0gc2V0SW50ZXJ2YWwgKC0+XG4gICAgICAgICAgICAgICAgJCgnI2pvYnMtZ2FsbGVyeSAuZmEtYW5nbGUtcmlnaHQnKS50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgICAgICApLCA4MDAwXG5cbiAgICAgICAgXG4gICAgb25TbGlkZUNoYW5nZVN0YXJ0OiA9PlxuICAgICAgICAkKEAuJGVsKS5jbG9zZXN0KCcuYWRkLWJvcmRlci1mYWRlJykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICQoQC4kZWwpLmZpbmQoJy5hZGQtYm9yZGVyLWZhZGUnKS5hZGRDbGFzcyAnc2hvd2luZydcblxuICAgIG9uU2xpZGVDaGFuZ2VFbmQ6ID0+XG4gICAgICAgICQoQC4kZWwpLmNsb3Nlc3QoJy5hZGQtYm9yZGVyLWZhZGUnKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgJChALiRlbCkuZmluZCgnLmFkZC1ib3JkZXItZmFkZScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICBcbiAgICAgICAgaWYgIShAY29udHJvbHMgPT0gbnVsbClcbiAgICAgICAgICAgIHBhcmsgPSBAbXlTd2lwZXIuYWN0aXZlU2xpZGUoKS5kYXRhKCdpZCcpXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuY2Fyb3VzZWwtd3JhcHBlcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSBkaXYjJyArIHBhcmspLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSBkaXYjJyArIHBhcmspLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgKEBwYXJrTGlzdClcbiAgICAgICAgICAgIEBwYXJrTGlzdC5zZWxlY3RMb2dvICQoQC4kZWwpLmZpbmQoJy5zd2lwZXItc2xpZGUtYWN0aXZlJykuZGF0YSgnaWQnKTtcblxuICAgIGFkZFBhZ2luYXRpb246ID0+XG4gICAgICAgIHdyYXBwZXIgPSAkKFwiPGRpdiBjbGFzcz0nc3dpcGVyLXBhZ2luYXRpb24nPjwvZGl2PlwiKVxuICAgICAgICAkKEAuJGVsKS5maW5kKCcuc3dpcGVyLWNvbnRhaW5lcicpLmFkZENsYXNzKCdhZGRQYWdpbmF0aW9uJykuYXBwZW5kKHdyYXBwZXIpXG5cblxuICAgIGdvdG86IChpZCwgaW5pdFZhbCkgLT5cblxuICAgICAgICBpZiBub3QgaW5pdFZhbCB0aGVuICQoJ2JvZHknKS5hbmltYXRlIHsgc2Nyb2xsVG9wOiAkKCcjJyArICgkKEAkZWwpLmF0dHIoJ2lkJykpKS5vZmZzZXQoKS50b3AgfVxuXG4gICAgICAgIHRvSW5kZXggPSAkKFwibGkucGFya1tkYXRhLWlkPScje2lkfSddXCIpLmRhdGEoJ2luZGV4JylcblxuICAgICAgICB0bCA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byBAZ2FsbGVyeUNvbnRhaW5lciAsIC40LFxuICAgICAgICAgICAgYXV0b0FscGhhOjBcblxuICAgICAgICB0bC5hZGRDYWxsYmFjayA9PlxuICAgICAgICAgICAgQG15U3dpcGVyLnN3aXBlVG8odG9JbmRleCwgMClcblxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gQGdhbGxlcnlDb250YWluZXIgLCAuNCxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICAgICAgQGN1cnJlbnRJbmRleCA9IHRvSW5kZXhcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdnYWJsZUdhbGxlcnlcblxuIiwiXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5WaWRlb092ZXJsYXkgPSByZXF1aXJlICcuL1ZpZGVvT3ZlcmxheS5jb2ZmZWUnXG5cbmNsYXNzIEZhZGVHYWxsZXJ5IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nICdpbml0aWFsaXplOiAnLCBvcHRzXG5cbiAgICAgICAgQHBhZ2UgPSBvcHRzLnBhZ2Ugb3IgbnVsbFxuICAgICAgICB0YXJnZXQgPSBvcHRzLnRhcmdldCBvciBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiAodGFyZ2V0PylcbiAgICAgICAgICAgIEAkdGFyZ2V0ID0gJCh0YXJnZXQpXG4gICAgICAgIFxuICAgICAgICBpZiAhKEBwYWdlID09IG51bGwpXG4gICAgICAgICAgICBAaW5mb0JveGVzID0gQCRlbC5maW5kIFwibGkudmlkZW9cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaW5mb0JveGVzID0gQCRlbC5maW5kIFwibGlcIlxuICAgICAgICAgICAgXG4gICAgICAgIEBjdXJyZW50U2VsZWN0ZWQgPSBAaW5mb0JveGVzLmZpbHRlcihcIjpmaXJzdC1jaGlsZFwiKVxuXG4gICAgICAgIHN1cGVyKClcbiAgICBcbiAgICBhZGRFdmVudHM6IC0+ICBcblxuICAgICAgICBAaW5mb0JveGVzLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRidG4gPSAkKHQpLmZpbmQoJy52aWRlby1idXR0b24nKVxuXG4gICAgICAgICAgICBpZiAkYnRuLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICB2aWRlb0V2ZW50cyA9IG5ldyBIYW1tZXIoJGJ0blswXSlcbiAgICAgICAgICAgICAgICB2aWRlb0V2ZW50cy5vbiAndGFwJyAsIEBoYW5kbGVWaWRlb0ludGVyYWN0aW9uXG5cblxuXG5cbiAgICBoYW5kbGVWaWRlb0ludGVyYWN0aW9uOiAoZSkgPT5cblxuICAgICAgICAkdGFyZ2V0ID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi52aWRlby1idXR0b25cIilcbiAgICAgICAgaWYgKCR0YXJnZXQuc2l6ZSgpIGlzIDApIFxuICAgICAgICAgICAgJHRhcmdldCA9IGUudGFyZ2V0XG4gICAgICAgIFxuICAgICAgICBpZiAkdGFyZ2V0LmRhdGEoJ3R5cGUnKSA9PSAnaW1hZ2UnXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5kYXRhKCdmdWxsJykpXG4gICAgICAgICAgICAgICAgQGltYWdlU3JjID0gJHRhcmdldC5kYXRhKCdmdWxsJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAaW1hZ2VTcmMgPSAkdGFyZ2V0LmNoaWxkcmVuKCdpbWcnKS5hdHRyKCdzcmMnKVxuICAgICAgICBkYXRhID1cbiAgICAgICAgICAgIG1wNDokdGFyZ2V0LmRhdGEoJ21wNCcpXG4gICAgICAgICAgICB3ZWJtOiR0YXJnZXQuZGF0YSgnd2VibScpXG4gICAgICAgICAgICBwb3N0ZXI6QGltYWdlU3JjXG5cbiAgICAgICAgVmlkZW9PdmVybGF5LmluaXRWaWRlb092ZXJsYXkgZGF0YVxuXG5cbiAgICBnb3RvOiAoaWQsIGluaXRWYWwpIC0+XG4gICAgICAgIGluZm9JZCA9IFwiIyN7aWR9LWluZm9cIlxuXG4gICAgICAgIGlmICEoQHBhZ2UgPT0gbnVsbClcbiAgICAgICAgICAgIHRhcmdldCA9IEBpbmZvQm94ZXMucGFyZW50cygnbGkuZ3JvdXAtaW5mbycpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhcmdldCA9IEBpbmZvQm94ZXNcbiAgICAgICAgXG5cbiAgICAgICAgI1N3aXRjaCBJbmZvIEJveGVzXG4gICAgICAgIHRsID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byB0YXJnZXQgLCAuNCAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICAgICAgb3ZlcndyaXRlOlwiYWxsXCJcbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIHRhcmdldC5maWx0ZXIoaW5mb0lkKSAsIC40ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cblxuICAgICAgICBpZiAoQCR0YXJnZXQ/KVxuICAgICAgICAgICAgY29uc29sZS5sb2cgQCR0YXJnZXRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9wID0gQCR0YXJnZXQub2Zmc2V0KCkudG9wIC0gKCQoJ2hlYWRlcicpLmhlaWdodCgpKVxuICAgICAgICAgICAgY29uc29sZS5sb2cgdG9wXG4gICAgICAgICAgICBwb3MgPSAkKCdib2R5Jykuc2Nyb2xsVG9wKClcbiAgICAgICAgICAgIGlmIChwb3MgPCB0b3ApXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmFuaW1hdGUgeyBzY3JvbGxUb3A6IHRvcCB9XG4gIFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhZGVHYWxsZXJ5XG5cbiIsImdsb2JhbHMgPSByZXF1aXJlICcuLi9nbG9iYWwvaW5kZXguY29mZmVlJ1xuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBIZWFkZXJBbmltYXRpb24gZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gIFxuICAgICAgICBAYm9keSA9ICQoXCJib2R5XCIpXG4gICAgICAgIEBodG1sID0gJChcImh0bWxcIilcbiAgICAgICAgQGNvbnRlbnQgPSAkKFwiI2NvbnRlbnRcIilcbiAgICAgICAgQG1vYm5hdiA9ICQoXCIjbW9iaWxlLWhlYWRlci1uYXZcIilcbiAgICAgICAgQHN1Ym5hdiA9ICQoXCIuc3VibmF2XCIpXG4gICAgICAgIEBzdWJuYXZTaG93aW5nID0gZmFsc2VcbiAgICAgICAgQG91clBhcmtzTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIm91ci1wYXJrc1wiXScpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgQHBhcnRuZXJzaGlwTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cInBhcnRuZXJzaGlwc1wiXScpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgXG5cbiAgICAgICAgc3VwZXIob3B0cykgIFxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpICAgIFxuICAgICAgICBAc2hvd0luaXRpYWxTdWJOYXYoKSAgICAgICAgXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgIGlmICEkKCdodG1sJykuaGFzQ2xhc3MgJ3RhYmxldCdcbiAgICAgICAgICAgICQoJy5uYXYtbGlzdCBhIGxpJykub24gJ21vdXNlZW50ZXInLCBAaGFuZGxlTmF2SG92ZXJcbiAgICAgICAgICAgICQoJ2hlYWRlcicpLm9uICdtb3VzZWxlYXZlJywgQGhpZGVTdWJOYXZcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9IEBoYW5kbGVSZXNpemVcbiAgICAgICAgQGJvZHkuZmluZChcIiNuYXZiYXItbWVudVwiKS5vbiAnY2xpY2snLCBAdG9nZ2xlTmF2XG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdiBhJykub24gJ2NsaWNrJywgQHNob3dNb2JpbGVTdWJOYXZcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2IGknKS5vbiAnY2xpY2snLCBAaGFuZGxlQXJyb3dDbGlja1xuICAgICAgICBcbiAgICAgICAgQGJvZHkuZmluZCgnLnRvZ2dsZS1uYXYnKS5vbiAnY2xpY2snLCAoKSAtPlxuICAgICAgICAgICAgJChAKS5wYXJlbnRzKCdoZWFkZXInKS5maW5kKCcjbmF2YmFyLW1lbnUgaW1nJykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgXG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpLm9uICdjbGljaycsICcubW9iaWxlLXN1Yi1uYXYgbGknLCBAb25DbGlja01vYmlsZVN1Yk5hdkxpbmtcbiAgICAgICAgXG4gICAgXG4gICAgaGFuZGxlU3ViTmF2OiA9PlxuICAgICAgICBzdGFydFBhZ2UgPSAkKCcuc3VibmF2JykuZGF0YSAncGFnZSdcbiAgICAgICAgaWQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2Utc2hvcnQ9XCInICsgc3RhcnRQYWdlICsgJ1wiXScpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIEBzaG93U3ViTmF2TGlua3MoaWQpXG4gICAgICAgIFxuICAgIHNob3dJbml0aWFsU3ViTmF2OiA9PlxuICAgICAgICBzZWN0aW9uID0gJCgnLnN1Ym5hdicpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIFxuICAgICAgICBpZiBzZWN0aW9uID09ICdvZmZlcmluZ3MnIHx8IHNlY3Rpb24gPT0gJ2FjY29tbW9kYXRpb25zJyB8fCBzZWN0aW9uID09ICdvdXJwYXJrcydcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ291ci1wYXJrcycpXG4gICAgICAgIGVsc2UgaWYgc2VjdGlvbiA9PSAncGFydG5lcnNoaXAtZGV0YWlscycgfHwgc2VjdGlvbiA9PSAncGFydG5lcnNoaXAnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdwYXJ0bmVyc2hpcHMnKVxuICAgICAgICBcbiAgICB0b2dnbGVOYXY6IChlKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgIGhhbmRsZVJlc2l6ZTogPT5cbiAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG4gICAgICAgIEBhZGp1c3RNb2JpbGVOYXYoKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgcG9zaXRpb25TdWJOYXZMaXN0czogPT5cbiAgICAgICAgI2NvbnNvbGUubG9nICdwb3NpdGlvblN1Yk5hdkxpc3RzJ1xuIyAgICAgICAgb3VyUGFya3NMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwib3VyLXBhcmtzXCJdJykub2Zmc2V0KCkubGVmdFxuIyAgICAgICAgcGFydG5lcnNoaXBMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwicGFydG5lcnNoaXBzXCJdJykub2Zmc2V0KCkubGVmdCAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgJCgnI2hlYWRlci10b3AnKS5oYXNDbGFzcyAnc21hbGwnXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gOTApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSAxMzMpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA5MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDExOClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgd2luZG93LmlubmVyV2lkdGggPCA5OTNcbiAgICAgICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQG91clBhcmtzTGVmdCAtIDYwKVxuICAgICAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAcGFydG5lcnNoaXBMZWZ0IC0gMTA1KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gNjApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSA5MClcblxuICAgIGFuaW1hdGVIZWFkZXI6IChzY3JvbGxZKSA9PlxuICAgICAgICBpZiBAaHRtbC5oYXNDbGFzcyAncGhvbmUnXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAkaHQgPSBAJGVsLmZpbmQoJyNoZWFkZXItdG9wJylcbiAgICAgICAgJGhiID0gQCRlbC5maW5kKCcjaGVhZGVyLWJvdHRvbScpIFxuXG4gICAgICAgIGlmIHNjcm9sbFkgPiA4NSBcbiAgICAgICAgICAgIGlmICFAbmF2Q29sbGFwc2VkXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlci10b3AsICNoZWFkZXItYm90dG9tLCAjbmF2YmFyLWxvZ28sIC5uYXYtbGlzdCwgI2J1eSwgLmhlYWRlci1jb250YWN0LCAuaGVhZGVyLXNvY2lhbCcpLmFkZENsYXNzKCdzbWFsbCcpXG4gICAgICAgICAgICAgICAgQG5hdkNvbGxhcHNlZCA9IHRydWVcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBAbmF2Q29sbGFwc2VkXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlci10b3AsICNoZWFkZXItYm90dG9tLCAjbmF2YmFyLWxvZ28sIC5uYXYtbGlzdCwgI2J1eSwgLmhlYWRlci1jb250YWN0LCAuaGVhZGVyLXNvY2lhbCcpLnJlbW92ZUNsYXNzKCdzbWFsbCcpXG4gICAgICAgICAgICAgICAgQG5hdkNvbGxhcHNlZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgIGhhbmRsZU5hdkhvdmVyOiAoZSkgPT5cbiAgICAgICAgcGFyZW50SUQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5kYXRhKCdwYWdlJylcbiAgICAgICAgaWYgJCgnIycgKyBwYXJlbnRJRCArICctc3VibmF2LWxpc3QnKS5maW5kKCdhJykubGVuZ3RoIDwgMVxuICAgICAgICAgICAgQGhpZGVTdWJOYXYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaGlkZVN1Yk5hdkxpbmtzKClcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MocGFyZW50SUQpXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgIUBzdWJuYXZTaG93aW5nXG4gICAgICAgICAgICAgICAgQHNob3dTdWJOYXYoKVxuICAgICAgICAgICAgICBcbiAgICBzaG93U3ViTmF2OiA9PlxuICAgICAgICBAc3VibmF2LmFkZENsYXNzKCdzaG93aW5nJylcbiAgICAgICAgQHN1Ym5hdlNob3dpbmcgPSB0cnVlXG4gICAgICAgIFxuICAgIGhpZGVTdWJOYXY6ID0+XG4gICAgICAgIEBzdWJuYXYucmVtb3ZlQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBAc3VibmF2U2hvd2luZyA9IGZhbHNlXG4gICAgICAgIEBoYW5kbGVTdWJOYXYoKVxuXG4gICAgc2hvd1N1Yk5hdkxpbmtzOiAocGFnZSkgPT5cbiAgICAgICAgaWYgcGFnZT9cbiAgICAgICAgICAgIGxlZnQgPSAkKCcubmF2IC5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIicgKyBwYWdlICsgJ1wiXScpLnBvc2l0aW9uKCkubGVmdFxuICAgICAgICAgICAgb2Zmc2V0ID0gMFxuICAgICAgICAgICAgaGVscGVyID0gLTQ1IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgIGhlbHBlciA9IC0yMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjY29uc29sZS5sb2cgJ3BhZ2U6ICcsIHBhZ2VcbiAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYjogJywgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCBhJykubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QgYScpLmxlbmd0aCA8IDNcbiAgICAgICAgICAgICAgICBmb3IgYSBpbiAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0IGEnKVxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBvZmZzZXQgKyAkKGEpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgb2Zmc2V0ID4gMFxuICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYSdcbiAgICAgICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgbGVmdCAtIChvZmZzZXQgLyAzKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgJ2InXG4jICAgICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIGxlZnQgKyBoZWxwZXIpXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKVxuICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzKCdzaG93aW5nJylcbiAgICBcbiAgICBoaWRlU3ViTmF2TGlua3M6ID0+XG4gICAgICAgICQoJy5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzKCdzaG93aW5nJylcbiAgICAgICAgXG4gICAgaGFuZGxlU3ViTmF2OiA9PlxuICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ291cnBhcmtzJykgfHwgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdvZmZlcmluZ3MnKSB8fCAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ2FjY29tbW9kYXRpb25zJylcbiAgICAgICAgICAgICQoJ3VsLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdvdXItcGFya3MnKVxuXG4gICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ29mZmVyaW5ncycpXG4gICAgICAgICAgICAgICAgJCgnYSNvdXItcGFya3Mtb2ZmZXJpbmdzLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG4gICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ2FjY29tbW9kYXRpb25zJylcbiAgICAgICAgICAgICAgICAkKCdhI291ci1wYXJrcy1hY2NvbW1vZGF0aW9ucy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4gICAgICAgIGVsc2UgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcCcpIHx8ICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAtZGV0YWlscycpXG4gICAgICAgICAgICAkKCd1bC5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcygncGFydG5lcnNoaXBzJylcblxuIyAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAtZGV0YWlscycpXG4jICAgICAgICAgICAgICAgICQoJ2EjcGFydG5lcnNoaXAtZGV0YWlscy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4jPT09PT09PT09PT09PT09PT09PSM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jXG4jPT09PT09PT09PT09PT09PT09PSAgTU9CSUxFIFNUQVJUUyBIRVJFID09PT09PT09PT09PT09PT09PSNcbiM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSMgXG5cbiAgICB0b2dnbGVOYXY6IChlKSA9PlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgJHQgPSAkKGUudGFyZ2V0KVxuICAgICAgICAkaGIgPSAkKCcjaGVhZGVyLWJvdHRvbScpXG4gICAgICAgICRtbiA9ICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpXG4gICAgICAgICRoaCA9ICRoYi5oZWlnaHQoKVxuXG4gICAgICAgICR0LnRvZ2dsZUNsYXNzKCdjbG9zZWQnKVxuXG4gICAgICAgIGNvbnNvbGUubG9nICdzZWNvbmQgdG9nZ2xlJ1xuICAgICAgICBjb25zb2xlLmxvZyAkdFxuICAgICAgICBcbiAgICAgICAgaWYgJHQuaGFzQ2xhc3MoJ2Nsb3NlZCcpXG4gICAgICAgICAgICBAYWRqdXN0TW9iaWxlTmF2KClcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEBtb2JuYXYsIC4zNSwgXG4gICAgICAgICAgICAgICAge3k6ICg4MDAgKyAkaGgpXG4gICAgICAgICAgICAgICAgLHo6IDBcbiAgICAgICAgICAgICAgICAsZWFzZTogUG93ZXIxLmVhc2VPdXRcbiAgICAgICAgICAgICAgICAsb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBtb2JuYXYsXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiAxMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBtb2JuYXYsXG4gICAgICAgICAgICAgICAgejogLTIgXG4gICAgICAgICAgICBUd2Vlbk1heC50byBAbW9ibmF2LCAuNSwge3k6IDAsIHo6IDAsIGVhc2U6IFBvd2VyMS5lYXNlSW59XG4gICAgICAgICAgICAkKCcubW9iaWxlLXN1Yi1uYXYnKS5jc3MoJ2hlaWdodCcsICcwcHgnKVxuICAgICAgICAgICAgQGFkanVzdE1vYmlsZU5hdlxuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBjb250ZW50ICxcbiAgICAgICAgICAgICAgICB5OiAwXG5cbiAgICBhZGp1c3RNb2JpbGVOYXY6ID0+XG4gICAgICAgICRoYiA9ICQoJyNoZWFkZXItYm90dG9tJylcbiAgICAgICAgJG1uID0gJCgnI21vYmlsZS1oZWFkZXItbmF2JylcbiAgICAgICAgIyBTZXQgbmF2IGhlaWdodCB0byAzNTBweCBldmVyeSB0aW1lIGJlZm9yZSBhZGp1c3RpbmdcbiAgICAgICAgIyRtbi5jc3Mge2hlaWdodDogMzUwfVxuICAgICAgICAkaGggPSAkaGIuaGVpZ2h0KClcbiAgICAgICAgJG5oID0gJG1uLmhlaWdodCgpXG4gICAgICAgICRpdyA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICAgICRpaCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAkbWIgPSAkKCcjbmF2YmFyLW1lbnUnKVxuXG4gICAgICAgIGlmICRuaCA+ICRpaFxuICAgICAgICAgICAgJG1uLmNzcyB7aGVpZ2h0OiAoJGloIC0gJGhoKSwgb3ZlcmZsb3c6ICdzY3JvbGwnfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkbW4uY3NzIHtoZWlnaHQ6IDQwMCArICdweCd9ICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIHNob3dNb2JpbGVTdWJOYXY6IChlKSA9PlxuICAgICAgICB0aGlzU3ViTmF2ID0gJChlLnRhcmdldCkucGFyZW50KCkuZmluZCAnLm1vYmlsZS1zdWItbmF2J1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXNTdWJOYXYuZmluZCgnbGknKS5sZW5ndGggPCAxKVxuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgISgkKGUudGFyZ2V0KS5wYXJlbnQoKS5oYXNDbGFzcygnYWN0aXZlJykpXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIFxuICAgICAgICBob3dNYW55ID0gdGhpc1N1Yk5hdi5maW5kKCdsaScpLmxlbmd0aFxuICAgICAgICB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldClcblxuICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgIHRhcmdldC5maW5kKCdpJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgdGFyZ2V0LmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgIHRhcmdldC5wYXJlbnRzKCdhJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgQG1vYm5hdi5jc3MoJ2hlaWdodCcsICh3aW5kb3dIZWlnaHQgLSAxMDApICsgJ3B4JylcbiAgICAgICAgdGhpc1N1Yk5hdi5jc3MoJ2hlaWdodCcsIChob3dNYW55ICogNTApICsgJ3B4JylcbiAgICAgICAgXG4gICAgaGlkZU1vYmlsZVN1Yk5hdjogPT5cbiAgICAgICAgJCgnLm1vYmlsZS1zdWItbmF2JykuY3NzKCdoZWlnaHQnLCAnMHB4JylcbiAgICAgICAgQG1vYm5hdi5jc3MoJ2hlaWdodCcsICc0MDBweCcpXG4gICAgICAgIEBtb2JuYXYuZmluZCgnaScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgIEBtb2JuYXYuZmluZCgnbGknKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICBAbW9ibmF2LmZpbmQoJ3VsIGEnKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuXG4gICAgXG4gICAgaGFuZGxlQXJyb3dDbGljazogKGUpID0+XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIFxuICAgICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaScpLnRyaWdnZXIgJ2NsaWNrJ1xuICAgICAgICBcbiAgICAgICAgXG4gICAgb25DbGlja01vYmlsZVN1Yk5hdkxpbms6IChlKSA9PlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBcbiAgICAgICAgaWYgJChlLnRhcmdldCkuZGF0YSgnaHJlZicpP1xuICAgICAgICAgICAgdXJsID0gJChlLnRhcmdldCkuZGF0YSAnaHJlZidcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJBbmltYXRpb25cblxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZGVvT3ZlcmxheSA9IHJlcXVpcmUgJy4vVmlkZW9PdmVybGF5LmNvZmZlZSdcblxuY2xhc3MgUGFya3NMaXN0IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBAJGVsID0gJChvcHRzLmVsKVxuICAgICAgICBzdXBlcihvcHRzKSAgICAgICAgIFxuICAgICAgICBAZ2FsbGVyeSA9IG9wdHMuZ2FsbGVyeVxuICAgICAgICBpZiBAZ2FsbGVyeT9cbiAgICAgICAgICAgIEBnYWxsZXJ5Lm9uIFwiaXRlbUluZGV4XCIgLCBAc2VsZWN0TG9nb1xuICAgICAgICAgICAgXG4gICAgICAgIEBwYWdlID0gb3B0cy5wYWdlXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAcGFya0xvZ29zID0gJChAJGVsKS5maW5kIFwibGlcIlxuICAgICAgICBAY3VycmVudFNlbGVjdGVkID0gQHBhcmtMb2dvcy5maWx0ZXIoXCI6Zmlyc3QtY2hpbGRcIilcbiAgICAgICAgaWYgQGdhbGxlcnk/XG4gICAgICAgICAgICBAc2VsZWN0TG9nbyBAc2VsZWN0ZWRMb2dvKClcbiAgICAgICAgICAgIEBnYWxsZXJ5LmdvdG8gQHNlbGVjdGVkTG9nbygpLCB0cnVlXG4gICAgICAgIHN1cGVyKClcblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgQCRlbC5vbiAnY2xpY2snLCAnbGkucGFyaycsIEBoYW5kbGVMb2dvSW50ZXJhY3Rpb25cbiAgICAgICAgXG4gICAgICAgIEBwYXJrTG9nb3MuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgbG9nb0V2ZW50cyA9IG5ldyBIYW1tZXIodClcbiAgICAgICAgICAgIGxvZ29FdmVudHMub24gJ3RhcCcgLCBAaGFuZGxlTG9nb0ludGVyYWN0aW9uXG5cbiAgICBoYW5kbGVMb2dvSW50ZXJhY3Rpb246IChlKSA9PlxuICAgICAgICBpZiBAcGFnZSA9PSAnYWNjb21tb2RhdGlvbidcbiAgICAgICAgICAgIEBwYXJrTG9nb3MucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnbGkucGFyaycpLmFkZENsYXNzICdzZWxlY3RlZCdcbiAgICAgICAgICAgIHdoaWNoUGFyayA9ICQoZS50YXJnZXQpLnBhcmVudHMoJ2xpLnBhcmsnKS5hdHRyKCdpZCcpXG4gICAgICAgICAgICBAc2hvd05ld0FjY29tbW9kYXRpb25zKHdoaWNoUGFyaylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgJHRhcmdldCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2xpJylcblxuICAgICAgICBpZCA9ICR0YXJnZXQuZGF0YSgnaWQnKVxuICAgICAgICBcbiAgICAgICAgQGRpc3BsYXlDb250ZW50IGlkXG4gICAgICAgIFxuICAgICAgICBcbiAgICBzaG93TmV3QWNjb21tb2RhdGlvbnM6IChwYXJrKSA9PlxuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5jYXJvdXNlbC13cmFwcGVyJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXJbZGF0YS1sb2dvPVwiJyArIHBhcmsgKyAnXCJdJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXJbZGF0YS1sb2dvPVwiJyArIHBhcmsgKyAnXCJdJykucGFyZW50KCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcblxuICAgIGRpc3BsYXlDb250ZW50OiAoaWQpIC0+XG5cblxuICAgICAgICBAc2VsZWN0TG9nbyhpZClcblxuICAgICAgICAjU3dpdGNoIEluZm8gQm94ZXNcbiAgICAgICAgQGdhbGxlcnkuZ290byhpZClcblxuXG4gICAgc2VsZWN0TG9nbzogKGlkKSA9PlxuICAgICAgICBsb2dvSWQgPSBcIiMje2lkfS1sb2dvXCJcbiAgICAgICAgQHBhcmtMb2dvcy5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICBAcGFya0xvZ29zLmZpbHRlcihsb2dvSWQpLmFkZENsYXNzKCdzZWxlY3RlZCcpXG5cblxuICAgIHNlbGVjdGVkTG9nbzogLT5cbiAgICAgICAgcmV0dXJuIEBwYXJrTG9nb3MucGFyZW50KCkuZmluZCgnbGkuc2VsZWN0ZWQnKS5kYXRhKCdpZCcpO1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFya3NMaXN0XG5cbiIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblxuY2xhc3MgUmVzaXplQnV0dG9ucyBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBAcmVzaXplQnV0dG9ucygpXG5cbiAgICByZXNpemVCdXR0b25zOiAtPlxuICAgICAgICBjID0gJCgnI2NvbnRlbnQnKVxuICAgICAgICBidG5fd3JhcHBlcnMgPSBjLmZpbmQgJy5idG4td3JhcHBlcidcblxuICAgICAgICBmb3IgYnRuX3dyYXBwZXIgaW4gYnRuX3dyYXBwZXJzXG4gICAgICAgICAgICBidG5zID0gJChidG5fd3JhcHBlcikuZmluZCAnYSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYnRucy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgbWF4V2lkdGggPSAwXG4gICAgICAgICAgICAgICAgd2lkZXN0U3BhbiA9IG51bGxcblxuICAgICAgICAgICAgICAgICQoYnRucykuZWFjaCAtPlxuICAgICAgICAgICAgICAgICAgICBpZiAkKHRoaXMpLndpZHRoKCkgPiBtYXhXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGggPSAkKHRoaXMpLndpZHRoKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGVzdFNwYW4gPSAkKHRoaXMpXG5cbiAgICAgICAgICAgICAgICAkKGJ0bnMpLmVhY2ggLT5cbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3Moe3dpZHRoOiBtYXhXaWR0aCArIDYwfSlcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZUJ1dHRvbnMiLCJjbGFzcyBTdmdJbmplY3RcblxuICAgIGNvbnN0cnVjdG9yOiAoc2VsZWN0b3IpIC0+XG4gICAgICAgIFxuICAgICAgICBAJHN2Z3MgPSAkKHNlbGVjdG9yKVxuICAgICAgICBcbiAgICAgICAgQHByZWxvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSAsIFwiXCIgLCB0cnVlXG4gICAgICAgIEBwcmVsb2FkZXIuc2V0TWF4Q29ubmVjdGlvbnMoMTApXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnZmlsZWxvYWQnICwgQG9uU3ZnTG9hZGVkXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uTG9hZENvbXBsZXRlXG4gICAgICAgIEBtYW5pZmVzdCA9IFtdXG4gICAgICAgIEBjb2xsZWN0U3ZnVXJscygpXG4gICAgICAgIEBsb2FkU3ZncygpXG4gICAgICAgIFxuICAgIGNvbGxlY3RTdmdVcmxzOiAtPlxuICAgICAgICBcbiAgICAgICAgc2VsZiA9IEBcbiAgICAgICAgXG4gICAgICAgIEAkc3Zncy5lYWNoIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlkID0gXCJzdmctaW5qZWN0LSN7cGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIDEwMDApLnRvU3RyaW5nKCl9XCJcbiAgICAgICAgICBcbiAgICAgICAgICAgICQoQCkuYXR0cignaWQnLCBpZClcbiAgICAgICAgICAgICQoQCkuYXR0cignZGF0YS1hcmInICwgXCJhYmMxMjNcIilcbiAgICAgICAgICAgIHN2Z1VybCA9ICQoQCkuYXR0cignc3JjJylcbiAgICAgICAgICAgIFxuICAgICAgICAgICBcblxuICAgICAgICAgICAgc2VsZi5tYW5pZmVzdC5wdXNoIFxuICAgICAgICAgICAgICAgIGlkOmlkXG4gICAgICAgICAgICAgICAgc3JjOnN2Z1VybFxuICAgICAgICAgICAgICAgIFxuICAgIGxvYWRTdmdzOiAtPlxuICAgICAgICBcbiAgICAgICAgQHByZWxvYWRlci5sb2FkTWFuaWZlc3QoQG1hbmlmZXN0KVxuICAgICAgICAgICAgICAgIFxuICAgIFxuICAgIGluamVjdFN2ZzogKGlkLHN2Z0RhdGEpIC0+XG4gICAgICAgIFxuICAgICAgICAkZWwgPSAkKFwiIyN7aWR9XCIpICAgIFxuIFxuIFxuICAgICAgICBpbWdJRCA9ICRlbC5hdHRyKCdpZCcpXG4gICAgICAgIGltZ0NsYXNzID0gJGVsLmF0dHIoJ2NsYXNzJylcbiAgICAgICAgaW1nRGF0YSA9ICRlbC5jbG9uZSh0cnVlKS5kYXRhKCkgb3IgW11cbiAgICAgICAgZGltZW5zaW9ucyA9IFxuICAgICAgICAgICAgdzogJGVsLmF0dHIoJ3dpZHRoJylcbiAgICAgICAgICAgIGg6ICRlbC5hdHRyKCdoZWlnaHQnKVxuXG4gICAgICAgIHN2ZyA9ICQoc3ZnRGF0YSkuZmlsdGVyKCdzdmcnKVxuICAgICAgICBcblxuICAgICAgICBzdmcgPSBzdmcuYXR0cihcImlkXCIsIGltZ0lEKSAgaWYgdHlwZW9mIGltZ0lEIGlzbnQgJ3VuZGVmaW5lZCdcbiAgICAgICAgaWYgdHlwZW9mIGltZ0NsYXNzIGlzbnQgJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIGNscyA9IChpZiAoc3ZnLmF0dHIoXCJjbGFzc1wiKSBpc250ICd1bmRlZmluZWQnKSB0aGVuIHN2Zy5hdHRyKFwiY2xhc3NcIikgZWxzZSBcIlwiKVxuICAgICAgICAgICAgc3ZnID0gc3ZnLmF0dHIoXCJjbGFzc1wiLCBpbWdDbGFzcyArIFwiIFwiICsgY2xzICsgXCIgcmVwbGFjZWQtc3ZnXCIpXG4gICAgICAgIFxuICAgICAgICAjIGNvcHkgYWxsIHRoZSBkYXRhIGVsZW1lbnRzIGZyb20gdGhlIGltZyB0byB0aGUgc3ZnXG4gICAgICAgICQuZWFjaCBpbWdEYXRhLCAobmFtZSwgdmFsdWUpIC0+ICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzdmdbMF0uc2V0QXR0cmlidXRlIFwiZGF0YS1cIiArIG5hbWUsIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gICAgICAgIFxuICAgICAgICBzdmcgPSBzdmcucmVtb3ZlQXR0cihcInhtbG5zOmFcIilcbiAgICAgICAgXG4gICAgICAgICNHZXQgb3JpZ2luYWwgZGltZW5zaW9ucyBvZiBTVkcgZmlsZSB0byB1c2UgYXMgZm91bmRhdGlvbiBmb3Igc2NhbGluZyBiYXNlZCBvbiBpbWcgdGFnIGRpbWVuc2lvbnNcbiAgICAgICAgb3cgPSBwYXJzZUZsb2F0KHN2Zy5hdHRyKFwid2lkdGhcIikpXG4gICAgICAgIG9oID0gcGFyc2VGbG9hdChzdmcuYXR0cihcImhlaWdodFwiKSlcbiAgICAgICAgXG4gICAgICAgICNTY2FsZSBhYnNvbHV0ZWx5IGlmIGJvdGggd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzIGV4aXN0XG4gICAgICAgIGlmIGRpbWVuc2lvbnMudyBhbmQgZGltZW5zaW9ucy5oXG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcIndpZHRoXCIsIGRpbWVuc2lvbnMud1xuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJoZWlnaHRcIiwgZGltZW5zaW9ucy5oXG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgcHJvcG9ydGlvbmFsbHkgYmFzZWQgb24gd2lkdGhcbiAgICAgICAgZWxzZSBpZiBkaW1lbnNpb25zLndcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwid2lkdGhcIiwgZGltZW5zaW9ucy53XG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcImhlaWdodFwiLCAob2ggLyBvdykgKiBkaW1lbnNpb25zLndcbiAgICAgICAgXG4gICAgICAgICNTY2FsZSBwcm9wb3J0aW9uYWxseSBiYXNlZCBvbiBoZWlnaHRcbiAgICAgICAgZWxzZSBpZiBkaW1lbnNpb25zLmhcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwiaGVpZ2h0XCIsIGRpbWVuc2lvbnMuaFxuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJ3aWR0aFwiLCAob3cgLyBvaCkgKiBkaW1lbnNpb25zLmhcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAkZWwucmVwbGFjZVdpdGggc3ZnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgb25TdmdMb2FkZWQ6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgQGluamVjdFN2ZyhlLml0ZW0uaWQsIGUucmF3UmVzdWx0KVxuICAgIFxuICAgIG9uTG9hZENvbXBsZXRlOiAoZSkgPT5cbiAgICBcbiAgICBcbiAgICBcbiAgICBcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gU3ZnSW5qZWN0ICIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblxuY2xhc3MgVGlja2VyTGlzdCBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT4gICAgICBcbiAgICAgICAgc3VwZXIob3B0cylcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgQHRpY2tlckxpc3RXcmFwcGVyID0gQCRlbC5maW5kIFwiLnRpY2tlci1saXN0LXdyYXBwZXJcIlxuICAgICAgICBAdGlja2VyTGlzdDEgPSBAJGVsLmZpbmQgXCIudGlja2VyLWxpc3QuMVwiXG4gICAgICAgIEB0aWNrZXJMaXN0MiA9IEAkZWwuZmluZCBcIi50aWNrZXItbGlzdC4yXCJcblxuICAgICAgICBAdGlja2VyTGlzdHMgPSBAJGVsLmZpbmQgXCIudGlja2VyLWxpc3RcIlxuXG4gICAgICAgIEB0aWNrZXJzID0gQCRlbC5maW5kIFwic3Bhbi50aWNrZXJcIlxuICAgICAgICBAZmlyc3RUaWNrZXIgPSBAJGVsLmZpbmQgXCJzcGFuLnRpY2tlcjpmaXJzdC1jaGlsZFwiXG5cbiAgICAgICAgI0BnZXRTdG9ja0luZm8oKVxuICAgICAgICBAaW5pdGlhbGl6ZVRpY2tlcigpXG5cblxuICAgIGdldFN0b2NrSW5mbzogLT5cblxuXG4gICAgICAgICMjIyBBSkFYIGNhbGwgdG8gZ3JhYiBDZWRhciBGYWlyIFN0b2NrIFByaWNlIGZyb20gR29vZ2xlIGFuZCBpbnNlcnQgaW50byBzdG9jayB0aWNrZXIgIyMjXG4gICAgICAgICQuYWpheFxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9maW5hbmNlLmdvb2dsZS5jb20vZmluYW5jZS9pbmZvP2NsaWVudD1pZyZxPU5ZU0U6RlVOXCJcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25wXCJcbiAgICAgICAgICAgIGVycm9yOiBAb25HZXRTdG9ja0ZhaWxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IEBvbkdldFN0b2NrU3VjY2Vzc1xuXG4gICAgZ2VuZXJhdGVTdG9ja0VsZW1lbnQ6IChpbmZvKSAtPlxuXG4gICAgICAgICMjIyBTZXR1cCB0aGUgSFRNTCB0byBiZSBpbnNlcnRlZCBpbnRvIHRoZSB0aWNrZXIgIyMjXG4gICAgICAgIHdyYXBwZXIgPSAkKFwiPHNwYW4gY2xhc3M9J3RpY2tlcicgaWQ9J3RpY2tlci1zcGFuLW55c2UnPjwvc3Bhbj5cIilcbiAgICAgICAgbmFtZSA9ICQoXCI8cCBjbGFzcz0ndGlja2VyLWhlYWRsaW5lJz5cIiArIGluZm8udCArIFwiPC9wPlwiKVxuXG5cbiAgICAgICAgYW1udCA9IGluZm8uYy5zdWJzdHIoMSwgaW5mby5jLmxlbmd0aC0xKVxuXG5cblxuICAgICAgICBpZiBpbmZvLmMuaW5kZXhPZignKycpID4gLTFcbiAgICAgICAgICAgIGltZyA9ICQoXCI8aW1nIGNsYXNzPSd0aWNrZXItYXJyb3cnIHNyYz0naW1hZ2VzL2ljb25zL3RpY2tlci11cC1hcnJvdy5wbmcnIC8+XCIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGltZyA9ICQoXCI8aW1nIGNsYXNzPSd0aWNrZXItYXJyb3cnIHNyYz0naW1hZ2VzL2ljb25zL3RpY2tlci1kb3duLWFycm93LnBuZycgLz5cIilcbiAgICAgICAgICAgIFxuXG4gICAgICAgIGFtbnRFbCA9ICQoXCI8cCBjbGFzcz0ndGlja2VyLWFtb3VudCc+XCIgKyBhbW50ICsgXCI8L3A+XCIpXG5cbiAgICAgICAgIyMjIEFwcGVuZCB0aGUgSFRNTCB0byB0aGUgdGlja2VyIGxpc3RzICMjI1xuICAgICAgICB3cmFwcGVyLmFwcGVuZChuYW1lLCBpbWcsIGFtbnRFbClcblxuICAgICAgICByZXR1cm4gd3JhcHBlclxuXG5cblxuICAgIGluaXRpYWxpemVUaWNrZXI6IChzdG9ja0VsKSAtPlxuXG4gICAgICAgICMjIyBTZXQgdGhlIHdpZHRoIG9mIHRoZSB0aWNrZXIgbGlzdCB3cmFwcGVyIHRvIGJlIGVxdWFsIHRvIHN1bSBvZiB0aWNrZXIxIGFuZCB0aWNrZXIyIHdpZHRoICAjIyNcbiAgICAgICAgdGFyZ2V0V2lkdGggPSAoQHRpY2tlckxpc3QxLndpZHRoKCkgKiAyLjEpICsgMjAwXG4gICAgICAgIGNvbnNvbGUubG9nICd0YXJnZXRXaWR0aDogJywgdGFyZ2V0V2lkdGhcbiAgICAgICAgQHRpY2tlckxpc3RXcmFwcGVyLmNzcyB7d2lkdGg6IHRhcmdldFdpZHRofVxuXG4gICAgICAgICMjIyBEZWZpbmUgZGlzdGFuY2UgdG8gc2xpZGUgbGVmdCBhbmQgc2V0dXAgVGltZWxpbmVNYXggIyMjXG4gICAgICAgIG1vdmVMZWZ0ID0gQHRpY2tlckxpc3RzLmZpcnN0KCkud2lkdGgoKVxuICAgICAgICBob3dNYW55ID0gJCgnLnRpY2tlci1saXN0LjEnKS5jaGlsZHJlbignc3BhbicpLmxlbmd0aFxuICAgICAgICB0aW1lID0gaG93TWFueSAqIDhcblxuICAgICAgICBUd2Vlbk1heC50byBAdGlja2VyTGlzdFdyYXBwZXIgLCB0aW1lICxcbiAgICAgICAgICAgIHJlcGVhdDotMVxuICAgICAgICAgICAgZm9yY2UzRDp0cnVlXG4gICAgICAgICAgICB4OiAtbW92ZUxlZnRcbiAgICAgICAgICAgIGVhc2U6TGluZWFyLmVhc2VOb25lXG5cbiAgICBvbkdldFN0b2NrU3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIGluZm8gPSBkYXRhWzBdXG4gICAgICAgIFxuICAgICAgICBzdG9ja0VsID0gQGdlbmVyYXRlU3RvY2tFbGVtZW50KGluZm8pXG4gICAgICAgIEBpbml0aWFsaXplVGlja2VyKHN0b2NrRWwpXG5cblxuICAgIG9uR2V0U3RvY2tGYWlsOiA9PlxuICAgICAgICBAaW5pdGlhbGl6ZVRpY2tlcigpXG5cbm1vZHVsZS5leHBvcnRzID0gVGlja2VyTGlzdFxuXG4iLCJcblxuY2xhc3MgVmlkZW9PdmVybGF5XG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cbiAgICAgICAgQCRlbCA9ICQoZWwpXG4gICAgICAgIEAkaW5uZXIgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1pbm5lclwiKVxuICAgICAgICBAJGNvbnRhaW5lciA9IEAkZWwuZmluZChcIi5vdmVybGF5LWlubmVyLWNvbnRhaW5lclwiKVxuICAgICAgICBcbiAgICAgICAgaWYgKEAkY29udGFpbmVyLmZpbmQoJy5vdmVybGF5LWNvbnRlbnQnKS5zaXplKCkgaXMgMSkgXG4gICAgICAgICAgICBAJGNvbnRhaW5lciA9IEAkY29udGFpbmVyLmZpbmQoJy5vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICAgICAgXG4gICAgICAgIEAkY2xvc2UgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1jbG9zZVwiKVxuICAgICAgICBcblxuICAgICAgICBAY3JlYXRlVmlkZW9JbnN0YW5jZSgpXG4gICAgICAgIEBjcmVhdGVPdmVybGF5VHJhbnNpdGlvbigpXG4gICAgICAgIEBhZGRFdmVudHMoKVxuXG5cblxuICAgIGNyZWF0ZU92ZXJsYXlUcmFuc2l0aW9uOiAtPlxuICAgICAgICBAdGwgPSBuZXcgVGltZWxpbmVNYXhcblxuICAgICAgICBAJGVsLnNob3coKVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXguZnJvbVRvICQoJyNvdmVybGF5JyksIC4wMSxcbiAgICAgICAgICAgIHt6SW5kZXg6IC0xLCBkaXNwbGF5Oidub25lJywgejogMH0sIHt6SW5kZXg6IDUwMDAsIGRpc3BsYXk6J2Jsb2NrJywgejogOTk5OTk5OTk5OX1cbiAgICAgICAgXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRlbCAsIC4zNSAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRpbm5lciAsIC41NSAsXG4gICAgICAgICAgICBhbHBoYToxXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGNsb3NlICwgLjI1ICxcbiAgICAgICAgICAgIGFscGhhOjFcbiAgICAgICAgLFxuICAgICAgICAgICAgXCItPS4xNVwiXG5cbiAgICAgICAgQHRsLmFkZExhYmVsKFwiaW5pdENvbnRlbnRcIilcblxuICAgICAgICBAdGwuc3RvcCgpXG5cbiAgICBjcmVhdGVWaWRlb0luc3RhbmNlOiAoKSAtPlxuXG5cblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgQGNsb3NlRXZlbnQgPSBuZXcgSGFtbWVyKEAkY2xvc2VbMF0pXG5cblxuXG4gICAgdHJhbnNpdGlvbkluT3ZlcmxheTogKG5leHQpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nICd0cmFuc2l0aW9uSW5PdmVybGF5J1xuICAgICAgICBAdHJhbnNJbkNiID0gbmV4dFxuICAgICAgICBAdGwuYWRkQ2FsbGJhY2soQHRyYW5zSW5DYiwgXCJpbml0Q29udGVudFwiKVxuICAgICAgICBAdGwucGxheSgpXG4gICAgICAgIEBjbG9zZUV2ZW50Lm9uICd0YXAnICwgQGNsb3NlT3ZlcmxheVxuXG4gICAgdHJhbnNpdGlvbk91dE92ZXJsYXk6IC0+XG4gICAgICAgIGNvbnNvbGUubG9nICd0cmFuc2l0aW9uT3V0T3ZlcmxheSdcbiAgICAgICAgQGNsb3NlRXZlbnQub2ZmICd0YXAnICwgQGNsb3NlT3ZlcmxheVxuICAgICAgICBAdGwucmVtb3ZlQ2FsbGJhY2soQHRyYW5zSW5DYilcbiAgICAgICAgQHRsLnJldmVyc2UoKVxuICAgICAgICBkZWxldGUgQHRyYW5zSW5DYlxuXG5cbiAgICBjbG9zZU92ZXJsYXk6IChlKSA9PlxuICAgICAgICBAcmVtb3ZlVmlkZW8oKVxuICAgICAgICBAdHJhbnNpdGlvbk91dE92ZXJsYXkoKVxuXG5cbiAgICByZW1vdmVWaWRlbzogKCkgLT5cbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2VcbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLnBhdXNlKClcbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLmN1cnJlbnRUaW1lKDApXG4gICAgICAgICAgICAjQHZpZGVvSW5zdGFuY2UuZGlzcG9zZSgpXG5cbiAgICByZXNpemVPdmVybGF5OiAoKSAtPlxuICAgICAgICAkdmlkID0gQCRlbC5maW5kKCd2aWRlbycpXG4gICAgICAgICR3ID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgJGggPSAkdmlkLmhlaWdodCgpXG5cbiAgICAgICAgIyBAJGlubmVyLmNzcyB7d2lkdGg6ICR3LCBoZWlnaHQ6ICRofVxuICAgICAgICAjICR2aWQuY3NzIHtoZWlnaHQ6IDEwMCArICclJywgd2lkdGg6IDEwMCArICclJ31cblxuICAgIGFwcGVuZERhdGE6IChkYXRhKSAtPlxuICAgICAgICBpZiBkYXRhLm1wNCA9PSBcIlwiIG9yICEgZGF0YS5tcDQ/XG4gICAgICAgICAgICBjb25zb2xlLmxvZyAnbm8gdmlkZW8sIGl0cyBhbiBpbWFnZSdcbiAgICAgICAgICAgIEBwb3N0ZXIgPSAkKFwiPGRpdiBjbGFzcz0ndmlkZW8tanMnPjxpbWcgY2xhc3M9J3Zqcy10ZWNoJyBzcmM9J1wiICsgZGF0YS5wb3N0ZXIgKyBcIicgY2xhc3M9J21lZGlhLWltYWdlLXBvc3RlcicgLz48L2Rpdj5cIilcbiAgICAgICAgICAgIEAkY29udGFpbmVyLmh0bWwgQHBvc3RlclxuICAgICAgICAgICAgQHBvc3Rlci5jc3MgJ2hlaWdodCcsICcxMDAlJ1xuICAgICAgICAgICAgQHJlbW92ZVZpZGVvKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIG1wNCA9ICQoXCI8c291cmNlIHNyYz1cXFwiI3tkYXRhLm1wNH1cXFwiIHR5cGU9XFxcInZpZGVvL21wNFxcXCIgLz4gXCIpXG4gICAgICAgIHdlYm0gPSAkKFwiPHNvdXJjZSBzcmM9XFxcIiN7ZGF0YS53ZWJtfVxcXCIgdHlwZT1cXFwidmlkZW8vd2VibVxcXCIgLz4gXCIpXG5cbiAgICAgICAgQCR2aWRlb0VsID0gJChcIjx2aWRlbyBpZD0nb3ZlcmxheS1wbGF5ZXInIGNsYXNzPSd2anMtZGVmYXVsdC1za2luIHZpZGVvLWpzJyBjb250cm9scyBwcmVsb2FkPSdhdXRvJyAvPlwiKVxuICAgICAgICBAJHZpZGVvRWwuYXBwZW5kKG1wNClcbiAgICAgICAgQCR2aWRlb0VsLmFwcGVuZCh3ZWJtKVxuICAgICAgICBAJGNvbnRhaW5lci5odG1sIEAkdmlkZW9FbFxuXG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlP1xuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UuZGlzcG9zZSgpXG4gICAgICAgIEB2aWRlb0luc3RhbmNlID0gdmlkZW9qcyBcIm92ZXJsYXktcGxheWVyXCIgICxcbiAgICAgICAgICAgIHdpZHRoOlwiMTAwJVwiXG4gICAgICAgICAgICBoZWlnaHQ6XCIxMDAlXCJcblxuXG5cblxuICAgIHBsYXlWaWRlbzogKCkgPT5cbiMgICAgICAgIGlmKCEkKFwiaHRtbFwiKS5oYXNDbGFzcygnbW9iaWxlJykpXG4jICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGxheSgpXG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlP1xuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGxheSgpXG4gICAgICAgICAgICBcbiAgICBzaG93SW1hZ2U6ICgpID0+XG4gICAgICAgIGNvbnNvbGUubG9nICdzaG93SW1hZ2UnXG5cblxuXG5vdmVybGF5ID0gbmV3IFZpZGVvT3ZlcmxheSBcIiNvdmVybGF5XCJcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cy5pbml0VmlkZW9PdmVybGF5ID0gKGRhdGEpIC0+XG4gICAgY29uc29sZS5sb2cgJ2RhdGEyOiAnLCBkYXRhXG4gICAgb3ZlcmxheS5hcHBlbmREYXRhKGRhdGEpXG5cblxuICAgIGlmICEoZGF0YS5tcDQgPT0gXCJcIilcbiAgICAgICAgY29uc29sZS5sb2cgJ2RhdGEubXA0ICE9PSBcIlwiJ1xuICAgICAgICBvdmVybGF5LnRyYW5zaXRpb25Jbk92ZXJsYXkob3ZlcmxheS5wbGF5VmlkZW8pXG4gICAgZWxzZVxuICAgICAgICBjb25zb2xlLmxvZyAnZGF0YS5tcDQgPT09IFwiXCInXG4gICAgICAgIG92ZXJsYXkudHJhbnNpdGlvbkluT3ZlcmxheShvdmVybGF5LnNob3dJbWFnZSlcblxuXG5cblxuXG5cblxuXG5cblxuXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5GcmFtZXNNb2RlbCA9IHJlcXVpcmUgJy4vRnJhbWVzTW9kZWwuY29mZmVlJ1xuXG5tYXRjaEZyYW1lTnVtID0gL1xcZCsoPz1cXC5bYS16QS1aXSspL1xuXG5jbGFzcyBGcmFtZUFuaW1hdGlvbiBleHRlbmRzIFBsdWdpbkJhc2VcbiAgICBcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIFxuICAgICAgICBAJGVsID0gJChvcHRzLmVsKVxuICAgICAgICBAYXN5bmMgPSBvcHRzLmFzeW5jIG9yIGZhbHNlXG4gICAgICAgIGRlcHRoPSBvcHRzLmRlcHRoIG9yIDFcbiAgICAgICAgQCRjb250YWluZXIgPSAkKFwiPGRpdiBjbGFzcz0nY29hc3Rlci1jb250YWluZXInIC8+XCIpXG4gICAgICAgIEAkY29udGFpbmVyLmF0dHIoJ2lkJyAsIG9wdHMuaWQpXG4gICAgICAgIEAkY29udGFpbmVyLmNzcygnei1pbmRleCcsIGRlcHRoKVxuICAgICAgICBUd2Vlbk1heC5zZXQgQCRjb250YWluZXIgLCBcbiAgICAgICAgICAgIHo6ZGVwdGggKiAxMFxuICAgICAgICBcbiAgICAgICAgc3VwZXIob3B0cylcbiAgICAgICAgXG4gICAgICAgIFxuICAgIFxuICAgIGluaXRpYWxpemU6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcbiAgICAgICAgQG1vZGVsID0gbmV3IEZyYW1lc01vZGVsIG9wdHNcbiAgICAgICAgQG1vZGVsLm9uIFwiZGF0YUxvYWRlZFwiICwgQHNldHVwQ2FudmFzXG4gICAgICAgIEBtb2RlbC5vbiBcInRyYWNrTG9hZGVkXCIgLCBAb25UcmFja0xvYWRlZFxuICAgICAgICBAbW9kZWwub24gXCJmcmFtZXNMb2FkZWRcIiAsIEBvbkZyYW1lc0xvYWRlZFxuICAgICAgICBAbW9kZWwubG9hZERhdGEoKVxuICAgICAgICBcbiAgIFxuICAgICAgIFxuICAgIGxvYWRGcmFtZXM6IC0+XG4gICAgICAgIGlmIEBtb2RlbC5kYXRhP1xuICAgICAgICAgICAgQG1vZGVsLnByZWxvYWRGcmFtZXMoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGVmZXJMb2FkaW5nID0gdHJ1ZVxuICAgICAgICBcbiAgICBcbiAgICBcbiAgICBzZXR1cENhbnZhczogPT5cbiAgICAgICAgXG5cbiAgICAgICAgQGNhbnZhc1dpZHRoID0gQG1vZGVsLmdldCgnZ2xvYmFsJykud2lkdGhcbiAgICAgICAgQGNhbnZhc0hlaWdodCA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLmhlaWdodFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKVxuICAgICAgICBAY29udGV4dCA9IEBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICBcbiAgICAgICAgQGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJyAsIEBjYW52YXNXaWR0aClcbiAgICAgICAgQGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcgLCBAY2FudmFzSGVpZ2h0KVxuXG4gICAgICAgIFxuICAgICAgICBAJGNvbnRhaW5lci5hcHBlbmQoQGNhbnZhcylcbiAgICAgICAgQCRlbC5wcmVwZW5kKEAkY29udGFpbmVyKVxuICAgICAgICBAbW9kZWwucHJlbG9hZFRyYWNrKClcbiAgICAgICAgaWYgQGRlZmVyTG9hZGluZ1xuICAgICAgICAgICAgQG1vZGVsLnByZWxvYWRGcmFtZXMoKVxuICAgICAgXG4gICAgXG4gICAgZGlzcGxheVRyYWNrOiAtPlxuICAgICAgICBcbiAgICAgICAgQGNvbnRleHQuY2xlYXJSZWN0IDAgLCAwICwgQGNhbnZhc1dpZHRoICwgQGNhbnZhc0hlaWdodFxuICAgICAgICBAY29udGV4dC5kcmF3SW1hZ2UgQHRyYWNrSW1hZ2UudGFnICwgMCAsMCAsIEBjYW52YXNXaWR0aCAsIEBjYW52YXNIZWlnaHRcbiAgICAgICAgXG4gICAgZGlzcGxheUZyYW1lOiAobnVtKSAtPlxuICAgICAgICBcbiAgICAgICAgbWFuaWZlc3QgPSBAbW9kZWwuZ2V0KCdtYW5pZmVzdCcpXG4gICAgICAgIFxuICAgICAgICBpZiBtYW5pZmVzdC5sZW5ndGggPiBudW1cbiAgICAgICAgICAgIGFzc2V0ID0gbWFuaWZlc3RbbnVtXSBcbiAgICAgICAgICAgIGZyYW1lQXNzZXQgPSBAbW9kZWwuZ2V0QXNzZXQoYXNzZXQuZmlsZW5hbWUpXG4gICAgICAgICAgICAjIGNvbnNvbGUubG9nIGZyYW1lQXNzZXQudGFnICwgYXNzZXQueCAsIGFzc2V0LnksIGFzc2V0LndpZHRoLCBhc3NldC5oZWlnaHRcbiAgICAgICAgICAgIEBjb250ZXh0LmRyYXdJbWFnZSBmcmFtZUFzc2V0LnRhZyAsIGFzc2V0LnggLCBhc3NldC55LCBhc3NldC53aWR0aCwgYXNzZXQuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICBpbml0QW5pbWF0aW9uOiAtPlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGZyYW1lcyA9IEBtb2RlbC5nZXQoJ21hbmlmZXN0JykubGVuZ3RoXG4gICAgICAgIHNwZWVkID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuZnBzXG4gICAgICAgIGRlbGF5ID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuZGVsYXkgb3IgMFxuICAgICAgICByZXBlYXREZWxheSA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLnJlcGVhdERlbGF5IG9yIDEwXG4gICAgICAgIFxuICAgIFxuXG4gICAgICAgIGR1cmF0aW9uID0gIGZyYW1lcyAvIHNwZWVkXG5cblxuICAgICAgICBzZWxmID0gQCBcbiAgICAgICAgQGxhc3RGcmFtZU51bSA9IC0xXG4gICAgICAgIEB0aW1lbGluZSA9IHdpbmRvdy5jb2FzdGVyID0gVHdlZW5NYXgudG8gQGNhbnZhcyAsIGR1cmF0aW9uICwgXG4gICAgICAgICAgICBvblVwZGF0ZTogLT5cbiAgICAgICAgICAgICAgICBmcmFtZU51bSA9IE1hdGguZmxvb3IoZnJhbWVzICogQHByb2dyZXNzKCkpICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGZyYW1lTnVtIGlzbnQgQGxhc3RGcmFtZU51bSAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kaXNwbGF5VHJhY2soKVxuICAgICAgICAgICAgICAgICAgICBzZWxmLmRpc3BsYXlGcmFtZShmcmFtZU51bSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGxhc3RGcmFtZU51bSA9IGZyYW1lTnVtXG4gICAgICAgICAgICByZXBlYXQ6LTFcbiAgICAgICAgICAgIHJlcGVhdERlbGF5OiByZXBlYXREZWxheVxuICAgICAgICAgICAgZGVsYXk6ZGVsYXlcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG5cbiAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgXG4gICAgb25UcmFja0xvYWRlZDogPT5cblxuICAgICAgICBAdHJhY2tJbWFnZSA9IEBtb2RlbC5nZXRBc3NldCgndHJhY2snKVxuICAgICAgICBAZGlzcGxheVRyYWNrKClcbiAgICAgICAgXG5cbiAgICBvbkZyYW1lc0xvYWRlZDogPT5cbiAgICAgICAgaWYgdHlwZW9mIEBhc3luYyBpcyAnZnVuY3Rpb24nXG4gICAgICAgICAgICBAYXN5bmMoKVxuICAgICAgICAkKHdpbmRvdykub24gJ3Njcm9sbCcsICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eVxuICAgICAgICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eSgpXG4gICAgXG4gICAgICAgIFxuICAgIGNoZWNrQ29hc3RlclZpc2liaWxpdHk6ID0+XG4gICAgICAgIFxuICAgICAgICBpZihAaW5WaWV3cG9ydCgpKVxuXG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmICdzY3JvbGwnLCAgQGNoZWNrQ29hc3RlclZpc2liaWxpdHlcbiAgICAgICAgICAgIEBpbml0QW5pbWF0aW9uKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIGluVmlld3BvcnQ6ID0+XG4gICAgICAgIFxuICAgICAgICB0b3AgPSBAJGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgICAgaGVpZ2h0ID0gQCRjb250YWluZXIuZmluZCgnY2FudmFzJykuZmlyc3QoKS5oZWlnaHQoKVxuICAgICAgICBib3R0b20gPSB0b3AgKyBoZWlnaHRcbiAgICAgICAgXG4gICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKVxuICAgICAgICBzY3JvbGxCb3R0b20gPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyAkKHdpbmRvdykuaGVpZ2h0KClcblxuICAgICAgICBpZiBzY3JvbGxUb3AgPD0gdG9wIDw9IHNjcm9sbEJvdHRvbVxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICBcbiBcblxubW9kdWxlLmV4cG9ydHMgPSBGcmFtZUFuaW1hdGlvblxuIiwiXG5cbm1hdGNoRnJhbWVOdW0gPSAvXFxkKyg/PVxcLlthLXpBLVpdKykvXG5cbmNsYXNzIEZyYW1lc01vZGVsIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgQGJhc2VVcmwgPSBvcHRzLmJhc2VVcmxcbiAgICAgICAgQHVybCA9IG9wdHMudXJsXG4gICAgICAgIEBsb2FkTWFuaWZlc3QgPSBbXTtcbiAgICAgICAgQHRyYWNrTWFuaWZlc3QgPSBbXTtcbiAgICAgICAgQGluaXRMb2FkZXIoKVxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcblxuICAgIGxvYWREYXRhOiAtPlxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogQGJhc2VVcmwgICsgQHVybFxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IEBvbkRhdGFMb2FkZWRcbiAgICAgICAgICAgIGVycm9yOiBAaGFuZGxlRXJyb3JcblxuICAgIGhhbmRsZUVycm9yOiAoZXJyKSAtPlxuICAgICAgICB0aHJvdyBlcnJcblxuICAgIG9uRGF0YUxvYWRlZDogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBAZGF0YSA9IGRhdGFcbiAgICAgICAgQHRyYW5zZm9ybURhdGEoKVxuICAgICAgICBAZW1pdCBcImRhdGFMb2FkZWRcIlxuICAgICAgXG5cbiAgICBzb3J0U2VxdWVuY2U6IChhLGIpIC0+XG4gICAgICAgIGFGcmFtZSA9IG1hdGNoRnJhbWVOdW0uZXhlYyhhLmZpbGVuYW1lKVxuICAgICAgICBiRnJhbWUgPSBtYXRjaEZyYW1lTnVtLmV4ZWMoYi5maWxlbmFtZSlcbiAgICAgICAgcmV0dXJuIGlmIHBhcnNlSW50KGFGcmFtZVswXSkgPCBwYXJzZUludChiRnJhbWVbMF0pIHRoZW4gLTEgZWxzZSAxXG5cbiAgICB0cmFuc2Zvcm1EYXRhOiAtPlxuICAgICAgICBAZGF0YS5tYW5pZmVzdC5zb3J0IEBzb3J0U2VxdWVuY2VcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBAdHJhY2tNYW5pZmVzdC5wdXNoXG4gICAgICAgICAgICBpZDpcInRyYWNrXCJcbiAgICAgICAgICAgIHNyYzogXCIje0BkYXRhLmdsb2JhbC5mb2xkZXJ9LyN7QGRhdGEuZ2xvYmFsLnRyYWNrfVwiXG5cbiAgICAgICAgZm9yIGZyYW1lIGluIEBkYXRhLm1hbmlmZXN0XG4gICAgICAgICAgICBmcmFtZS5zcmMgPSBcIiN7QGRhdGEuZ2xvYmFsLmZvbGRlcn0vI3tmcmFtZS5maWxlbmFtZX1cIlxuICAgICAgICAgICAgQGxvYWRNYW5pZmVzdC5wdXNoXG4gICAgICAgICAgICAgICAgaWQ6IGZyYW1lLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgc3JjOiBmcmFtZS5zcmNcblxuICAgIGluaXRMb2FkZXI6IC0+XG4gICAgICAgIEB0cmFja0xvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSwgQGJhc2VVcmwsIHRydWVcbiAgICAgICAgQHByZWxvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSwgQGJhc2VVcmwsIHRydWVcbiAgICAgICAgQHRyYWNrTG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDEwKVxuICAgICAgICBAcHJlbG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDE1KVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIHByZWxvYWRUcmFjazogLT5cblxuICAgICAgICBAdHJhY2tMb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uVHJhY2tBc3NldHNDb21wbGV0ZVxuICAgICAgICBAdHJhY2tMb2FkZXIubG9hZE1hbmlmZXN0KEB0cmFja01hbmlmZXN0KVxuICAgIHByZWxvYWRGcmFtZXM6IC0+XG4jICAgICAgICBjb25zb2xlLmxvZyBAbG9hZE1hbmlmZXN0XG4gICAgICAgIFxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkFzc2V0c0NvbXBsZXRlXG4gICAgICAgIEBwcmVsb2FkZXIubG9hZE1hbmlmZXN0KEBsb2FkTWFuaWZlc3QpXG5cbiAgICBvblRyYWNrQXNzZXRzQ29tcGxldGU6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgQHRyYWNrTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvblRyYWNrQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQGVtaXQgXCJ0cmFja0xvYWRlZFwiXG5cbiAgICBvbkFzc2V0c0NvbXBsZXRlOiAoZSk9PlxuIyAgICAgICAgY29uc29sZS5sb2cgQHByZWxvYWRlclxuICAgICAgICBAcHJlbG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkFzc2V0c0NvbXBsZXRlXG4gICAgICAgIEBlbWl0IFwiZnJhbWVzTG9hZGVkXCJcblxuXG5cblxuICAgIGdldEFzc2V0OiAoaWQpIC0+XG4gICAgICAgIFxuICAgICAgICBpdGVtID0gIEBwcmVsb2FkZXIuZ2V0SXRlbSBpZFxuICAgICAgICBpZiAhaXRlbT9cbiAgICAgICAgICAgIGl0ZW0gPSAgQHRyYWNrTG9hZGVyLmdldEl0ZW0gaWQgICAgICAgIFxuICAgICAgICByZXR1cm4gaXRlbVxuXG4gICAgZ2V0OiAoa2V5KSAtPlxuICAgICAgICBmb3Igayx2IG9mIEBkYXRhXG4gICAgICAgICAgICBpZiBrIGlzIGtleVxuICAgICAgICAgICAgICAgIHJldHVybiB2XG5cbiAgICBzZXQ6IChrZXksIHZhbCkgLT5cbiAgICAgICAgQGRhdGFba2V5XSA9IHZhbFxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRnJhbWVzTW9kZWxcbiIsIlxyXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuLi9hYnN0cmFjdC9WaWV3QmFzZS5jb2ZmZWVcIlxyXG5cclxuY2xhc3MgU2Nyb2xsQmFyIGV4dGVuZHMgVmlld0Jhc2VcclxuXHJcbiAgICBzY3JvbGxpbmcgOiBmYWxzZVxyXG4gICAgb2Zmc2V0WSA6IDBcclxuICAgIHBvc2l0aW9uIDogMFxyXG4gICAgaGlkZVRpbWVvdXQ6IDBcclxuXHJcblxyXG4gICAgaW5pdGlhbGl6ZTogLT5cclxuICAgICAgICBAb25SZXNpemUoKVxyXG4gICAgICAgIEBzZXRFdmVudHMoKVxyXG5cclxuICAgICAgICBpZiB3aW5kb3cuaXNUaWVyVGFibGV0XHJcbiAgICAgICAgICAgIEAkZWwuaGlkZSgpXHJcblxyXG5cclxuXHJcbiAgICBzZXRFdmVudHM6ID0+XHJcbiAgICAgICAgQGRlbGVnYXRlRXZlbnRzXHJcbiAgICAgICAgICAgIFwibW91c2Vkb3duIC5oYW5kbGVcIiA6IFwib25IYW5kbGVEb3duXCJcclxuICAgICAgICAgICAgI1wibW91c2VlbnRlclwiIDogXCJvbkhhbmRsZVVwXCJcclxuICAgICAgICAgICAgXCJjbGljayAucmFpbFwiIDogXCJvblJhaWxDbGlja1wiXHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uIFwibW91c2V1cFwiICwgQG9uSGFuZGxlVXBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbiBcIm1vdXNlbW92ZVwiICwgQG9uTW91c2VNb3ZlXHJcblxyXG5cclxuICAgICAgICBcclxuICAgIHVwZGF0ZUhhbmRsZTogKHBvcykgPT5cclxuICAgICAgICBAcG9zaXRpb24gPSBwb3NcclxuICAgICAgICBAJGVsLmZpbmQoJy5oYW5kbGUnKS5jc3NcclxuICAgICAgICAgICAgdG9wOiBAcG9zaXRpb24gKiAoJCh3aW5kb3cpLmhlaWdodCgpIC0gQCRlbC5maW5kKFwiLmhhbmRsZVwiKS5oZWlnaHQoKSlcclxuICAgICAgICBAc2hvd1Njcm9sbGJhcigpXHJcbiAgICAgICAgQGhpZGVTY3JvbGxiYXIoKVxyXG5cclxuICAgIG9uUmFpbENsaWNrOiAoZSkgPT5cclxuICAgICAgICBAb2Zmc2V0WSA9IGlmIGUub2Zmc2V0WSBpc250IHVuZGVmaW5lZCB0aGVuIGUub2Zmc2V0WSBlbHNlIGUub3JpZ2luYWxFdmVudC5sYXllcllcclxuICAgICAgICBAcG9zaXRpb24gPSBAb2Zmc2V0WSAvICQod2luZG93KS5oZWlnaHQoKVxyXG4gICAgICAgIEB0cmlnZ2VyIFwiY3VzdG9tU2Nyb2xsSnVtcFwiICwgQHBvc2l0aW9uXHJcbiAgICAgICAgXHJcblxyXG5cclxuICAgIG9uSGFuZGxlRG93bjogKGUpID0+XHJcblxyXG4gICAgICAgIEAkZWwuY3NzXHJcbiAgICAgICAgICAgIHdpZHRoOlwiMTAwJVwiXHJcbiAgICAgICAgQG9mZnNldFkgPSBpZiBlLm9mZnNldFkgaXNudCB1bmRlZmluZWQgdGhlbiBlLm9mZnNldFkgZWxzZSBlLm9yaWdpbmFsRXZlbnQubGF5ZXJZXHJcbiAgICAgICAgQHNjcm9sbGluZyA9IHRydWVcclxuXHJcbiAgICBvbkhhbmRsZVVwOiAoZSkgPT5cclxuICAgICAgICBAJGVsLmNzc1xyXG4gICAgICAgICAgICB3aWR0aDpcIjE1cHhcIlxyXG5cclxuICAgICAgICBAc2Nyb2xsaW5nID0gZmFsc2VcclxuXHJcbiAgICBvbk1vdXNlTW92ZTogKGUpID0+XHJcbiAgICAgICAgaWYgQHNjcm9sbGluZ1xyXG5cclxuICAgICAgICAgICAgaWYgZS5wYWdlWSAtIEBvZmZzZXRZIDw9IDBcclxuICAgICAgICAgICAgICAgICQoXCIuaGFuZGxlXCIpLmNzc1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMVxyXG4gICAgICAgICAgICBlbHNlIGlmIGUucGFnZVkgLSBAb2Zmc2V0WSA+PSAkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmhlaWdodCgpXHJcbiAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiLmhhbmRsZVwiKS5jc3NcclxuICAgICAgICAgICAgICAgICAgICB0b3A6ICAgKCQod2luZG93KS5oZWlnaHQoKSAtICQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuaGVpZ2h0KCkpIC0gMVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAkKFwiLmhhbmRsZVwiKS5jc3NcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IGUucGFnZVkgLSBAb2Zmc2V0WVxyXG5cclxuXHJcbiAgICAgICAgICAgIEBwb3NpdGlvbiA9IHBhcnNlSW50KCQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuY3NzKFwidG9wXCIpKSAvICgkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmhlaWdodCgpKVxyXG5cclxuICAgICAgICAgICAgaWYgQHBvc2l0aW9uIDwgcGFyc2VGbG9hdCguMDA1KVxyXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uID0gMFxyXG4gICAgICAgICAgICBlbHNlIGlmIEBwb3NpdGlvbiA+IHBhcnNlRmxvYXQoLjk5NSlcclxuICAgICAgICAgICAgICAgIEBwb3NpdGlvbiA9IDFcclxuXHJcblxyXG4gICAgICAgICAgICBAdHJpZ2dlciBcImN1c3RvbVNjcm9sbFwiICwgQHBvc2l0aW9uXHJcbiAgICAgICAgICBcclxuICAgXHJcbiAgICAgICAgaWYgQG1vdXNlWCBpc250IGUuY2xpZW50WCBhbmQgQG1vdXNlWSBpc250IGUuY2xpZW50WVxyXG4gICAgICAgICAgICBAc2hvd1Njcm9sbGJhcigpXHJcbiAgICAgICAgICAgIEBoaWRlU2Nyb2xsYmFyKClcclxuXHJcbiAgICAgICAgQG1vdXNlWCA9IGUuY2xpZW50WFxyXG4gICAgICAgIEBtb3VzZVkgPSBlLmNsaWVudFlcclxuXHJcbiAgICBvblJlc2l6ZTogKGUpID0+XHJcblxyXG5cclxuICAgICAgICBAJGVsLmZpbmQoJy5oYW5kbGUnKS5jc3NcclxuICAgICAgICAgICAgaGVpZ2h0OiAoJCh3aW5kb3cpLmhlaWdodCgpIC8gJChcInNlY3Rpb25cIikuaGVpZ2h0KCkgKSAqICQod2luZG93KS5oZWlnaHQoKVxyXG5cclxuICAgICAgICBAdXBkYXRlSGFuZGxlKEBwb3NpdGlvbilcclxuXHJcblxyXG4gICAgaGlkZVNjcm9sbGJhcjogPT5cclxuICAgICAgICBpZiBAaGlkZVRpbWVvdXQ/XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChAaGlkZVRpbWVvdXQpXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIEBoaWRlVGltZW91dCA9IHNldFRpbWVvdXQgKD0+XHJcbiAgICAgICAgICAgIGlmIEBtb3VzZVkgPiA3MlxyXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjUgLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9BbHBoYTogMFxyXG4gICAgICAgICAgICApICwgMjAwMFxyXG4gICAgICAgIFxyXG5cclxuICAgIHNob3dTY3JvbGxiYXI6ID0+XHJcbiAgICAgICAgVHdlZW5NYXgudG8gQCRlbCAsIC41ICxcclxuICAgICAgICAgICAgYXV0b0FscGhhOiAuNVxyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNjcm9sbEJhciIsIlxyXG5cclxuY2xhc3MgU2hhcmVyXHJcblxyXG4gICAgXHJcbiAgICBTaGFyZXIuaW5pdEZhY2Vib29rID0gLT5cclxuICAgICAgICBGQi5pbml0IFxyXG4gICAgICAgICAgICBhcHBJZDpcIjIxNTIyNDcwNTMwNzM0MVwiXHJcbiAgICAgICAgICAgIGNoYW5uZWxVcmw6XCIvY2hhbm5lbC5odG1sXCJcclxuICAgICAgICAgICAgc3RhdHVzOiB0cnVlXHJcbiAgICAgICAgICAgIHhmYmw6IHRydWVcclxuXHJcblxyXG4gICAgICAgIFxyXG4gICAgXHJcbiAgICBTaGFyZXIuc2hhcmVUd2l0dGVyID0gKHNoYXJlTWVzc2FnZSwgIHVybCwgaGFzaHRhZ3MpIC0+XHJcbiAgICAgICAgdGV4dCA9IHNoYXJlTWVzc2FnZVxyXG4gICAgICAgIGhhc2h0YWdzID0gXCJcIlxyXG4gICAgICAgIHVybCA9IHVybFxyXG4gICAgICAgIHR3VVJMID0gXCJodHRwczovL3R3aXR0ZXIuY29tL2ludGVudC90d2VldD90ZXh0PVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpICsgXCImdXJsPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHVybClcclxuICAgICAgICBzdHIgKz0gXCImaGFzaHRhZ3M9XCIgKyBoYXNodGFncyAgaWYgaGFzaHRhZ3NcclxuICAgICAgICBAb3BlblBvcHVwIDU3NSwgNDIwLCB0d1VSTCwgXCJUd2l0dGVyXCJcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVGYWNlYm9vayA9IChuYW1lLCAgY2FwdGlvbiAsZGVzY3JpcHRpb24gLCBsaW5rICwgcGljdHVyZSkgLT5cclxuXHJcbiAgICAgICAgRkIudWlcclxuICAgICAgICAgICAgbWV0aG9kOlwiZmVlZFwiXHJcbiAgICAgICAgICAgIGxpbms6bGlua1xyXG4gICAgICAgICAgICBwaWN0dXJlOnBpY3R1cmVcclxuICAgICAgICAgICAgbmFtZTogbmFtZVxyXG4gICAgICAgICAgICBjYXB0aW9uOmNhcHRpb25cclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ZGVzY3JpcHRpb25cclxuICAgICAgICBcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVHb29nbGUgPSAodXJsKSAtPlxyXG5cclxuICAgICAgICBAb3BlblBvcHVwIDYwMCwgNDAwICwgXCJodHRwczovL3BsdXMuZ29vZ2xlLmNvbS9zaGFyZT91cmw9XCIrdXJsLCBcIkdvb2dsZVwiXHJcblxyXG4gICAgU2hhcmVyLnNoYXJlUGludGVyZXN0ID0gKHVybCAsIGRlc2NyaXB0aW9uLCBwaWN0dXJlKSAtPlxyXG5cclxuICAgICAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uLnNwbGl0KFwiIFwiKS5qb2luKFwiK1wiKVxyXG4gICAgICAgIEBvcGVuUG9wdXAgNzgwLCAzMjAsIFwiaHR0cDovL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0je2VuY29kZVVSSUNvbXBvbmVudCh1cmwpfSZhbXA7ZGVzY3JpcHRpb249I3tkZXNjcmlwdGlvbn0mYW1wO21lZGlhPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHBpY3R1cmUpfVwiXHJcblxyXG5cclxuICAgIFNoYXJlci5lbWFpbExpbmsgPSAoc3ViamVjdCwgYm9keSkgLT5cclxuICAgICAgICB4ID0gQG9wZW5Qb3B1cCAxICwgMSwgXCJtYWlsdG86JnN1YmplY3Q9I3tlbmNvZGVVUklDb21wb25lbnQoc3ViamVjdCl9JmJvZHk9I3tlbmNvZGVVUklDb21wb25lbnQoYm9keSl9XCJcclxuICAgICAgICB4LmNsb3NlKClcclxuXHJcbiAgICBTaGFyZXIub3BlblBvcHVwID0gKHcsIGgsIHVybCwgbmFtZSkgLT5cclxuICAgICAgICB3aW5kb3cub3BlbiB1cmwsIG5hbWUsIFwic3RhdHVzPTEsd2lkdGg9XCIgKyB3ICsgXCIsaGVpZ2h0PVwiICsgaCArIFwiLGxlZnQ9XCIgKyAoc2NyZWVuLndpZHRoIC0gdykgLyAyICsgXCIsdG9wPVwiICsgKHNjcmVlbi5oZWlnaHQgLSBoKSAvIDJcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlciIsImdsb2JhbHMgPSByZXF1aXJlICcuL2NvbS9nbG9iYWwvaW5kZXguY29mZmVlJ1xuUGFya3NMaXN0ID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9QYXJrc0xpc3QuY29mZmVlJ1xuRHJhZ2dhYmxlR2FsbGVyeSA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvRHJhZ2dhYmxlR2FsbGVyeS5jb2ZmZWUnXG5GYWRlR2FsbGVyeSA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvRmFkZUdhbGxlcnkuY29mZmVlJ1xuVGlja2VyTGlzdCA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvVGlja2VyTGlzdC5jb2ZmZWUnXG5IZWFkZXJBbmltYXRpb24gPSByZXF1aXJlICcuL2NvbS9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUnXG5Ib21lUGFnZSA9IHJlcXVpcmUgJy4vY29tL3BhZ2VzL0hvbWVQYWdlLmNvZmZlZSdcblxuJChkb2N1bWVudCkucmVhZHkgLT5cblxuICAgICMkKFwiI2NvbnRlbnRcIikuY3NzKFwiaGVpZ2h0XCIgLCAkKCcjY29udGVudCcpLmhlaWdodCgpKVxuXG5cbiAgICBcbiAgICBob21lID0gbmV3IEhvbWVQYWdlXG4gICAgICAgIGVsOiBcImJvZHlcIlxuXG4gICAgJCgnLmNpcmNsZScpLm9uICdjbGljaycsIC0+XG4gICAgICAgIHRhcmdldCA9ICQodGhpcylcbiAgICAgICAgVHdlZW5NYXguZnJvbVRvKHRhcmdldCwgLjUsIHsgcm90YXRpb25ZOiA3MjB9LCB7cm90YXRpb25ZOiAwfSlcblxuXG5cblxuIl19
