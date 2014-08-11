var nodeHook, boolHook,
    rclass = /[\t\r\n]/g,
    rreturn = /\r/g,
    rfocusable = /^(?:input|select|textarea|button|object)$/i,
    rclickable = /^(?:a|area)$/i,
    rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
    ruseDefault = /^(?:checked|selected)$/i,
    getSetAttribute = jQuery.support.getSetAttribute,
    getSetInput = jQuery.support.input;

jQuery.fn.extend({
    attr: function (name, value) {
        return jQuery.access(this, jQuery.attr, name, value, arguments.length > 1);
    },

    removeAttr: function (name) {
        return this.each(function () {
            jQuery.removeAttr(this, name);
        });
    },

    prop: function (name, value) {
        return jQuery.access(this, jQuery.prop, name, value, arguments.length > 1);
    },

    removeProp: function (name) {
        name = jQuery.propFix[ name ] || name; //先取钩子
        return this.each(function () {
            // try/catch handles cases where IE balks (such as removing a property on window)
            // delete window['abc'] // IE6~8 对象不支持此操作
            try {
                this[ name ] = undefined;
                delete this[ name ];
            } catch (e) {
            }
        });
    },

    /**
     * 向被选元素添加一个或多个类
     * @param value 'aclass' 'aclass bclass dclass',function () {}
     */
    addClass: function (value) {
        var classes, elem, cur, clazz, j,
            i = 0,
            len = this.length,
            proceed = typeof value === "string" && value; //检测value是否为字符串

        /**
         * $('#box').addClass(function (elem,oldClassName) {
         *      return 'm-general-abc';
         * });
         *
         * 如果是个函数，那么逐个遍历现有元素，递归addClass方法
         */
        if (jQuery.isFunction(value)) {
            return this.each(function (j) {
                jQuery(this).addClass(value.call(this, j, this.className));
            });
        }

        // 如果是个字符串，那就执行正真的添加
        if (proceed) {
            // The disjunction here is for better compressibility (see removeClass)
            classes = ( value || "" ).match(core_rnotwhite) || []; //将value用空格分开成一个数组 classes = value.split(/\s+/);

            for (; i < len; i++) { //遍历所有的元素
                elem = this[ i ];
                cur = elem.nodeType === 1 && ( elem.className ? //检测是否为HTMLElement
                    ( " " + elem.className + " " ).replace(rclass, " ") : //去掉换行什么的，两边加上空格，防止出错
                    " " //如果没有class的话，那就等于一个空格
                    );

                if (cur) {
                    j = 0;
                    while ((clazz = classes[j++])) { //遍历所有的classes
                        if (cur.indexOf(" " + clazz + " ") < 0) { //如果没有的话，才加入，如有，跳出了就
                            cur += clazz + " ";
                        }
                    }
                    elem.className = jQuery.trim(cur); //设置className，并且trim一下

                }
            }
        }

        // 链式结构,返回被封装的元素
        return this;
    },

    removeClass: function (value) {
        var classes, elem, cur, clazz, j,
            i = 0,
            len = this.length,
            proceed = arguments.length === 0 || typeof value === "string" && value;

        if (jQuery.isFunction(value)) {
            return this.each(function (j) {
                jQuery(this).removeClass(value.call(this, j, this.className));
            });
        }
        if (proceed) {
            classes = ( value || "" ).match(core_rnotwhite) || [];

            for (; i < len; i++) {
                elem = this[ i ];
                // This expression is here for better compressibility (see addClass)
                cur = elem.nodeType === 1 && ( elem.className ?
                    ( " " + elem.className + " " ).replace(rclass, " ") : //去掉换行什么的，两边加上空格，防止出错
                    ""
                    );

                if (cur) {
                    j = 0;
                    while ((clazz = classes[j++])) {
                        // Remove *all* instances
                        while (cur.indexOf(" " + clazz + " ") >= 0) {
                            cur = cur.replace(" " + clazz + " ", " "); //如果存在，就删除
                        }
                    }
                    elem.className = value ? jQuery.trim(cur) : ""; //重新设置，如果没了，就设为空
                }
            }
        }

        // 链式结构,返回被封装的元素
        return this;
    },

    /**
     * 设置或移除被选元素的一个或多个类进行切换
     * 该方法检查每个元素中指定的类。如果不存在则添加类，如果已设置则删除之。这就是所谓的切换效果。
     * @param value String:类名  Function:规定返回需要添加或删除的一个或多个类名的函数$(selector).toggleClass(function(index,class,switch),switch)
     * @param stateVal 规定是否添加(true)或移除(false)类 为true不存在,则添加.为false,已存在,则删除
     * @returns {*}
     */
    toggleClass: function (value, stateVal) {
        var type = typeof value,
            isBool = typeof stateVal === "boolean";

        /**
         * $('#box').toggleClass(function (elem,oldClassName，stateVal) {
         *      return 'm-general-abc';
         * });
         */
        if (jQuery.isFunction(value)) {
            return this.each(function (i) {
                jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
            });
        }

        return this.each(function () {
            if (type === "string") {
                // toggle individual class names
                var className,
                    i = 0,
                    self = jQuery(this),
                    state = stateVal,
                    classNames = value.match(core_rnotwhite) || [];

                while ((className = classNames[ i++ ])) { //遍历所有的classNames
                    // check each className given, space separated list

                    //如果stateVal是布尔值，那么就去state，如果不是，就看hasClass是否有
                    //按照逻辑，执行添加或者删除class函数
                    state = isBool ? state : !self.hasClass(className);
                    self[ state ? "addClass" : "removeClass" ](className);
                }

                // Toggle whole class name
                // 如果没有传入type或者type是个布尔值，那么就取当前DOM元素的className属性，用缓存系统将__className__设置成当前的className
                //
            } else if (type === core_strundefined || type === "boolean") {
                if (this.className) {
                    // store className if set
                    jQuery._data(this, "__className__", this.className);
                }

                // If the element has a class name or if we're passed "false",
                // then remove the whole classname (if there was one, the above saved it).
                // Otherwise bring back whatever was previously saved (if anything),
                // falling back to the empty string if nothing was stored.
                // 这里就判断是否value为false，如果是，就将className设置为空，否则，将className从缓存系统里取出来，设置回去
                this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || "";
            }
        });
    },

    /**
     * 检查被选元素是否包含指定的 class
     * @param selector selector 类名
     * @returns {boolean} 返回true表示包含，返回false，表示未包含
     */
    hasClass: function (selector) {
        var className = " " + selector + " ",
            i = 0,
            l = this.length;
        for (; i < l; i++) {
            if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) {
                return true;
            }
        }

        return false;
    },

    val: function (value) {
        var ret, hooks, isFunction,
            elem = this[0];

        /**
         * 如果没有传值，说明是取值 $('#box').val()
         * 1.先通过elem.type或者elem.nodeName取得钩子
         * 2.如果钩子存在，并且钩子的返回值不是undefined，那么返回钩子返回的值
         * 3.如果没有进入钩子，那就简单处理下得到的值，返回之
         */
        if (!arguments.length) {
            if (elem) {
                hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

                if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
                    return ret;
                }

                ret = elem.value;

                return typeof ret === "string" ?
                    // handle most common string cases
                    // 如果ret是个字符串，将字符串去掉回车什么的，返回
                    ret.replace(rreturn, "") :
                    // handle cases where value is null/undef or number
                    // 如果不是字符串，那就看看是不是undefined或者null，如果是返回空字符，如果不是，那就返回ret了
                        ret == null ? "" : ret;
            }

            return;
        }

        isFunction = jQuery.isFunction(value);

        /**
         * 可以传入以下值：
         * $('.box').val(function (index,value) {
         *
         * });
         *
         * $('.box').val([1,2,3,4,5]);
         *
         */
        return this.each(function (i) {
            var val,
                self = jQuery(this);

            //如果不是node节点，返回之
            if (this.nodeType !== 1) {
                return;
            }

            //如果是个函数，执行之
            if (isFunction) {
                val = value.call(this, i, self.val());
            } else {
                val = value;
            }

            // Treat null/undefined as ""; convert numbers to string
            //将null undefined 转换成空字符串
            //将数字转换为字符串
            //转换数组，将数组中的元素全部转换为字符串
            if (val == null) {
                val = "";
            } else if (typeof val === "number") {
                val += "";
            } else if (jQuery.isArray(val)) {
                val = jQuery.map(val, function (value) {
                    return value == null ? "" : value + "";
                });
            }

            // 取得钩子
            hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

            // 如果进入了钩子，就用钩子中的设置方法
            // 如果没有进入钩子，那就直接设置this.value = val; 这里的this指向的是单个的DOM元素
            // If set returns undefined, fall back to normal setting
            if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
                this.value = val;
            }
        });
    }
});

