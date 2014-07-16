/**
 * var o = {name:'lonelyclick'};
 * 1、$(o).data('seomthing','abc');
 * 这种情况下，--> {name:'lonelyclick',$.expando:{data:{seomthing:'abc'},toJSON:$.noop}}
 *
 * $(o).data() --> 就会取 cache[id].data ，cache就是o本身，id是$.expando
 *
 * 2、var box = $('#box');
 *    box.data({a:'b'});
 *
 *    jQuery.cache = {1:{data:{a:'b'},parsedAttrs:true}};
 *    box.setAttribute($.expando,1);
 *
 *    这两个1是对应的
 *
 *    box.data() 取得也是cache[id].data
 *
 *
 * 综合：
 *    1、如果传入的是一个节点 nodeType === 1 or nodeType === 9
 *    jQuery.cache --> {
 *                         1: --> 这个id对应的是document.getElementById('box')[$.expando]
 *                         {
 *                              data:{a:'b',c:'ddddd'}, -->这里是用户自己设置的数据
 *                              parseAttr: true --> 这里是jQuery内部设置的数据
 *                         },
 *                         2: --> 这个id对应的是document.getElementById('box')[$.expando]
 *                         {
 *                              data:{a:'b',c:'ddddd'}, -->这里是用户自己设置的数据
 *                              parseAttr: true --> 这里是jQuery内部设置的数据
 *                         }
 *                     }
 *    2、如果传入的是一个对象，该对象将会被改写
 *
 *    {
 *      name: 'lonelyclick',
 *      age: 22,
 *      $.expando:
 *      {
 *          data: {someattr: 'somevalue',ddd:'eee'} --> data是用户自定义设置的
 *          toJSON: $.noop --> 这里是为了防止互相引用,
 *          someInnerJqueryAttribute: '' --> 这里会是jQuery内部的一些属性，但是目前还没有用
 *      }
 *    }
 *
 *    3、html的data-*属性，会被jQuery自动整合到cache[id].data属性中
 *
 */





var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){

	//如果elem元素不能附加值，退出
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	// ## form core.js
    // Unique for each copy of jQuery on the page
    // Non-digits removed to match rinlinejQuery
    // expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),
    // 每个Jquery都有单独的一个expando

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		// 由于IE6,7不能自动回收再DOM上的引用，所以要对DOM和JS对象区别对待
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		// 只有DOM需要全局的缓存变量，对象就直接插入值了
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
        // 如果是节点，document.getElementById('box')[$.expando]
        // 如果是个对象，{name:'abc',age:11}[$.expando],如果有值，则返回$.expando
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

		// 什么时候会出现id为undefined的时候？
		// internalData(document.createElement('div'),'namea',...)
		// internalData({});

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
    // 如果有name而没有data，说明这是一个读取的动作
    // 但是没有得到id，获取cache[id]中啥都没有，在获取用户数据的时候cache[id].data啥都木有，就返回空
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		// 如果是DOM元素，则取得一个唯一的ID值
		if ( isNode ) {
			id = elem[ internalKey ] = core_deletedIds.pop() || jQuery.guid++;
        } else {
			id = internalKey; //这是jQuery.expando
		}
	}

	if ( !cache[ id ] ) {
		// Avoid exposing jQuery metadata on plain JS objects when the object
        // is serialized using JSON.stringify
        // 避免只用JSON.stringify(cache[id]) 所带来的循环引用
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	// 也可以穿一个jQuery.data，浅拷贝过来

	// jQuery.data({},{name:'hhstuhacker',age:31})
	// cache[id] = {data:{name:'hhstuhacker',age:31}};

	// cache[ id ]存入的是jQuery的内部数据
	// cache[ id ].data 存入的是用户数据
	// 若果pvt为真，就拷贝到cache[ id ]里
	// 若果pvt为false，就拷贝到cache[ id ].data 里

	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name ); //直接拷贝，内部使用
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name ); //直接拷贝data
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.

	// jQuery.cache = {jQuery.expando: {data:{}}};
	// 这里是为了防止内部数据跟用户定义的数据项混淆，内部数据定义在jQ.cache里，用户定义数据在jQ.cache.[id] 里

	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	// 分情况了，如果传入了键值对，就设置之
	// 将camelCase驼峰
	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	// 不管是否读取还是设置缓存，都会返回数据
	// 先尝试直接获取，如果获取不成功，就尝试驼峰式获取
	// 如果连name都没有指定，就获取整个thisCache对象
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) { //如果elem元素不能附加值，退出
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	// 如果没有得到cache[ id ] 那就不进行了
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			// $.removeData(element,['title','age','createTime']);
			// $.removeData(element,'title age createTime');
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					// 检测是否驼峰式在其中，如果不在，将其split
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );

				// 将不驼峰和驼峰的全部删除
			}

			//删除之
			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed

			// 如果说删除过后，cache[id]或者cache[id].data 都是空了，那么咱们需要清理下一步吧？
			if ( pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	// 如果是用户使用的话，清空cache[id].data
	// 如果cache [ id ] 不是空的话，结束该函数
	// 如果cahce [ id ] 是空的话，还是下一步的清理行动啊
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// window.window === window;
	// isWindow: function (o) {return o.window === window;}
	// cache != cache.window 表示不是window

	// Destroy the cache
	// 如果是个DOM节点，那么cleanData
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// ses: http://www.cnblogs.com/enein/archive/2012/08/23/2651312.html
	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	// 经测试，在IE6,7,8下面，var div = document.createElement('div') delete div.test;
	// 是报错的 而 jQuery.support.deleteExpando 正是这种检测
	} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	// 这几个元素不能有附加值
	noData: {
		"applet": true,
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	// 内部适用，这里设置pvt为true，返回内部数据，定位到cache[id]这一层
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	// 内部适用，这里设置pvt为true，返回内部数据，定位到cache[id]这一层
	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		// Do not set data on non-element because it will not be cleared (#8335).
		// 如果是个dom节点，并且不是element也不是document，那就表示不能被附加数据
		// see:http://www.cnblogs.com/hhstuhacker/p/NodeType.html
		if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
			return false;
		}

		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

        // nodes accept data unless otherwise specified; rejection can be conditional
        // 如果是embed或者applet，或者是flash元素，就返回false
        // about falsh:: http://www.w3help.org/zh-cn/causes/HO8001
        return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			data = null,
			i = 0,
			elem = this[0];

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		// 如果key为undefined，那就表示要取得所有的data
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem ); //默认取第一个

				// 看看cache内部是否已经解析过该DOM了，parsedAttrs
				// 如果没有，得到属性列表

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[i].name;

						if ( name.indexOf("data-") === 0 ) {
							name = jQuery.camelCase( name.slice(5) );

							//这里的data[ name ]为空值
							dataAttr( elem, name, data[ name ] );
						}
					}

					//标记已经解析过了
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		// 如果是个对象，递归调用之
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each(function() {
				jQuery.data( this, key, value );
			}) :

			//$('.color-box').data('someone','new');

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;

			//$('#box').data('dataFirst');

			// <div data-data-first="something....."></div>
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	//这个函数，主要是处理HTML5的问题
	if ( data === undefined && elem.nodeType === 1 ) {

		// 驼峰反转
		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		// rbrace 对象或者数组正则

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

			//设置进去

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		// 如果cache.data 为空，跳过本次循环，不判断了
		// 如果不跳过啊，就走到下面了吧，name !== data 杠杠的
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}

		//toJSON是内置的，如果看到其他name，就不为空
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
