var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, ret, self,
			len = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		ret = [];
		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, this[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

    //http://www.w3school.com.cn/jquery/traversing_closest.asp
	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					cur = ret.push( cur );
					break;
				}
			}
		}

		return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

//供next和prev方法调用，逐个循环，直到找到nodeType为1的节点
function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
        /**
         * nodeType 11 是DOCUMENT FRAGMENT
         * http://www.cnblogs.com/hhstuhacker/p/NodeType.html
         */
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem ); //调用sibling，从第一个开始，跳过当前elem
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild ); //将第一个子元素作为第一个
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ? // 如果当前元素是个iframe
			elem.contentDocument || elem.contentWindow.document : //IE8+和其他浏览器支持contentDocument，所有浏览器支持elem.contentWindow.document
			jQuery.merge( [], elem.childNodes ); // 返回childNodes
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

        /**
         *       var runtil = /Until$/,
                 rparentsprev = /^(?:parents|prev(?:Until|All))/,
                 isSimple = /^.[^:#\[\.,]*$/,
                 rneedsContext = jQuery.expr.match.needsContext,
                 // methods guaranteed to produce a unique set when starting from a unique set
                 guaranteedUnique = {
                    children: true,
                    contents: true,
                    next: true,
                    prev: true
                 };
         */

        //检测函数名称是否以Until结尾（parentsUntil，nextUntil，prevUntil），修正selector
        /**
         * 1.以Until结尾的方法
         * $('#box').parentsUntil(document,'#abc'); //第一个是until，第二个是selector哦
         * 2.不以Until结尾的方法
         * $('#box').parents('#abc'); //只有一个参数，selector
         *
         * 下面语句主要是处理不以Until结尾的方法，将until赋值给selector
         */
		if ( !runtil.test( name ) ) {
			selector = until;
		}

        // 对找到的元素进行符合selector过滤，最终返回的都是符合selector的
		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

        /**
         * 如果元素就一个，不用去重了就，并且children，contents，next，prev是唯一的，不需要去重
         * 如果不满足上述条件，就调用jQuery.unique进行去重
         */
		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

        /**
         * /^(?:parents|prev(?:Until|All))/
         *
         * 对parents,prevUntil,prevAll返回的元素进行反转，如果只有一个元素，就算了
         */
		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

        //用找到的元素，重新构造jQuery对象并返回
		return this.pushStack( ret );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

    /**
     *
     * @param elem 要遍历的元素
     * @param dir 可取parentNode，nextSibling，previousSibling
     * @param until 可选的选择器表达式，表示终止查找的位置
     * @returns {Array}
     */
	dir: function( elem, dir, until ) {
		var matched = [], // 存放查询到的结果
			cur = elem[ dir ];

        /**
         * nodeType为9的是document
         * until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )
         * 相当于：
         * !(until !== undefined && cur.nodeType === 1 && jQuery( cur ).is( until ))
         * 这里处理 cur==until的可能，如果遍历到util的时候，就跳出while了
         */
		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) { // 如果是Node节点，那就push进结果集
				matched.push( cur );
			}
			cur = cur[dir]; // 改变cur的指向
		}
		return matched;
	},

    /**
     *  查找一个元素之后的所有兄弟元素，但是不包括elem
     * @param n 进行查找的元素
     * @param elem 将elem剔除
     * @returns {Array}
     */
	sibling: function( n, elem ) {
		var r = [];

        //一直循环到最后一个，跳过elem，push进结果集
		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}

/**
 * http://www.cnblogs.com/nuysoft/archive/2011/11/29/2266916.html
 **/