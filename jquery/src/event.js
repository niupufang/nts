var rformElems = /^(?:input|select|textarea)$/i,
    rkeyEvent = /^key/,
    rmouseEvent = /^(?:mouse|contextmenu)|click/,
    rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
    rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

    global: {},

    add: function (elem, types, handler, data, selector) {
        var tmp, events, t, handleObjIn,
            special, eventHandle, handleObj,
            handlers, type, namespaces, origType,
            elemData = jQuery._data(elem);

        // Don't attach events to noData or text/comment nodes (but allow plain objects)
        // 从data代码可知，nodeType === 1 or nodeType === 9 or plainObject
        if (!elemData) {
            return;
        }

//        $('#dom').on('click', {
//            handler: function () {
//            alert(1);
//        }, selector: '#box'}, {data1: 'data1'})

        // Caller can pass in an object of custom data in lieu of the handler
        // 修正将handler和selector写在一块的情况
        if (handler.handler) {
            handleObjIn = handler;
            handler = handleObjIn.handler;
            selector = handleObjIn.selector;
        }

        // Make sure that the handler has a unique ID, used to find/remove it later
        // 在handler函数上加一个唯一的ID，便于识别
        if (!handler.guid) {
            handler.guid = jQuery.guid++;
        }

        // Init the element's event structure and main handler, if this is the first

        /**
         * jQuery.cache = {
         *      1:{
         *            data:
         *            {
         *            },
         *            events:
         *            {
         *                  click:
         *                  [
         *
         *                  ],
         *                  delegateCount:0
         *            },
         *            handle: function ()
         *            {
         *
         *            },--> [elem]= elem;
         *        }
         * };
         */

        if (!(events = elemData.events)) { //初始化
            events = elemData.events = {};
        }

        // elemData = {events: {},handle:function () {}};

        if (!(eventHandle = elemData.handle)) {
            eventHandle = elemData.handle = function (e) {
                // Discard the second event of a jQuery.event.trigger() and
                // when an event is called after a page has unloaded

                // jQuery.event.triggered 在trigger的时候，如果要触发一个浏览器的默认行为，
                // 会先将jQuery.event.triggered的值设置成当前需要触发的
                // 就是为了避免误调用jQuery的事件系统中的事件

                return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
                    jQuery.event.dispatch.apply(eventHandle.elem, arguments) :
                    undefined;
            };
            // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
            // 由于IE的attachEvent回调中的this不指向绑定元素，需要强制缓存它
            eventHandle.elem = elem;
        }

        // Handle multiple events separated by a space
        // jQuery(...).bind("mouseover mouseout", fn);
        // types = ['mouseover','mouseout']
        // core_rnotwhite = /\S+/g
        types = ( types || "" ).match(core_rnotwhite) || [""];
        t = types.length;
        while (t--) {

            // rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

            /**
             * /^([^.]*)(?:\.(.+)|)$/.exec('click.abc.def') // return ["click.abc.def", "click", "abc.def"]
             *
             * type = origType = click;
             * namespaces = ['abc','def']
             */

            tmp = rtypenamespace.exec(types[t]) || [];
            type = origType = tmp[1];
            namespaces = ( tmp[2] || "" ).split(".").sort();

            // There *must* be a type, no attaching namespace-only handlers
            if (!type) {
                continue;
            }

            // If event changes its type, use the special event handlers for the changed type
            special = jQuery.event.special[ type ] || {};

            // If selector defined, determine special event api type, otherwise given type
            // 如果传入了selector，则绑定的是代理事件，可能需要把当前的事件类型修正为可冒泡的事件类型
            // focus --> focusin blur --> focusout
            // 浏览器对某些事件支持的不完整，需要修正为更好的事件类型
            // mouseout --> mouseleave mouseover --> mouseenter
            type = ( selector ? special.delegateType : special.bindType ) || type;

            // Update special based on newly reset type
            special = jQuery.event.special[ type ] || {};

            // handleObj is passed to all event handlers
            handleObj = jQuery.extend({
                type: type, // 实际使用的事件类型，不包含命名空间，但可能被修正过
                origType: origType, // 原始事件类型，不包含命名空间，没被修正过
                data: data, // 自定义事件数据
                handler: handler, // 监听函数
                guid: handler.guid, //监听函数的guid 监听对象与监听函数有同样的guid
                selector: selector, // 选择器表达式，用于事件代理
                needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                namespace: namespaces.join(".") // 排序后的命名空间
            }, handleObjIn);

            // Init the event handler queue if we're the first
            if (!(handlers = events[ type ])) {
                handlers = events[ type ] = [];
                handlers.delegateCount = 0;

                // Only use addEventListener/attachEvent if the special events handler returns false
                // 如果是第一次绑定该类型的事件，那么就绑定主监听函数，先看是否有修正，如果没有修正，就调用原生方法进行绑定
                if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                    // Bind the global event handler to the element
                    if (elem.addEventListener) {
                        elem.addEventListener(type, eventHandle, false);

                    } else if (elem.attachEvent) {
                        elem.attachEvent("on" + type, eventHandle);
                    }
                }
            }

            // 如果修正对象有修正方法add，那么优先调用修正方法add绑定监听函数
            if (special.add) {
                special.add.call(elem, handleObj);

                if (!handleObj.handler.guid) {
                    handleObj.handler.guid = handler.guid;
                }
            }

            // Add to the element's handler list, delegates in front
            // 如果存在selector，表示是个代理事件，把代理监听对象插入到delegateCount所指定的位置
            // 如果不是代理事件，就直接push到数组末尾
            if (selector) {
                handlers.splice(handlers.delegateCount++, 0, handleObj);
            } else {
                handlers.push(handleObj);
            }

            // Keep track of which events have ever been used, for event optimization
            // 记录绑定过的事件，如果手动触发某个事件，可以方便的查找
            jQuery.event.global[ type ] = true;
        }

        // Nullify elem to prevent memory leaks in IE
        // 解除elem对于DOM的引用，避免IE的内存泄漏
        elem = null;
    },

    // Detach an event or set of events from an element
    // 移除事件
    // mappedTypes表示：是否严格检测事件类型
    remove: function (elem, types, handler, selector, mappedTypes) {
        var j, handleObj, tmp,
            origCount, t, events,
            special, handlers, type,
            namespaces, origType,
            elemData = jQuery.hasData(elem) && jQuery._data(elem);

        // 如果elem不支持传入data，或者data中没有events这个对象（还没有注册过时间，移除个毛啊）
        if (!elemData || !(events = elemData.events)) {
            return;
        }

        // Once for each type.namespace in types; type may be omitted
        // jQuery(...).off("mouseover mouseout", fn);
        // types = ['mouseover','mouseout']
        // core_rnotwhite = /\S+/g
        // 将多个type的情况分开，逐个移除
        types = ( types || "" ).match(core_rnotwhite) || [""];
        t = types.length;
        while (t--) {
            tmp = rtypenamespace.exec(types[t]) || [];
            type = origType = tmp[1];
            namespaces = ( tmp[2] || "" ).split(".").sort();

            // Unbind all events (on this namespace, if provided) for the element
            // $('#box').off('.abc.xyz'); type 为null，namespaces为['abc','xyz']
            if (!type) {

                /**
                 * events = {
                 *              click: [handleObj,handlerObj,handlerObj.....],
                 *              mouseover: [handleObj,handlerObj,handlerObj.....],
                 *              dblclick: [handleObj,handlerObj,handlerObj.....]
                 *          }
                 *
                 * 逐个遍历，如果移除.abc.xyz，那么就传入click.abc.xyz mouseover.abc.xyz dblclick.abc.xyz
                 *
                 */

                for (type in events) {
                    jQuery.event.remove(elem, type + types[ t ], handler, selector, true);
                }
                continue;
            }

            special = jQuery.event.special[ type ] || {};
            type = ( selector ? special.delegateType : special.bindType ) || type;
            handlers = events[ type ] || []; // 取出存在当前dom上的handlers (events.click--> [handleObj,handlerObj,handlerObj.....])

            /**
             * "(^|\\.)" + ['abc','xyz'].join("\\.(?:.*\\.|)") + "(\\.|$)" --> "(^|\.)abc\.(?:.*\.|)xyz(\.|$)"
             */
            tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");

            // Remove matching events
            origCount = j = handlers.length;
            while (j--) {
                handleObj = handlers[ j ]; //单个handlerObj

                if (

                /**
                 * 如果是$('#box').off('.abc.xyz');
                 * 或者 原始的类型一样 click.abc.xyz  click为原始类型origType
                 */
                    ( mappedTypes || origType === handleObj.origType ) &&
                /**
                 * 没有传入handler $('#box').off('click');
                 * 或者 handler.guid === handleObj.guid
                 */
                    ( !handler || handler.guid === handleObj.guid ) &&
                /**
                 * tmp此时是一个正则表达式
                 */
                    ( !tmp || tmp.test(handleObj.namespace) ) &&

                /**
                 * 没有代理事件的选择符，或者
                 * 选择符相符 ，或者
                 * 选择符为**，并且handlerObj有选择符
                 */
                    ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector )) {


                    // 符合以上条件的话，就删除
                    handlers.splice(j, 1);

                    if (handleObj.selector) {
                        handlers.delegateCount--;
                    }

                    // 如果修正对象有remove方法，调用之
                    if (special.remove) {
                        special.remove.call(elem, handleObj);
                    }
                }
            }

            // Remove generic event handler if we removed something and no more handlers exist
            // (avoids potential for endless recursion during removal of special event handlers)

            /**
             * 如果events.click === [],,,被删除干净了，那就调用原生方法移除这个DOM上的事件吧
             */
            if (origCount && !handlers.length) {
                if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                    jQuery.removeEvent(elem, type, elemData.handle);
                }

                delete events[ type ];
            }
        }

        // Remove the expando if it's no longer used]
        // 如果events也空了，那就解除data绑定吧
        if (jQuery.isEmptyObject(events)) {
            delete elemData.handle;

            // removeData also checks for emptiness and clears the expando if empty
            // so use it instead of delete
            jQuery._removeData(elem, "events");
        }
    },

    //构建冒泡路径，获取各元素上被绑定的事件，执行之
    //并且触发浏览器的默认行为
    trigger: function (event, data, elem, onlyHandlers) {
        var handle, ontype, cur,
            bubbleType, special, tmp, i,
            eventPath = [ elem || document ],
            type = core_hasOwn.call(event, "type") ? event.type : event,
            namespaces = core_hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];

        cur = tmp = elem = elem || document;

        // Don't do events on text and comment nodes
        // 不触发文本节点和注释节点上面的事件
        if (elem.nodeType === 3 || elem.nodeType === 8) {
            return;
        }

        // focus/blur morphs to focusin/out; ensure we're not firing them right now
        // http://fanyi.baidu.com/translate#en/zh/morphs  变体
        // focus/blur 是focusin和focusout的变体，确保现在触发的不是他们两
        if (rfocusMorph.test(type + jQuery.event.triggered)) {
            return;
        }

        // 如果type有. 说明有命名空间存在
        if (type.indexOf(".") >= 0) {
            // Namespaced trigger; create a regexp to match event type in handle()
            namespaces = type.split(".");
            type = namespaces.shift();
            namespaces.sort();
        }

        /**
         * IE6-8 <table></table>
         * var talbe = document.getElementsByTagName('table')[0];
         *
         * table[':']; --> srcript error !!!
         * @type {boolean|string}
         */
        ontype = type.indexOf(":") < 0 && "on" + type;

        // Caller can pass in a jQuery.Event object, Object, or just an event type string
        // event 可以是一个jQuery.Event , {type:'click',namespace:'abc.xyz'}, 'click'
        event = event[ jQuery.expando ] ?
            event :
            new jQuery.Event(type, typeof event === "object" && event);

        event.isTrigger = true; // 正在触发
        event.namespace = namespaces.join("."); // 命名空间
        event.namespace_re = event.namespace ? //  命名空间正则表达式
            new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") :
            null;

        // Clean up the event in case it is being reused
        event.result = undefined; // 将event的返回值清空
        if (!event.target) {
            event.target = elem;
        }

        // Clone any incoming data and prepend the event, creating the handler arg list
        data = data == null ?
            [ event ] :
            jQuery.makeArray(data, [ event ]);

        // Allow special events to draw outside the lines
        // 优先触发特殊处理的事件
        special = jQuery.event.special[ type ] || {};
        if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
            return;
        }

        // Determine event propagation path in advance, per W3C events spec (#9951)
        // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
        /**
         * 当满足一下条件时，不会构造冒泡路径
         *
         * 1.onlyHandlers为true，表示只触发当前元素上的事件监听函数，不会触发默认行为
         * 2.对于修正对象的noBubble为true，即不允许当前时间冒泡，例如load事件
         * 3.当前元素时window对象，已经是最顶层对象了
         *
         * 当onlyHandlers为false，并且没有阻止冒泡，并且不是window，构建冒泡路径
         */
        if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

            // 优先使用delegateType，foucs(不能冒泡的) --> focusinn（能冒泡）
            bubbleType = special.delegateType || type;

            // 将cur指向父节点 focusin and focusout 例外
            if (!rfocusMorph.test(bubbleType + type)) {
                cur = cur.parentNode;
            }

            // 构建冒泡路径
            for (; cur; cur = cur.parentNode) {
                eventPath.push(cur);
                tmp = cur;
            }

            // Only add window if we got to document (e.g., not plain obj or detached DOM)
            // 如果最后一个是document，按照事件规范，向路径中添加window对象
            if (tmp === (elem.ownerDocument || document)) {
                eventPath.push(tmp.defaultView || tmp.parentWindow || window);
            }
        }

        // Fire handlers on the event path
        i = 0;

        // 逐个向上层节点遍历，执行该type的handler，
        // 如果停止了冒泡，停止该过程
        while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {

            event.type = i > 1 ?
                bubbleType :
                special.bindType || type;

            // jQuery handler
            handle = ( jQuery._data(cur, "events") || {} )[ event.type ] && jQuery._data(cur, "handle");
            if (handle) {
                handle.apply(cur, data);
            }

            // Native handler
            // 执行行内onXXX事件
            // <table onclick="somefn">
            handle = ontype && cur[ ontype ];
            if (handle && jQuery.acceptData(cur) && handle.apply && handle.apply(cur, data) === false) {
                event.preventDefault();
            }
        }
        event.type = type;

        // 触发浏览器默认行为，如果设置了停止默认行为，停止该过程
        // If nobody prevented the default action, do it now
        if (!onlyHandlers && !event.isDefaultPrevented()) {

            if ((!special._default || special._default.apply(elem.ownerDocument, data) === false) // special._default 预留给需要特殊处理的默认行为
                && !(type === "click" && jQuery.nodeName(elem, "a")) // 不在a上面执行默认的click，因为页面会跳转
                && jQuery.acceptData(elem)) { // 如果elem上不能设置缓存系统，跳出

                // Call a native DOM method on the target with the same name name as the event.
                // Can't use an .isFunction() check here because IE6/7 fails that test.
                // Don't do default actions on window, that's where global variables be (#6170)

                // 不在window上触发默认事件，因为是存变量的地方
                if (ontype && elem[ type ] && !jQuery.isWindow(elem)) {

                    // 为了避免行内监听函数被执行，先将其设置为null，并且保存到tmp中，触发完成后再设置进去
                    // Don't re-trigger an onFOO event when we call its FOO() method
                    tmp = elem[ ontype ];

                    if (tmp) {
                        elem[ ontype ] = null;
                    }

                    // Prevent re-triggering of the same event, since we already bubbled it above
                    // 为了避免再次触发jquery事件方法绑定的监听函数，先将jQuery.event.triggered设置为当前事件类型
                    // 默认事件触发完毕之后再设置为undefined
                    jQuery.event.triggered = type;

                    // IE 6-8的focus和blur运用到一个隐藏的元素上面，会报错
                    try {
                        elem[ type ]();
                    } catch (e) {
                        // IE<9 dies on focus/blur to hidden element (#1486,#12518)
                        // only reproducible on winXP IE8 native, not IE9 in IE8 mode
                    }
                    jQuery.event.triggered = undefined;

                    if (tmp) {
                        elem[ ontype ] = tmp;
                    }
                }
            }
        }

        // 返回最后一个事件结果
        return event.result;
    },

    /**
     * dispatch负责在元素被用户触发的时候，获得所有的handlerObj，去执行
     * 如果存在事件委托，则向上遍历，执行所有元素上的handlerObj方法
     * @param event
     * @returns {Object|details.result|*|result|undefined}
     */
    dispatch: function (event) {

        // Make a writable jQuery.Event from the native event object
        // 修正原生event为jQuery.Event，并修复其中的方法
        event = jQuery.event.fix(event);

        var i, ret, handleObj, matched, j,
            handlerQueue = [],
            args = core_slice.call(arguments),

        // 取出绑定在DOM上的handlers --> events:{click:[handlerObj,handlerObj,handlerObj,handlerObj...]}
            handlers = ( jQuery._data(this, "events") || {} )[ event.type ] || [],

        // 取出特殊处理的设置
            special = jQuery.event.special[ event.type ] || {};

        // Use the fix-ed jQuery.Event rather than the (read-only) native event
        // 替换第一个参数为jQuery.Event对象
        args[0] = event;

        // 代理目标 this
        event.delegateTarget = this;

        // 转发前执行
        // Call the preDispatch hook for the mapped type, and let it bail if desired
        if (special.preDispatch && special.preDispatch.call(this, event) === false) {
            return;
        }

        // Determine handlers
        // 获取执行的函数链
        /**
          {
            elem: 冒泡路径上的某个元素,
            matches: [handlerObj,handlerObj,handlerObj...] 冒泡路径上的，或者自带的
            并且，是有顺序的，显示触发事件的target，然后才是想让冒泡的
          },
          {},{},{}
         */
        handlerQueue = jQuery.event.handlers.call(this, event, handlers);

        // Run delegates first; they may want to stop propagation beneath us
        // 正序遍历，如果event已经阻止了冒泡，停止遍历
        i = 0;
        while ((matched = handlerQueue[ i++ ]) && !event.isPropagationStopped()) {
            // currentTarget 是指当前正在触发事件的元素
            event.currentTarget = matched.elem;

            j = 0;

            //继续遍历，如果执行了立即停止冒泡，那就停止某个元素上该事件类型的所有handler的执行
            while ((handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped()) {

                // 没有namespace，或者namespace符合要求
                // Triggered event must either 1) have no namespace, or
                // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {

                    event.handleObj = handleObj;
                    event.data = handleObj.data;

                    // 优先执行修正的special['click'].handle
                    ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
                        .apply(matched.elem, args);

                    // 如果handler有返回值，则将返回值赋值到jQuery.Event上
                    // 如果返回值为false，那么就执行stopEvent()
                    // 浏览器原生，return false只是相当于e.preventDefault()
                    if (ret !== undefined) {
                        if ((event.result = ret) === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
            }
        }

        // 转发后执行
        // Call the postDispatch hook for the mapped type
        if (special.postDispatch) {
            special.postDispatch.call(this, event);
        }

        // 返回最后一个handler的返回值
        return event.result;
    },

    /**
     * return
     * {
     *      elem: 冒泡路径上的某个元素,
     *      matches: [handlerObj,handlerObj,handlerObj...] 冒泡路径上的，或者自带的
     * }
     */
    handlers: function (event, handlers) {
        var sel, handleObj, matches, i,
            handlerQueue = [],
            delegateCount = handlers.delegateCount,
            cur = event.target;

        /**
         * handlers -> [handlerObj,handlerObj,handlerObj,handlerObj]
         *
         * $(document).on('click','#userList li a',function () {
         *
         * });
         *
         * event -> new jQuery.Event(event)
         * handlers -> 是
         * curr 为当前触发的元素
         *
         * 比如有以下DOM：
         * <div><span>I am span</span></div>
         * 点击span时，target为触发事件的元素span
         */
        // Find delegate handlers
        // Black-hole SVG <use> instance trees (#13180)
        // Avoid non-left-click bubbling in Firefox (#3861)

        /**
         * 如果当前元素上有代理事件，那么从当前触发的元素，一直向上模拟冒泡
         * <div><span>I am span</span></div>
         * eg: 触发的事件为span -> div -> document
         * cur 分别为 span div document 为document的时候，就停止了
         */
        if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {

            for (; cur != this; cur = cur.parentNode || this) {

                // Don't check non-elements (#13208)
                // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)

                //  HTMLElement nodeType === 1
                //  不能将在disabled的元素上冒泡click
                if (cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click")) {
                    matches = [];

                    // 遍历所有的handlers
                    for (i = 0; i < delegateCount; i++) {
                        handleObj = handlers[ i ];

                        // Don't conflict with Object.prototype properties (#13203)
                        // 保存当前代理对象的选择符
                        sel = handleObj.selector + " ";

                        if (matches[ sel ] === undefined) {
                            matches[ sel ] = handleObj.needsContext ?
                                jQuery(sel, this).index(cur) >= 0 :
                                jQuery.find(sel, this, null, [ cur ]).length;
                        }
                        if (matches[ sel ]) {
                            matches.push(handleObj);
                        }
                    }
                    if (matches.length) {
                        handlerQueue.push({ elem: cur, handlers: matches });
                    }
                }
            }
        }

        // 如果当前this没有被注册代理类型的事件，那么就直接把当前的handlerspush到handlerQueue中
        // Add the remaining (directly-bound) handlers
        if (delegateCount < handlers.length) {
            handlerQueue.push({ elem: this, handlers: handlers.slice(delegateCount) });
        }

        return handlerQueue;
    },

    fix: function (event) {
        // 如果已经是jQuery.Event，那么直接返回
        if (event[ jQuery.expando ]) {
            return event;
        }

        // Create a writable copy of the event object and normalize some properties
        var i, prop, copy,
            type = event.type,
            originalEvent = event,
            fixHook = this.fixHooks[ type ];

        //通过事件的类型判断是鼠标事件（左右）还是键盘事件
        if (!fixHook) {
            this.fixHooks[ type ] = fixHook =
                rmouseEvent.test(type) ? this.mouseHooks :
                    rkeyEvent.test(type) ? this.keyHooks :
                    {};
        }
        copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;

        event = new jQuery.Event(originalEvent);

        i = copy.length;
        while (i--) {
            prop = copy[ i ];
            event[ prop ] = originalEvent[ prop ];
        }

        // Support: IE<9
        // Fix target property (#1925)
        if (!event.target) {
            event.target = originalEvent.srcElement || document;
        }

        /**
         *target是触发的DOM元素
         currentTarget 是绑定事件的元素，等同于this
         relatedTarget 移入移出相关的元素
         <div> <span></span></div>
         $('div').on('click',function (e) {
              console.log(e.target); // 点击span元素时是SPANelement,点击DIV元素时是DivElement
              console.log(e.currentTarget); //都是DIVElement
          });

         $('div').on('mouseover',function (e) {
              console.log(e.relatedTarget);
          });
         */


        // Support: Chrome 23+, Safari?
        // Target should not be a text node (#504, #13143)
        if (event.target.nodeType === 3) {
            event.target = event.target.parentNode;
        }

        // Support: IE<9
        // For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
        event.metaKey = !!event.metaKey;

        return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
    },

    // Includes some event props shared by KeyEvent and MouseEvent
    props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

    fixHooks: {},

    /**
     * 兼容键盘which
     */
    keyHooks: {
        props: "char charCode key keyCode".split(" "),
        filter: function (event, original) {

            // Add which for key events
            // which 可以在键盘或者鼠标点击的按钮
            // 鼠标：左键是1 中键是2，右键是3
            // 键盘：对象charCode或者keyCode
            if (event.which == null) {
                event.which = original.charCode != null ? original.charCode : original.keyCode;
            }

            return event;
        }
    },

    mouseHooks: {
        props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
        filter: function (event, original) {
            var body, eventDoc, doc,
                button = original.button,
                fromElement = original.fromElement;

            // Calculate pageX/Y if missing and clientX/Y available
            // 兼容clientX和pageX
            // see:: http://www.cnblogs.com/yehuabin/archive/2013/03/07/2946004.html
            //
            if (event.pageX == null && original.clientX != null) {
                eventDoc = event.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                event.pageY = original.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && body.clientTop || 0 );
            }

            // Add relatedTarget, if necessary
            if (!event.relatedTarget && fromElement) {
                event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it

            // see:: http://www.cnblogs.com/rubylouvre/archive/2009/08/24/1552862.html

            if (!event.which && button !== undefined) {
                event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
            }

            return event;
        }
    },

    special: {
        load: {
            // Prevent triggered image.load events from bubbling to window.load
            // 本来，load事件是不冒泡的，但是在调用trigger的时候，会构建一个从当前元素到window的冒泡路径
            // 这就会导致在image.load的时候调用window.load
            noBubble: true
        },
        click: {
            // For checkbox, fire native event so checked state will be right
            trigger: function () {
                if (jQuery.nodeName(this, "input") && this.type === "checkbox" && this.click) {
                    this.click();
                    return false;
                }
            }
        },
        focus: {
            // Fire native event if possible so blur/focus sequence is correct
            trigger: function () {
                if (this !== document.activeElement && this.focus) {
                    try {
                        this.focus();
                        return false;
                    } catch (e) {
                        // Support: IE<9
                        // If we error on focus to hidden element (#1486, #12518),
                        // let .trigger() run the handlers
                    }
                }
            },

            // focus和blur是不支持冒泡的，在事件委托的时候，需要把这两个换成支持冒泡的focusin和focusout
            delegateType: "focusin"
        },
        blur: {
            trigger: function () {
                if (this === document.activeElement && this.blur) {
                    this.blur();
                    return false;
                }
            },
            delegateType: "focusout"
        },

        beforeunload: {
            postDispatch: function (event) {

                // Even when returnValue equals to undefined Firefox will still show alert
                if (event.result !== undefined) {
                    event.originalEvent.returnValue = event.result;
                }
            }
        }
    },

    /**
     * 模拟一个事件
     * @param type 事件类型
     * @param elem 元素
     * @param event event
     * @param bubble 是否冒泡
     */
    simulate: function (type, elem, event, bubble) {
        // Piggyback on a donor event to simulate a different one.
        // Fake originalEvent to avoid donor's stopPropagation, but if the
        // simulated event prevents default then we do the same on the donor.
        var e = jQuery.extend(
            new jQuery.Event(),
            event,
            {
                type: type,
                isSimulated: true, //表示是个模拟事件
                originalEvent: {}
            }
        );
        if (bubble) { //如果冒泡的话，直接trigger
            // 1.先从当前元素向上遍历到document，然后取出各自的handlerObj就行执行
            // 2.从下至上，触发浏览器的默认行为
            jQuery.event.trigger(e, null, elem);
        } else {
            // 如果不冒泡，直接事件转发
            // 从下至上，取出所有handlerObj，进行执行
            jQuery.event.dispatch.call(elem, e);
        }
        if (e.isDefaultPrevented()) {
            event.preventDefault();
        }
    }
};

/**
 * 原生移除事件
 */
jQuery.removeEvent = document.removeEventListener ?
    function (elem, type, handle) { // W3C
        if (elem.removeEventListener) {
            elem.removeEventListener(type, handle, false);
        }
    } :
    function (elem, type, handle) {
        var name = "on" + type;

        if (elem.detachEvent) {

            // IE6-8 BUG
            // #8545, #7054, preventing memory leaks for custom events in IE6-8
            // http://bugs.jquery.com/ticket/8545
            // http://bugs.jquery.com/ticket/7054 IE8内存泄漏
            // detachEvent needed property on element, by name of that event, to properly expose it to GC
            if (typeof elem[ name ] === core_strundefined) {
                elem[ name ] = null;
            }

            elem.detachEvent(name, handle);
        }
    };

// jQuery.Event 构造函数
// 1.处理不用new关键字的构造
// 2.将浏览器event对象存入到originalEvent中
// 3.处理isDefaultPrevented，是否已经阻止浏览器默认事件触发
// 4.将props对象apply到jQuery.Event对象上去
// 5.修正timeStamp，设置jQuery.expando
jQuery.Event = function (src, props) {
    // Allow instantiation without the 'new' keyword
    // 可以直接 var jQueryEvent = jQuery.Event(originEvent,{});
    if (!(this instanceof jQuery.Event)) {
        return new jQuery.Event(src, props);
    }

    // Event object
    if (src && src.type) {
        this.originalEvent = src;
        this.type = src.type;

        // Events bubbling up the document may have been marked as prevented
        // by a handler lower down the tree; reflect the correct value.
        // 判断是否已经e.preventDefault() 或者returnValue === false
        this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
            src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

        // Event type
    } else {
        this.type = src;
    }

    // Put explicitly provided properties onto the event object
    // 把props的值设置到jQuery.Event对象中
    if (props) {
        jQuery.extend(this, props);
    }

    // Create a timestamp if incoming event doesn't have one
    // 修正timeStamp，在W3C规范中，是有的timeStamp的，但是IE9以下没有
    this.timeStamp = src && src.timeStamp || jQuery.now();

    // Mark it as fixed
    // jQuery.Event[$.expando] = true;
    this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
// jQuery.Event.prototype 主要修正了3个DOM3事件方法
// preventDefault / stopPropagation / stopImmediatePropagation
jQuery.Event.prototype = {

    // 默认阻止浏览器事件，默认阻止冒泡，默认阻止立即冒泡 都是returnFalse的
    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse,

    preventDefault: function () {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;
        //如果没有浏览器原生事件对象，跳出
        if (!e) {
            return;
        }

        // If preventDefault exists, run it on the original event
        // W3C 标准
        if (e.preventDefault) {
            e.preventDefault();

            // Support: IE
            // Otherwise set the returnValue property of the original event to false
            // IE Fixed
        } else {
            e.returnValue = false;
        }
    },

    stopPropagation: function () {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;
        if (!e) {
            return;
        }
        // If stopPropagation exists, run it on the original event
        // W3C 标准
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        // Support: IE
        // Set the cancelBubble property of the original event to true
        // 在一些浏览器中，stopPropagation方法执行之后，cancelBubble还是会为false，这里统一设置成true
        e.cancelBubble = true;
    },

    /**
     * 停止该元素上同一种时间类型的所有绑定事件
     *
     * $('div').on('click',function (e) {
     *      e.stopPropagation();
     *      alert('div1'); // 弹出
     * });
     *
     * $('div').on('click',function (e) {
     *      //e.stopPropagation();
     *      alert('div2'); //弹出
     * });
     *
     *
     * $('div').on('click',function (e) {
     *      e.stopImmediatePropagation();
     *      alert('div1'); // 弹出
     * });
     *
     * $('div').on('click',function (e) {
     *      //e.stopImmediatePropagation();
     *      alert('div2'); //不会弹出
     * });
     */
    stopImmediatePropagation: function () {

        //这里没有用w3c的stopImmediatePropagation，有待研究
        this.isImmediatePropagationStopped = returnTrue;
        this.stopPropagation();

        // 在1.11.1版本，是如下实现
        var e = this.originalEvent;
        this.isImmediatePropagationStopped = returnTrue;
        if (e && e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        }
        this.stopPropagation();
    }
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// 对于不支持这两个方法的浏览器，进行判断？？？？
// 很明显，这里是对所有的浏览器进行了处理
jQuery.each({
    mouseenter: "mouseover",
    mouseleave: "mouseout"
}, function (orig, fix) {
    jQuery.event.special[ orig ] = {
        delegateType: fix,
        bindType: fix,

        // handle是在最后一步执行handler的时候截断到此
        handle: function (event) {
            var ret,
                target = this,
                related = event.relatedTarget,// 在IE的mouseover是，fromElement,mouseout时，是toElement
                handleObj = event.handleObj;

            // For mousenter/leave call the handler if related is outside the target.
            // NB: No relatedTarget if the mouse left/entered the browser window
            // 如果relatedTarget没有，或者（当前target不等于relatedTarget，并且target不包含related），则触发
            // 这一句代码写的太精妙了，不能自拔。
            if (!related || (related !== target && !jQuery.contains(target, related))) {
                event.type = handleObj.origType;
                ret = handleObj.handler.apply(this, arguments);
                event.type = fix;
            }
            return ret;
        }
    };
});

// IE submit delegation
/**
 * IE 6 7 8 不支持submit的冒泡
 *
 * 使用可能：
 *
 * <div id="box">
 *  <form method="post">
 *
 *  </form>
 * </div>
 *
 * $('#box').on('submit',function () {});
 *
 *
 * jQuery.support.submitBubbles实现思路大致是：
 *
 * function isSupportSubmitBubble() {
        var div = document.createElement('div');

        var isSupport = false;

        if ('onsubmit' in div) {
            isSupport = true;
        }

        if (!isSupport) {
            div['onsubmit'] = 'return;';

            if (typeof div['onsubmit'] === 'function') {
                isSupport = true;
            }
        }
        return isSupport;
    }

 PS:change和focusin都是大致的判断思路

 解决问题：
    IE678不支持submit的冒泡，如果$('#box').on('submit',function () {});将不会执行

 兼容的大致思路：
    1.在当前绑定submit的元素上绑定click和press事件，因为form中回车键和点击input时都会触发form的submit事件
    2.在触发click和press事件时，判断target是否为button或者input，如果是，找到其上的form
    3.如果form存在，注册form的submit事件，只要事件被触发，那么将event._submit_bubble的标志位设置为true
    4.当正常jquery的转发完成后，模拟form上层元素的submit冒泡，从而触发当前绑定的submit
 */
if (!jQuery.support.submitBubbles) {
    jQuery.event.special.submit = {
        setup: function () {
            // Only need this for delegated form submit events
            // 如果当前是form元素，则不需要模拟冒泡，直接进入默认的流程，相当于$('#box').on('submit',function () {});不需要处理了
            if (jQuery.nodeName(this, "form")) {
                return false;
            }

            // Lazy-add a submit handler when a descendant form may potentially be submitted
            // 给box元素添加click和keypress方法，命名空间为_submit，当box的子元素有出发click或者press事件时
            // 获得input或者button的form，如果form存在，说明这是一次form提交，然后给from注册submit._submit事件
            //
            jQuery.event.add(this, "click._submit keypress._submit", function (e) {
                // Node name check avoids a VML-related crash in IE (#9807)
                var elem = e.target,
                    form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;
                // 如果form上还没有submitBubbles的数据缓存，说明form上还没有被绑定submit_submit事件，绑定之
                if (form && !jQuery._data(form, "submitBubbles")) {
                    jQuery.event.add(form, "submit._submit", function (event) {
                        event._submit_bubble = true;
                    });
                    jQuery._data(form, "submitBubbles", true); //设置标志位为true，防止重复绑定
                }
            });
            // return undefined since we don't need an event listener
        },

        /**
         * 事件转发完成后，判断event上是否有_submit_bubble这个标志位，如果有，所有form已经提交了，然后删除之
         * 从父节点开始模拟submit事件
         */
        postDispatch: function (event) {
            // If form was submitted by the user, bubble the event up the tree
            if (event._submit_bubble) {
                delete event._submit_bubble;
                if (this.parentNode && !event.isTrigger) {
                    jQuery.event.simulate("submit", this.parentNode, event, true);
                }
            }
        },


        // $('#box').off('submit',fn);
        teardown: function () {
            // Only need this for delegated form submit events
            // 如果是form，跟add一样，return false
            if (jQuery.nodeName(this, "form")) {
                return false;
            }

            // Remove delegated handlers; cleanData eventually reaps submit handlers attached above
            // 移除绑定的_submit事件
            jQuery.event.remove(this, "._submit");
        }
    };
}

// IE change delegation and checkbox/radio fix
if (!jQuery.support.changeBubbles) {

    jQuery.event.special.change = {

        setup: function () {

            if (rformElems.test(this.nodeName)) {
                // IE doesn't fire change on a check/radio until blur; trigger it on click
                // after a propertychange. Eat the blur-change in special.change.handle.
                // This still fires onchange a second time for check/radio after blur.
                if (this.type === "checkbox" || this.type === "radio") {
                    jQuery.event.add(this, "propertychange._change", function (event) {
                        if (event.originalEvent.propertyName === "checked") {
                            this._just_changed = true;
                        }
                    });
                    jQuery.event.add(this, "click._change", function (event) {
                        if (this._just_changed && !event.isTrigger) {
                            this._just_changed = false;
                        }
                        // Allow triggered, simulated change events (#11500)
                        jQuery.event.simulate("change", this, event, true);
                    });
                }
                return false;
            }
            // Delegated event; lazy-add a change handler on descendant inputs
            jQuery.event.add(this, "beforeactivate._change", function (e) {
                var elem = e.target;

                if (rformElems.test(elem.nodeName) && !jQuery._data(elem, "changeBubbles")) {
                    jQuery.event.add(elem, "change._change", function (event) {
                        if (this.parentNode && !event.isSimulated && !event.isTrigger) {
                            jQuery.event.simulate("change", this.parentNode, event, true);
                        }
                    });
                    jQuery._data(elem, "changeBubbles", true);
                }
            });
        },

        handle: function (event) {
            var elem = event.target;

            // Swallow native change events from checkbox/radio, we already triggered them above
            if (this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox")) {
                return event.handleObj.handler.apply(this, arguments);
            }
        },

        teardown: function () {
            jQuery.event.remove(this, "._change");

            return !rformElems.test(this.nodeName);
        }
    };
}

// see: http://yiminghe.iteye.com/blog/813255
// see: http://www.cnblogs.com/snandy/archive/2011/07/19/2110393.html
// see: http://www.cnblogs.com/aaronjs/p/3481075.html

/**
 * jQuery.support.focusinBubbles --> support.focusinBubbles = "onfocusin" in window;
 * 只有在FF下面，不支持focusin和focusout
 * 但是jQuery在chrome下面，好像支持，但是也判断为false，不知为何
 *
 * 1.9.1如下实现：
 *
 // Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
 // Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
 for ( i in { submit: true, change: true, focusin: true }) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
}
 解决问题：
    1.focus和blur不支持冒泡
    2.但是在FF以外的浏览器可以用focusin和focusout替代
    3.FF用以下兼容

 兼容大致思路：
    1.由于FF不支持focusin和focusout，只能通过捕获阶段来模拟冒泡
    2.当之前还没有在任何元素上注册过focus事件的时候，在document上注册focus事件，只吃一次
    3.在捕获阶段，document上的focus肯定先行执行，拿到target，模拟向上冒泡，执行所有的focus
 */
// Create "bubbling" focus and blur events
if (!jQuery.support.focusinBubbles) {
    jQuery.each({ focus: "focusin", blur: "focusout" }, function (orig, fix) {

        // Attach a single capturing handler while someone wants focusin/focusout
        var attaches = 0,
            handler = function (event) {

                //模拟focusin事件，fix为focusin，event.target是触发事件的元素，true表示bubble冒泡
                //这里的event.target比较重要，在事件捕获阶段，当focus到一个input时，event.target就是这个input
                //有了这个target，才能够模拟从input到document的冒泡
                jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
            };

        jQuery.event.special[ fix ] = {
            setup: function () {
                if (attaches++ === 0) {
                // 如果是第一次，那就在document上注册handler函数，handler函数会模拟从event.target到document上所有的focus等事件
                    document.addEventListener(orig, handler, true);
                }
            },
            teardown: function () {
                if (--attaches === 0) {
                    document.removeEventListener(orig, handler, true);
                }
            }
        };
    });
}

jQuery.fn.extend({

    //向外暴露的方法，one是个内部调用参数，用于重新封装one注册事件
    //types可以传入一个事件的对象，selector是事件委托机制的代理元素，data是附加到event上的属性，fn是回调函数
    on: function (types, selector, data, fn, /*INTERNAL*/ one) {
        var type, origFn;

        //types是个object的情况
        //$('...').on({click:function () {},keyup:function () {}},'#userList li a',{someattr:'value',a:''});

        // Types can be a map of types/handlers
        if (typeof types === "object") {
            // ( types-Object, selector, data )
            if (typeof selector !== "string") {
                // 处理没有selector的时候
                //  $('...').on({click:function () {},keyup:function () {}},null,{someattr:'value',a:''});
                //  $('...').on({click:function () {},keyup:function () {}},{someattr:'value',a:''});
                // ( types-Object, data )
                data = data || selector; // selector没有传入，data位置错位
                selector = undefined;
            }

            //遍历types对象，逐个递归
            for (type in types) {
                this.on(type, selector, data, types[ type ], one);
            }
            return this;
        }

        // $('#box').on('click',function () {});
        // 不传入data和fn，就是上面这种形式调用
        if (data == null && fn == null) {
            // ( types, fn )
            fn = selector;
            data = selector = undefined;
        } else if (fn == null) {
            // 如果fn不传入，那么data肯定是fn，selector可能是selector或者data
            // 如果selector是字符串，那么就判断为selector，data为空
            if (typeof selector === "string") {
                // ( types, selector, fn )
                fn = data;                  //-->>
                data = undefined;
            } else {
                // 如果不是字符串，说明selector是data
                // ( types, data, fn )
                fn = data;                  //-->>
                data = selector;
                selector = undefined;
            }
        }
        //以上是处理参数传递问题，on的各种参数修正完毕

        //如果fn传入的是false，将fn设置为只返回false的函数
        // returnFalse = function (){return false;}
        if (fn === false) {
            fn = returnFalse;
            //如果没有传入fn，则直接返回jQuery对象
        } else if (!fn) {
            return this;
        }

        //处理one事件的调用，只有jQuery内部，才会走下面的循环
        if (one === 1) {
            // 重新封装fn，在fn执行时，就解绑事件
            origFn = fn;
            fn = function (event) {
                // Can use an empty set, since event contains the info
                jQuery().off(event);
                return origFn.apply(this, arguments);
            };
            // Use same guid so caller can remove using origFn
            fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
        }
        //遍历jQuery选取的所有元素，分别执行jQuery.event.add方法，流程转入！
        return this.each(function () {
            jQuery.event.add(this, types, fn, data, selector);
        });
    },

    // 调用on
    one: function (types, selector, data, fn) {
        return this.on(types, selector, data, fn, 1);
    },

    off: function (types, selector, fn) {
        var handleObj, type;
        if (types && types.preventDefault && types.handleObj) {
            // ( event )  dispatched jQuery.Event
            handleObj = types.handleObj;
            jQuery(types.delegateTarget).off(
                handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                handleObj.selector,
                handleObj.handler
            );
            return this;
        }


        /**
         * $('#box').off({click:fn1,mouseover:fn2},'#userList li a');
         */

        if (typeof types === "object") {
            // ( types-object [, selector] )
            for (type in types) {
                this.off(type, selector, types[ type ]);
            }
            return this;
        }

        /**
         * $('#box').off('click',false);
         * $('#box').off('click',fn1);
         *
         * 这里表示没有传入selector
         */
        if (selector === false || typeof selector === "function") {
            // ( types [, fn] )
            fn = selector;
            selector = undefined;
        }

        //如果fn为false，那么将fn替换为return false的方法
        if (fn === false) {
            fn = returnFalse;
        }

        // 逐个遍历，调用jQuery.event.remove
        return this.each(function () {
            jQuery.event.remove(this, types, fn, selector);
        });
    },

    // 调用on
    bind: function (types, data, fn) {
        return this.on(types, null, data, fn);
    },
    unbind: function (types, fn) {
        return this.off(types, null, fn);
    },

    // 调用on
    delegate: function (selector, types, data, fn) {
        return this.on(types, selector, data, fn);
    },
    undelegate: function (selector, types, fn) {
        // ( namespace ) or ( selector, types [, fn] )
        return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
    },

    // 触发事件，并且执行浏览器的默认行为,会冒泡
    // 返回的是jQuery对象
    trigger: function (type, data) {
        return this.each(function () {
            jQuery.event.trigger(type, data, this);
        });
    },

    // 只触发事件，不执行浏览器默认行为，不会冒泡
    // 返回的是绑定事件返回的值
    triggerHandler: function (type, data) {
        var elem = this[0];
        if (elem) {
            return jQuery.event.trigger(type, data, elem, true);
        }
    }

    /**
     * 命名空间：
     *
     *
     * $('input').on('click.abc',function () {
     *      alert('abc');
     * });
     *
     * $('input').on('click.xyz',function () {
     *      alert('xyz');
     * });
     *
     * $('input').on('mouseover.abc',function () {
     *      alert('mouseover abc');
     * });
     *
     * $('input').off('click.abc');
     *
     * $('input').off('.abc');
     *
     * $('input').trigger('click.xyz');
     *
     */

});
