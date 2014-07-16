jQuery.extend({

    // 数据入队，或者取出某种type的队列
    // 如果data为空，就表示取出现有的队列
    // 如果data有值，
    //  1.如果data为数组，或者该type下还没有队列存在，那么将data作为队列起点
    //  2.否则，表示只有单个数据入队，直接push进入当前队列
    queue: function (elem, type, data) {
        var queue;

        if (elem) {
            type = ( type || "fx" ) + "queue"; //如果没有传入type，默认为动画类型
            queue = jQuery._data(elem, type); //此处采用缓存系统的内部方法

            // Speed up dequeue by getting out quickly if this is just a lookup
            // 如果只是一个读取的话，那么就直接返回从缓存系统里得到的queue
            // 如果data有值，说明是要加入队列一些东西了
            if (data) {
                if (!queue || jQuery.isArray(data)) {
                    queue = jQuery._data(elem, type, jQuery.makeArray(data));
                } else {
                    queue.push(data); // 这里也很巧妙的同步了缓存系统里的data
                }
            }

            return queue || [];
        }
    },

    dequeue: function (elem, type) {
        type = type || "fx";

        var queue = jQuery.queue(elem, type), // 取出队列
            startLength = queue.length,
            fn = queue.shift(),
            hooks = jQuery._queueHooks(elem, type),
            next = function () {
                jQuery.dequeue(elem, type);
            };

        // If the fx queue is dequeued, always remove the progress sentinel
        // 如果动画队列出队，那么在此的shift
        if (fn === "inprogress") {
            fn = queue.shift();
            startLength--;
        }

        hooks.cur = fn;
        if (fn) {

            // Add a progress sentinel to prevent the fx queue from being
            // automatically dequeued
            // 如果是动画，那就再次的塞进去
            if (type === "fx") {
                queue.unshift("inprogress");
            }

            // clear up the last queue stop function
            // 清除上一个队列的clearTimeout
            delete hooks.stop;
            fn.call(elem, next, hooks); //这里传入两个参数，1.队列的下一个元素 2.钩子
        }

        if (!startLength && hooks) {
            hooks.empty.fire(); // 如果全部出队了，那就出发清理
        }
    },

    // not intended for public consumption - generates a queueHooks object, or returns the current one
    _queueHooks: function (elem, type) {
        var key = type + "queueHooks"; // type后面加入 queuehooks

        // 如果缓存系统有这个type的值，那么就返回，如果没有，就设置一个，并返回
        return jQuery._data(elem, key) || jQuery._data(elem, key, {
            empty: jQuery.Callbacks("once memory").add(function () {

                //移出当前队列的缓存数据
                jQuery._removeData(elem, type + "queue");
                //移出钩子的缓存数据（自己的）
                jQuery._removeData(elem, key);
            })
        });
    }
});


jQuery.fn.extend({
    queue: function (type, data) {
        var setter = 2;

        if (typeof type !== "string") {
            data = type;
            type = "fx";
            setter--;
        }

        // 如果type !== "string"，不会进入该循环
        // 如果 $('#dom').queue('some'); 那么就取出第一个元素的队列
        if (arguments.length < setter) {
            return jQuery.queue(this[0], type);
        }

        // $('#dom').queue('sometype',undefined,'a','b','c'); 这样的话，就直接返回了
        // 如果 ('#dom').queue('sometype','d');

        return data === undefined ?
            this :
            this.each(function () {
                var queue = jQuery.queue(this, type, data);

                // ensure a hooks for this queue
                jQuery._queueHooks(this, type);

                if (type === "fx" && queue[0] !== "inprogress") {
                    jQuery.dequeue(this, type);
                }
            });
    },
    dequeue: function (type) {
        return this.each(function () {
            jQuery.dequeue(this, type);
        });
    },
    // Based off of the plugin by Clint Helfers, with permission.
    // http://blindsignals.com/index.php/2009/07/jquery-delay/
//    jQuery.fx.speeds = {
//        slow: 600,
//        fast: 200,
//        // Default speed
//        _default: 400
//    };


    delay: function (time, type) {
        time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time; //取到一个time
        type = type || "fx";

        return this.queue(type, function (next, hooks) { //设置一个延时
            var timeout = setTimeout(next, time);
            hooks.stop = function () {
                clearTimeout(timeout);
            };
        });
    },
    clearQueue: function (type) {
        return this.queue(type || "fx", []); // 清空队列
    },
    // Get a promise resolved when queues of a certain type
    // are emptied (fx is the type by default)
    promise: function (type, obj) {
        var tmp,
            count = 1,
            defer = jQuery.Deferred(),
            elements = this,
            i = this.length,
            resolve = function () {
                if (!( --count )) {
                    defer.resolveWith(elements, [ elements ]);
                }
            };

        if (typeof type !== "string") {
            obj = type;
            type = undefined;
        }
        type = type || "fx";

        while (i--) {
            tmp = jQuery._data(elements[ i ], type + "queueHooks");
            if (tmp && tmp.empty) {
                count++;
                tmp.empty.add(resolve);
            }
        }
        resolve();
        return defer.promise(obj);
    }
});