jQuery.extend({
    valHooks: {
        option: {
            get: function (elem) {
                // specified:检测是否在HTML中设置了属性值，设置了返回true，否者返回false
                // 因为select下的option有value和text两种值，如果存在value属性，将返回value值，否者返回option的text文本
                // attributes.value is undefined in Blackberry 4.7 but
                // uses .value. See #6932
                var val = elem.attributes.value;
                return !val || val.specified ? elem.value : elem.text;
            }
        },
        select: {

            // http://blog.csdn.net/liyong199012/article/details/8161621
            get: function (elem) {
                var value, option,
                    options = elem.options,
                    index = elem.selectedIndex, //选中的索引，如果没有选中的话，默认为0



                    one = elem.type === "select-one" || index < 0,
                    values = one ? null : [],
                    max = one ? index + 1 : options.length,
                    i = index < 0 ?
                        max :
                        one ? index : 0;

                // Loop through all the selected options
                for (; i < max; i++) {
                    option = options[ i ];

                    // oldIE doesn't update selected after form reset (#2551)
                    if (( option.selected || i === index ) &&
                        // Don't return options that are disabled or in a disabled optgroup
                        //如果option是禁用的，或者被禁用的optGroup元素中的option，不返回值
                        // <option disabled="disabled"> 或者 <optgroup disabled="disabled"><option>111</option></optgroup>
                    /**
                     *  select.disabled = true;
                        support.optDisabled = !opt.disabled;

                        在老版本的Safari浏览器中，如果selected的disabled设置为true，option也会被自动的将disabled设置为true

                        !option.disabled -> 没有被禁用 如果safari的话，就看HTMLTag中是否指定了disabled为true

                        !option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup")相当于
                        !(option.parentNode.disabled && jQuery.nodeName(option.parentNode, "optgroup"))意思是：
                        如果不是（option的父元素为optgroup，并且disabled为true）

                        总之，也就是判断option的disabled不是为true
                     */
                        ( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
                        ( !option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup") )) {

                        // Get the specific value for the option
                        value = jQuery(option).val();

                        // We don't need an array for one selects
                        //如果是单选，直接返回值
                        if (one) {
                            return value;
                        }

                        // Multi-Selects return an array
                        // 如果是多选，把值放入数组中
                        values.push(value);
                    }
                }

                //多选时，返回一个数组
                return values;
            },

            /**
             * 先将value转换为数组，然后逐个遍历option元素
             * 如果option的val在value数组中时，设置option的selected为true
             * 如果一个都没有命中的话，修正selectedIndex的值为-1
             */
            set: function (elem, value) {
                var optionSet, option,
                    options = elem.options,
                    values = jQuery.makeArray(value),
                    i = options.length;

                while (i--) {
                    option = options[ i ];
                    if ((option.selected = jQuery.inArray(jQuery(option).val(), values) >= 0)) {
                        optionSet = true;
                    }
                }

                // force browsers to behave consistently when non-matching value is set
                if (!optionSet) {
                    elem.selectedIndex = -1;
                }
                return values;
            }
        }
    },

    attr: function (elem, name, value) {
        var hooks, notxml, ret,
            nType = elem.nodeType;

        // don't get/set attributes on text, comment and attribute nodes
        // 如果当前元素是文本节点，注释节点，或者 属性节点，直接return
        if (!elem || nType === 3 || nType === 8 || nType === 2) {
            return;
        }

        // Fallback to prop when attributes are not supported
        // 如果不支持getAttribute的话，就调用prop
        if (typeof elem.getAttribute === core_strundefined) {
            return jQuery.prop(elem, name, value);
        }

        //notxml = !(nType === 1 && jQuery.isXMLDoc(elem));
        // 不是xml
        notxml = nType !== 1 || !jQuery.isXMLDoc(elem);


        // All attributes are lowercase
        // Grab necessary hook if one is defined
        /**
         * 如果不是xml，就是HTML
         * 将name转化为小写，根据name找到hooks钩子
         */
        if (notxml) {
            name = name.toLowerCase();

            /**
             * rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|
             *                  loop|multiple|open|readonly|required|scoped)$/i
             * 这些属性，在HTML标签内，都是字符串
             * <input id="box" checked="checked" /> 那么就用boolean的钩子
             */

            hooks = jQuery.attrHooks[ name ] || ( rboolean.test(name) ? boolHook : nodeHook );
        }

        //说明是设置值
        if (value !== undefined) {

            //如果value是空，就是要移除了
            if (value === null) {
                jQuery.removeAttr(elem, name);

            } else if (hooks && notxml && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                /**
                 * 看看钩子里有没有，如果有的话，调用之，如果钩子有返回值，那么跳到这里
                 * 在钩子里，如果想用默认的setAttribute进行设置，那么久return undefined或者false，如果不想用默认的，就返回个true
                 */
                return ret;

            } else {
                //木有钩子，或者钩子返回空，直接setAttribute了
                elem.setAttribute(name, value + "");
                return value;
            }

        }
        /**
         * 这里没有value，是get值，如果钩子中有，那么调用钩子，如果有返回值，进入该if
         */
        else if (hooks && notxml && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
            return ret;

        } else {

            // In IE9+, Flash objects don't have .getAttribute (#12945)
            // Support: IE9+
            /**
             * IE9+的falsh没有getAttribute，放弃
             */
            if (typeof elem.getAttribute !== core_strundefined) {
                ret = elem.getAttribute(name);
            }

            // Non-existent attributes return null, we normalize to undefined

            // 没有可能ret是null，标准化为undefined
            return ret == null ?
                undefined :
                ret;
        }
    },

    removeAttr: function (elem, value) {
        var name, propName,
            i = 0,
            attrNames = value && value.match(core_rnotwhite);

        // $('#box').removeAttr('checked abc def');

        if (attrNames && elem.nodeType === 1) {

            //依次判断
            while ((name = attrNames[i++])) {
                propName = jQuery.propFix[ name ] || name;

                // Boolean attributes get special treatment (#10870)
                if (rboolean.test(name)) {
                    // Set corresponding property to false for boolean attributes
                    // Also clear defaultChecked/defaultSelected (if appropriate) for IE<8
                    if (!getSetAttribute && ruseDefault.test(name)) { //处理checked和selected
                        elem[ jQuery.camelCase("default-" + name) ] =
                            elem[ propName ] = false;
                    } else {
                        elem[ propName ] = false; //直接将值设置为false
                    }

                    // See #9699 for explanation of this approach (setting first, then removal)
                } else {
                    jQuery.attr(elem, name, "");
                }

                //原生调用
                elem.removeAttribute(getSetAttribute ? name : propName);
            }
        }
    },

    attrHooks: {
        /**
         * jQuery.support.radioValue 是如下逻辑判断
         *
         input.value = "t";
         input.setAttribute( "type", "radio" );
         support.radioValue = input.value === "t"; IE678是false

         如果是IE(6,7,8,9,10,11) && input.setAttribute('type','radio');的时候，才会进入到下面这个判断
         */
        type: {
            set: function (elem, value) {
                if (!jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
                    // Setting the type on a radio button after the value resets the value in IE6-9
                    // Reset value to default in case type is set after value during creation
                    //先将原来的值备份下来，然后设置新值，最后再设置回去
                    var val = elem.value;
                    elem.setAttribute("type", value);
                    if (val) { //如果能转换为false，就跳出了
                        elem.value = val;
                    }
                    return value;
                }
            }
        }
    },

    propFix: {
        tabindex: "tabIndex",
        readonly: "readOnly",
        "for": "htmlFor",
        "class": "className",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        cellpadding: "cellPadding",
        rowspan: "rowSpan",
        colspan: "colSpan",
        usemap: "useMap",
        frameborder: "frameBorder",
        contenteditable: "contentEditable"
    },

    // 跟attr大同小异，不再分析
    prop: function (elem, name, value) {
        var ret, hooks, notxml,
            nType = elem.nodeType;

        // don't get/set properties on text, comment and attribute nodes
        if (!elem || nType === 3 || nType === 8 || nType === 2) {
            return;
        }

        notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

        if (notxml) {
            // Fix name and attach hooks
            name = jQuery.propFix[ name ] || name;
            hooks = jQuery.propHooks[ name ];
        }

        if (value !== undefined) {
            if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                return ret;

            } else {
                return ( elem[ name ] = value );
            }

        } else {
            if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
                return ret;

            } else {
                return elem[ name ];
            }
        }
    },

    propHooks: {
        //http://www.cnblogs.com/rubylouvre/archive/2009/12/07/1618182.html
        //http://www.w3help.org/zh-cn/causes/SD2021
        //http://aokunsang.iteye.com/blog/835787
        tabIndex: {
            get: function (elem) {
                // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                // tabIndex不总是返回正确的值，所以要用getAttributeNode进行取值，详情请膜拜司徒正美的文章
                var attributeNode = elem.getAttributeNode("tabindex");

                /**
                 * 这里是针对IE6~8的情况，因为这几个浏览器是不会区分div的tabIndex的，而标准浏览器会返回-1
                 */
                return attributeNode && attributeNode.specified ?
                    parseInt(attributeNode.value, 10) :

                        //如果没有指定，那就判断是不是超链接或者表单元素，如果是，返回0，如果不是，返回undefined
                        rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ?
                    0 :
                    undefined;
            }
        }
    }
});

