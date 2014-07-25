define([
	"./core",
	"./var/rnotwhite",
	"./core/access",
	"./data/var/dataPriv",
	"./data/var/dataUser"
], function( jQuery, rnotwhite, access, dataPriv, dataUser ) {

    /**
     * 下面这段注释，是jQuery2.x的缓存系统的目标
     * 大意如下：
     * 1.确保2.x的缓存系统API兼容1.9.x的（语义和接口）
     * 2.通过简化储存路径为统一的方式来提高维护性
     * 3.使用相同的机制来实现私有和共有数据
     * 4.不再混合私有数据和用户数据
     * 5.不再用户对象上添加自定义属性
     * 6.方便以后平滑的利用WeakMap对象进行升级
     */

    /**
     * dataUser = new Data()
     * dataPriv = new Data()
     */

//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

    /**
     * 如果dataUser中已经有当前key的data存在，那么直接返回data
     * 如果dataUser中不存在当前key的data，那么就获取element的data-key属性
     * 如果是空，就算了，如果是个字符串，做一系列的处理，然后设置到dataUser中
     */
function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase(); //反驼峰！
		data = elem.getAttribute( name ); //获取elem的attribute

        // 对获取到的值做处理：
        /**
         * 1.如果不是字符串，直接赋值为undefined
         * 2.如果是字符串，就做如下对应
         *     a."true" --> true
         *     b."false"--> false
         *     c."null" --> null
         *     d."123"  --> 123
         *     e.JSON串 --> object or array
         *     f: String --> string
         *
         * 3.最后，赋值到dataUser的缓存系统，因为每个元素只会进入一次！以后不会再变了
         */
		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

    /**
     * 下面这一堆方法，都是空壳，都调用了 dataUser和datapriv的方法
     */
jQuery.extend({
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
            elem = this[ 0 ],
            attrs = elem && elem.attributes;

		// Gets all values 获取所有的缓存数据
		if ( key === undefined ) {
			if ( this.length ) { // 如果this有多个，只取第一个
				data = dataUser.get( elem ); // 获取用户数据的data

                // !dataPriv.get( elem, "hasDataAttrs" )
                // 这说明jQuery还没有解释过该元素上面的data-*属性
                // 如果解释过了，会返回true的

                /**
                 * 这段代码主要是因为：
                 * HTML5加入了一种data-*的缓存机制
                 * <div data-toggle-something-abc="something......">
                 */
				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
                                //如果是已data-开头，那么就驼峰式data-后面的字符
                                // <div data-toggle-something-abc="something......">
                                // name = toggleSomethingAbc
								name = jQuery.camelCase( name.slice(5) );

                                //name: toggleSomethingAbc
                                // data[name] 是用户缓存中的toggleSomethingAbc属性
                                //这个函数就是解析HTML5的dataset的，如果有值，donothing
                                //如果没值，取出HTML5的dataset，设置到dataUser中
                                //并且由于上面的判断，该函数在每个element上只会执行一次
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
                    /**
                     * 赋值该元素的私有缓存系统，说：我已经解析过我自己的HTML5标准属性啦，下次就不要再来了哦
                     */
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
        /**
         * 想要设置多个值，那就遍历递归调用
         */
		if ( typeof key === "object" ) {
			return this.each(function() {
				dataUser.set( this, key );
			});
		}

		return access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = dataUser.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = dataUser.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				dataUser.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					dataUser.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			dataUser.remove( this, key );
		});
	}
});

return jQuery;
});
