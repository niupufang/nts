define([
	"../core",
	"../var/rnotwhite",
	"./accepts"
], function( jQuery, rnotwhite ) {

    /**
     * jQuery在内部会new两个Data,dataUser dataPriv,dataUser用于用户缓存数据，dataPriv用于jQuery内部
     *
     *      Data对象的数据结构如下：
     *      expando: jQuery.expando + 随机数（这个值，是一旦new就固定的，不会改变的）
     *      cache:
     *      {
     *          uid1:{},
     *          uid2:{},
     *          uid3:{},
     *          uid4:{},.....
     *      } --> cache保存了所有的缓存数据
     *      ------------------------
     *      key方法思路：->> 获取某个元素或者对象上面的this.expando--> uid 并进行一些初始化动作
     *          1.先判断element[this.expando] 是否有值
     *          2.如果没值，就弄一个element[this.expando] = uuid++; //uuid为自增加
     *          3.再看this.cache[element[this.expando]] 是否有值，没有的话，初始化为空对象
     *          4.返回element[this.expando]
     *      ------------------------
     *      设置element上的缓存思路：
     *          1.用key方法获取uid，取出this.cache[uid]
     *          2.参数的判定，吧啦吧啦
     *
     *
     *
     */

function Data() {
	// Support: Android<4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

    //每个Data都有一个单独的expando
	this.expando = jQuery.expando + Math.random();
}

// uid相当于一个静态变量，这就保证，无论new多少个Data，每个uid都是不一样的
Data.uid = 1;
Data.accepts = jQuery.acceptData; // 是否可以接受数据

Data.prototype = {
    /**
     * 获得某个元素或者对象上的expando标识 element[this.expando]
     * @param owner 元素或者对象
     * @returns {Number} 实际上是存入的uid
     */
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
        // 判定是否可以赋值
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
            // 检测是否Element[expando]
            // unlock 其实相当于一把钥匙吧
			unlock = owner[ this.expando ];

		// If not, create one
        // 如果没有，新建一个
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
                //如下代码相当于：owner[this.expando] = unlock;
                //但是如果element不能遍历，不能写入，就会报错
                //然后就用jQuery.extend( owner, {this.expando:unlock} );

				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android<4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
        // 如果this.cache上还没有这个unlock，那就初始化为一个空对象
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},

    /**
     * 为一个元素或者对象设置缓存数据
     * @param owner 元素或者对象
     * @param data 属性
     * @param value 值
     * @returns {Data.cache}
     */
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
            /**
             * 先获取当前元素上的this.expando属性（uid）
             * 如果这个元素上不存的话，key方法会做一些初始化动作
             */
			unlock = this.key( owner ),
            // 获得cache数据
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
        // 如果data是个字符串，说明是个设置动作，设置！
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
        // 如果cache是个空对象（没有被设置过缓存数据，或者曾经设置过被删除了），直接赋值
        // 如果cache有值的话，一个一个的赋值进去
		} else {
			// Fresh assignments by object are shallow copied
			if ( jQuery.isEmptyObject( cache ) ) {
                // 这里相当于 this.cache[unlock] = data;
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}

        // 返回的值该element上的所有cache
		return cache;
	},

    /**
     * 获取某个元素或者对象上的缓存数据
     * @param owner
     * @param key
     * @returns {*}
     */
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

        // 如果没有key，那么返回所有，如果有key，获取cache上key的值
		return key === undefined ?
			cache : cache[ key ];
	},

    // 读写方法，自动判断是读还是写，好智能的样子
    // 这就是所谓的魔术方法，现代JS的魔法
	access: function( owner, key, value ) {
		var stored;
		// In cases where either:
		//
		//   1. No key was specified key没有指定
		//   2. A string key was specified, but no value provided key指定了，但是value没有指定

        //   上面两种情况，是要获取缓存数据
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},

    //移除缓存数据
	remove: function( owner, key ) {
		var i, name, camel,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) { // 如果key为空，移除所有，让this.cache[unlock] = {}
			this.cache[ unlock ] = {};

		} else {

            // 本来一句话 delete cache[key]; 就能搞定的，不过弄了这么多，
            // 是为了判断key上数组的情况和驼峰兼容的情况，并且考虑到数组中的驼峰啊之类的
            // 这样做，更加强大jquery啊

			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
                // 如果是个数组，转换为驼峰命名，concat起来，name是个数组
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				if ( key in cache ) {

                    // 如果key在cache中，直接就行了，加入camel
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace

                    // 如果不在，就要判断 key = 'someattr otherattr atrigg' 的情况了，用心良苦，真是的！
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

            //终于弄完了，写个循环，还那么省比特，呵呵呵呵呵
			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},

    /**
     * 判定owner上面是否有缓存数据
     * @param owner
     * @returns {boolean}
     */
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},

    // http://fanyi.baidu.com/#en/zh/discard
    // discard 丢弃，抛弃
    // 把owner上面所有的缓存数据清空
	discard: function( owner ) {
		if ( owner[ this.expando ] ) {
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};

return Data;
});

// 参考：
// http://www.cnblogs.com/aaronjs/p/3370176.html
// 1.x缓存系统 http://www.cnblogs.com/hhstuhacker/p/inside_jquery_source_data.html

// http://www.cnblogs.com/charling/p/3479345.html
// http://www.cnblogs.com/charling/p/3481156.html
// http://www.cnblogs.com/charling/p/3482957.html
// http://www.cnblogs.com/charling/p/3485873.html