/**
 * rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|
 *                  loop|multiple|open|readonly|required|scoped)$/i
 *
 * 关于IE下面的checked和selected，IE6、IE7要用defaultChecked和defaultSelected代替checked和selected
 *
 * http://www.cnblogs.com/rubylouvre/p/3524113.html
 * http://www.cnblogs.com/snandy/archive/2012/05/06/2473936.html
 * http://www.cnblogs.com/rubylouvre/p/3524113.html
 */

// Hook for boolean attributes
boolHook = {
    get: function (elem, name) {
        var
        // Use .prop to determine if this attribute is understood as boolean
            prop = jQuery.prop(elem, name),

        // Fetch it accordingly
            attr = typeof prop === "boolean" && elem.getAttribute(name),

            /**
             * 好长的一个3元运算符，
             * 1、先判断prop是否为boolean值，如果不是，就取getAttributeNode，如果是的话，进入下一个
             * 2、先判断是否支持getAttribute和setAttribute和getsetInput，如果不支持，就去判断字符为selected或者checked
             *   如果支持，就是attr
             */

            detail = typeof prop === "boolean" ?

                    getSetInput && getSetAttribute ?
                attr != null :
                // oldIE fabricates an empty string for missing boolean attributes
                // and conflates checked/selected into attroperties

                // IE67的selected和checked，如果在prop中是个boolean，那么就在elem上去defaultSelected和defaultChecked
                ruseDefault.test(name) ?
                    elem[ jQuery.camelCase("default-" + name) ] :
                    !!attr :

                // fetch an attribute node for properties not recognized as boolean
                elem.getAttributeNode(name);

        /**
         * detail.value是否不是false，如果不是就返回name，如果是返回undefined
         */
        return detail && detail.value !== false ?
            name.toLowerCase() :
            undefined;
    },
    set: function (elem, value, name) {
        /**
         * $('input[type=radio]').attr('checked',false); 如果是这种情况，直接调用removeAttr
         */

        if (value === false) {
            // Remove boolean attributes when set to false
            jQuery.removeAttr(elem, name);
        } else if (getSetInput && getSetAttribute || !ruseDefault.test(name)) {

            /**
             * propFix: {
                tabindex: "tabIndex",
                readonly: "readOnly",
                "for": "htmlFor",
                "class": "className",
                maxlength: "maxLength",
                cellspacing: "cellSpacing",
                cellpadding: "cellPadding",
                rowspan: "rowSpan",
                colspan: "colSpan",
                usemap: "useMap",
                frameborder: "frameBorder",
                contenteditable: "contentEditable"
            },
             *
             * ruseDefault = /^(?:checked|selected)$/i;
             * 如果不是IE6也不是IE7，或者不是checked|selected，来到这个循环
             * 如果IE8+，那么将，设置 elem.setAttribute('readonly','readonly');
             * 如果IE8-,设置elem.setAttribute('readOnly','readonly'); 这样设置，为了property name的设置正确？
             */

                // IE<8 needs the *property* name
            elem.setAttribute(!getSetAttribute && jQuery.propFix[ name ] || name, name);

            // Use defaultChecked and defaultSelected for oldIE
        } else {

            //如果IE6、或者IE7，并且是selected、checked
            elem[ jQuery.camelCase("default-" + name) ] = elem[ name ] = true;

            //elem['defaultSelected'] = elem['selected'] = true;
            //elem['defaultChecked'] = elem['checked'] = true;
            //但是，为什么要将selected和checked单独出来呢？

        }

        return name;
    }
};

