//1. http://api.jquery.com/jQuery.Callbacks/
//2. http://www.cnblogs.com/littledu/articles/2811728.html
//3. http://www.cnblogs.com/aaronjs/p/3342344.html
//4. http://www.cnblogs.com/snandy/archive/2012/11/15/2770237.html

//jQuery.Callbacks()的核心思想是 Pub/Sub 模式，建立了程序间的松散耦合和高效通信。

// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred) 确保回调函数仅执行一次
 *	
 *	function fn() {
    	console.log(1)
	}
	var callbacks = $.Callbacks('once');
	callbacks.add(fn);
	callbacks.fire(); // 打印1
	callbacks.fire(); // fn不再触发
 *
 *
 *	memory:			will keep track of previous values and will call any callback added 记忆callbacks
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	function fn1() {
    console.log(1)
	}
	function fn2() {
	    console.log(2)
	}
	var callbacks = $.Callbacks('memory');
	callbacks.add(fn1);
	callbacks.fire(); // 必须先fire
	callbacks.add(fn2); // 此时会立即触发fn2
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list) 去除重复的回调函数
 *
 *	function fn1() {
    console.log(1)
	}
	function fn2() {
	    console.log(2)
	}
	var callbacks = $.Callbacks('unique');
	callbacks.add(fn1);
	callbacks.add([fn1, fn2]); // 再次添加fn1
	callbacks.fire(); // output 1, 2
 *
 *		
 *
 *	stopOnFalse:	interrupt callings when a callback returns false 回调函数返回false时中断回调队列的迭代
 *
 *	function fn1() {
    console.log(1)
	}
	function fn2() {
	    console.log(2)
	    return false // 注意这里
	}
	function fn3() {
	    console.log(3)
	}
	var callbacks = $.Callbacks('stopOnFalse');
	callbacks.add(fn1, fn2, fn3);
	callbacks.fire(); // output 1,2
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data; //是否配置了记忆功能
			
			//这里的memory只要曾经有过触发，那么再add的时候，就会自动的触发之，并且其中存的是 上一次fire是的args:::[context,args]
			fired = true; //表示已经被触发了
			firingIndex = firingStart || 0; //开始触发的索引
			firingStart = 0;
			firingLength = list.length; //回调列表的长度 
			firing = true; //正在触发
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				
				//data is a array::: [context,args]
				//如果配置了stopOnFalse，并且返回false，那么break循环
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) { 
					memory = false; // To prevent further calls using add 废除记忆功能
					break;
				}
			}
			firing = false; // 触发完毕
			if ( list ) {
				if ( stack ) { // 没有配置once的时候
					if ( stack.length ) { //执行完回调后，看一下stack是否有回调，有拿出来执行
						fire( stack.shift() );
					}
				} else if ( memory ) { //如果没有stack，证明传了once，这里的Callbacks会是这样：$.Callbacks('once memory')
					list = [];
				} else {
					self.disable(); //当是$.Callbacks('once')的时候，将list置为undefined
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					
					//这里用了一个立即执行的add函数来添加回调
                    //直接遍历传过来的arguments进行push
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) { 
								//假如传过来的参数为数组或array-like
								//则继续调用添加，从这里可以看出add的传参可以有add(fn),add([fn1,fn2]),add(fn1,fn2)
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			//清空数组中的所有的回调函数
			//清空数组的方式 see:::http://www.cnblogs.com/snandy/archive/2011/04/04/2005156.html
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) { // is option.once is true,stack is false
					
					//1.如果$.Callbacks('once'),那么stack为false
					//2.如果没有加入once参数，那么stack为[]
					
					//如果没有触发过  或者  没有配置once
					
					if ( firing ) { //如果当前的回调队列正在触发，那么将argspush到stack中
						stack.push( args );
					} else { //否则，触发之
						fire( args ); 
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			// 判断是否触发过
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
