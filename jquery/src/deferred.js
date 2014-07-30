//1. http://www.ruanyifeng.com/blog/2011/08/a_detailed_explanation_of_jquery_deferred_object.html
//2. http://www.cnblogs.com/littledu/articles/2813051.html
//3. http://www.cnblogs.com/aaronjs/p/3356505.html

/**
 *
 * callbacks中，disable相当于把callback废掉了，不能add也不能fire
 * lock相当于不能...
 *
 * deferred.resolve() --> doneList.fire()
 * 1.将state设置成resolved
 * 2.将failList废掉
 * 3.将notifyList锁住
 * 4.执行done方法add进来的函数 -->doneList.add
 *
 * deferred.reject() --> failList.fire()
 * 1.将state设置成rejected
 * 2.将doneList废掉
 * 3.将notifyList锁住
 * 4.执行fail方法add进来的函数 --> failList.add
 *
 * deferred.notify() --> notifyList.fire()
 * 1.执行progress方法add进来的函数 --> notifyList.add
 *
 * deferred.always(fn) -->
 * 1.doneList.add(fn)
 * 2.failList.add(fn)
 *
 * deferred.state 返回当前的state值
 *
 *  doneList = $.Callbacks("once memory");
 *
 *  doneList.add(
 *      function () {
 *          state = 'resolved';
 *      },
 *      failList.disable,
 *      notifyList.lock
 *  );
 *
 *  failList = $.Callbacks("once memory");
 *
 *  failList.add(
 *      function () {
 *          state = 'rejected';
 *      },
 *      doneList.disable,
 *      notifyList.lock
 *  );
 *
 *  notifyList = $.Callbacks("memory");
 *
 *
 *  promise =
 *  {
 *      done:doneList.add,
 *      fail:failList.add,
 *      notify:notifyList.add
 *
 *      ---->自带
 *
 *      state:
 *      always:
 *      then:
 *      promise
 *  };
 *
 *  deferred =
 *  {
 *      resolveWith: doneList.fireWith,
 *      resolve: deferred.resolveWith,
 *      rejecteWith: failList.fireWith,
 *      rejecte: deferred.rejecteWith
 *
 *      -->>>>>promise赋值而来
 *
 *      done:doneList.add,
 *      fail:failList.add,
 *      notify:notifyList.add
 *  };
 *
 *  apply(deferred,promise);
 *
 *
 *
 */


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
                /**
                 * 在jQuery1.7，不是这样实现的，--> deferred.done(doneCallback).fail(failCallback).progress(progressCallback);
                 *
                 * 1.构建一个新的deferred对象，返回受限的promise对象
                 * 2.给父deferred对象的[ done | fail | progress ]方法都增加一个过滤函数的方法
                 *
                 *
                 * $.Deferred(fn) fn(deferred,deferred);
                 *
                 */
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {

                        // newDefer可以看作是：newDefer = $.Deferred(fn-->jQuery.each);

						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer

                            //deferred.done(function () {.....});
                            //deferred其实就是根级父对象的引用,所以就嵌套再深,其实都是调用了父对象deferred[ done | fail | progress 执行add罢了

							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
                // If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;
			
			//效果如下：
			//promise.done = $.Callbacks("once memory").add
			//promise.fail = $.Callbacks("once memory").add
			//promise.progress = $.Callbacks("memory").add

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}
			
			//promise.done.add(state,promise.fail.disable,promise.progress.lock);
			//promise.fail.add(state,promise.done.disable,promise.progress.lock);
			
			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		
		//将promise合并到deferred
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