// fix oldIE value attroperty

// getSetInput IE567891011测试通过
// getSetAttribute IE67测试不过

/**
 *
 */

if (!getSetInput || !getSetAttribute) {
    jQuery.attrHooks.value = {
        get: function (elem, name) {
            var ret = elem.getAttributeNode(name);
            //如果是input，那么就去defaultValue，如果不是，就用attributeNode取值
            return jQuery.nodeName(elem, "input") ?

                // Ignore the value *property* by using defaultValue
                elem.defaultValue :

                    ret && ret.specified ? ret.value : undefined;
        },
        set: function (elem, value, name) {
            if (jQuery.nodeName(elem, "input")) { //如果是input，换成defaultValue，如果不是，用nodeHook.set
                // Does not return so that setAttribute is also used
                elem.defaultValue = value;
            } else {
                // Use nodeHook if defined (#1954); otherwise setAttribute is fine
                return nodeHook && nodeHook.set(elem, value, name);
            }
        }
    };
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if (!getSetAttribute) {

    // Use this for any attribute in IE6/7
    // This fixes almost every IE6/7 issue

    /**
     * <button value="abc">def</button>
     * button.getAttribute('value') IE67-> def chrome->abc
     * 所以这里需要转换一下
     */

    nodeHook = jQuery.valHooks.button = {
        get: function (elem, name) {
            var ret = elem.getAttributeNode(name);
            return ret && ( name === "id" || name === "name" || name === "coords" ? ret.value !== "" : ret.specified ) ?
                ret.value :
                undefined;
        },
        set: function (elem, value, name) {
            // Set the existing or create a new attribute node
            var ret = elem.getAttributeNode(name);
            if (!ret) {
                elem.setAttributeNode(
                    (ret = elem.ownerDocument.createAttribute(name))
                );
            }

            ret.value = value += "";

            // Break association with cloned elements by also using setAttribute (#9646)
            return name === "value" || value === elem.getAttribute(name) ?
                value :
                undefined;
        }
    };

    // Set contenteditable to false on removals(#10429)
    // Setting to empty string throws an error as an invalid value
    // contenteditable:规定是否可编辑元素的内容
    jQuery.attrHooks.contenteditable = {
        get: nodeHook.get,
        set: function (elem, value, name) {

            //$('#box').attr('contenteditable',''); 如果是这种情况，则将其设置为false

            nodeHook.set(elem, value === "" ? false : value, name);
        }
    };

    // Set width and height to auto instead of 0 on empty string( Bug #8150 )
    // This is for removals

    /**
     * 设置宽度、高度为空字符串时，使用auto代替
     * $.attr('width','') --> setAttribute('width','auto');
     */

    jQuery.each([ "width", "height" ], function (i, name) {
        jQuery.attrHooks[ name ] = jQuery.extend(jQuery.attrHooks[ name ], {
            set: function (elem, value) {
                if (value === "") {
                    elem.setAttribute(name, "auto");
                    return value;
                }
            }
        });
    });
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
/**
 * href src 返回绝对地址，自动补入链接,针对IE，
 */
if (!jQuery.support.hrefNormalized) {
    jQuery.each([ "href", "src", "width", "height" ], function (i, name) {
        jQuery.attrHooks[ name ] = jQuery.extend(jQuery.attrHooks[ name ], {
            get: function (elem) {
                var ret = elem.getAttribute(name, 2); // !!!getAttribute加入第二个参数“2”，返回此属性的value值
                return ret == null ? undefined : ret;
            }
        });
    });

    // href/src property should get the full normalized URL (#10299/#12915)
    jQuery.each([ "href", "src" ], function (i, name) {
        jQuery.propHooks[ name ] = {
            get: function (elem) {
                //在IE里面getAttribute，是可选的，有两个参数，第二个参数类型是整数，可填写0,1,2,4。 0是默认值，2是返回这个属性的value值。
                //返回属性值作为一个完全展开的URL。只适用于URL属性
                return elem.getAttribute(name, 4);
            }
        };
    });
}

/**
 * a.style.cssText = "top:1px;float:left;opacity:.5";
 * support.style = /top/.test( a.getAttribute("style") );
 *
 * 在IE下，box.setAttribte('style','color:blue'); box.style is a object
 * 所以，在此兼容，用cssText替换之
 * 1.8以前的版本是return elem.style.cssText.toLowerCase() || undefine IE返回的css属性都是大写，所以小写转换
 */
if (!jQuery.support.style) {
    jQuery.attrHooks.style = {
        get: function (elem) {
            // Return undefined in the case of empty string
            // Note: IE uppercases css property names, but if we were to .toLowerCase()
            // .cssText, that would destroy case senstitivity in URL's, like in "background"
            return elem.style.cssText || undefined;
        },
        set: function (elem, value) {
            return ( elem.style.cssText = value + "" );
        }
    };
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
/**
 * 获取元素option的selected属性,修复在IE默认不选中的BUG
 *
 *   var select = document.createElement('select');
     var option = document.createElement('option');
     option.innerHTML = 'option111';
     option.value = 1;
     select.appendChild(option);
     document.body.appendChild(select);

     console.log(option.selected); //IE6~7 false 其他true
 *
 * IE<=11+
 */
if (!jQuery.support.optSelected) {
    jQuery.propHooks.selected = jQuery.extend(jQuery.propHooks.selected, {
        get: function (elem) {
            var parent = elem.parentNode;

            if (parent) {
                // 访问父级selectedIndex属性，修复选择下标
                parent.selectedIndex;

                // Make sure that it also works with optgroups, see #5701
                if (parent.parentNode) {
                    // 确保也适用于optgroups元素
                    parent.parentNode.selectedIndex;
                }
            }
            return null;
        }
    });
}

// IE6/7 call enctype encoding
/**
 * 修复IE6/7调用enctype编码
 *
 * http://www.jb51.net/article/30389.htm
 * http://www.jb51.net/article/39485.htm
 * http://www.cnblogs.com/top5/archive/2011/07/13/2105260.html
 */
if (!jQuery.support.enctype) {
    jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
/**
 * $('input[type=radio]').val();
 *
 *  获取radio/checkbox的value属性默认值
 *  safair默认为""空字符串,其他为on
 *
 * <input type="radio">
 * support.checkOn = !!input.value;
 */
if (!jQuery.support.checkOn) {
    jQuery.each([ "radio", "checkbox" ], function () {
        jQuery.valHooks[ this ] = {
            get: function (elem) {
                // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                return elem.getAttribute("value") === null ? "on" : elem.value;
            }
        };
    });
}

/**
 * 针对radio和checkbox多选操作,在val里面传入数组
 * 如果当前input的value值在value数组中，那么，将之选中(elem.checked = true)
 *
 * $('input[type=radio]').val([1,2,3,4,5,6]);
 *
 */
jQuery.each([ "radio", "checkbox" ], function () {
    jQuery.valHooks[ this ] = jQuery.extend(jQuery.valHooks[ this ], {
        set: function (elem, value) {
            if (jQuery.isArray(value)) {
                return ( elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0 );
            }
        }
    });
});

/*
 *
 *
 * getSetAttribute 浏览器是否区分固有属性和自定义属性
 *
 * var div = document.createElement('div');
 * div.setAttribute('className','t');
 * getSetAttribute = div.className !== 't';
 *
 * IE6,7 返回false，IE8+返回true
 *
 http://www.cnblogs.com/aaronjs/p/3387906.html
 http://www.cnblogs.com/aaronjs/p/3387906.html
 http://www.jb51.net/article/50686.htm
 http://www.liyao.name/2013/09/differences-between-property-and-attribute-in-javascript.html
 http://www.cnblogs.com/rubylouvre/archive/2010/03/07/1680403.html
 http://ju.outofmemory.cn/entry/36093
 http://www.cnblogs.com/aaronjs/p/3387906.html
 http://www.jb51.net/article/29263.htm
 http://www.cnblogs.com/wangfupeng1988/p/3631853.html
 http://www.cnblogs.com/wangfupeng1988/p/3639330.html
 http://www.cnblogs.com/wangfupeng1988/p/3626300.html
 http://www.cnblogs.com/snandy/archive/2011/09/01/2155445.html
 http://www.cnblogs.com/snandy/archive/2011/09/03/2163702.html
 http://www.cnblogs.com/snandy/archive/2011/08/27/2155300.html
 http://www.cnblogs.com/snandy/archive/2011/08/28/2155787.html
 http://www.cnblogs.com/snandy/archive/2011/08/27/2155718.html
 http://www.cnblogs.com/snandy/archive/2011/09/01/2155445.html
 http://www.cnblogs.com/snandy/archive/2011/09/01/2162088.html

 http://jsdashi.com/develop/jquery-1.9/

 发布博客：
 http://www.cnblogs.com/hhstuhacker/p/3899042.html
 http://www.cnblogs.com/hhstuhacker/p/javascript-attribute-property-inside.html
 * /