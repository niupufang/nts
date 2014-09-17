/**
 * Storage内容仓库模块
 *
 * @author Kener (@Kener-林峰, linzhifeng@baidu.com)
 *         errorrik (errorrik@gmail.com)
 */

/**
 * 这个类，需要注意以下：
 *
 * 1.这是个典型的对象结构, var Storage = function () {}; Storage.prototype.add = function () {.....};
 * 2.方法附加在protype上，属性写在构造函数里，每个附加到prototype的方法都返回this，支持链式调用
 * 3.Storage n.贮存; 贮藏; 储藏处，仓库; 贮存器，蓄电（瓶）; 维护所有的shape，可以通过其中的一些属性进行查看
 */


define(
    function (require) {
        var util = require('./tool/util');
        var log = require('./tool/log');
        var config = require('./config');

        /**
         * 内容仓库 (M)
         * 
         */
        function Storage() {
            // 所有常规形状，id索引的map
            this._elements = {};

            // 所有形状的z轴方向排列，提高遍历性能，zElements[0]的形状在zElements[1]形状下方
            this._zElements = [];

            // 高亮层形状，不稳定，动态增删，数组位置也是z轴方向，靠前显示在下方
            this._hoverElements = [];

            // 最大zlevel
            this._maxZlevel = 0; 

            // 有数据改变的zlevel
            this._changedZlevel = {};
        }

        /**
         * 遍历迭代器
         * 
         * @param {Function} fun 迭代回调函数，return true终止迭代
         * @param {Object=} option 迭代参数，缺省为仅降序遍历常规形状
         *     hover : true 是否迭代高亮层数据
         *     normal : 'down' | 'up' | 'free' 是否迭代常规数据，迭代时是否指定及z轴顺序
         */
        Storage.prototype.iterShape = function (fun, option) {

            /**
             * 处理默认情况 option = option ||{ hover: false, normal: 'down'};
             */
            if (!option) {
                option = {
                    hover: false,  //不遍历高亮层
                    normal: 'down' //高层优先
                };
            }
            if (option.hover) {
                //高亮层数据遍历
                for (var i = 0, l = this._hoverElements.length; i < l; i++) {
                    if (fun(this._hoverElements[i])) {
                        return this;
                    }
                }
            }

            var zlist;
            var len;
            if (typeof option.normal != 'undefined') {
                //z轴遍历: 'down' | 'up' | 'free'
                switch (option.normal) {
                    case 'down':
                        // 降序遍历，高层优先
                        var l = this._zElements.length;
                        while (l--) {
                            zlist = this._zElements[l];
                            if (zlist) {
                                len = zlist.length;
                                while (len--) {
                                    if (fun(zlist[len])) {
                                        return this;
                                    }
                                }
                            }
                        }
                        break;
                    case 'up':
                        //升序遍历，底层优先
                        for (var i = 0, l = this._zElements.length; i < l; i++) {
                            zlist = this._zElements[i];
                            if (zlist) {
                                len = zlist.length;
                                for (var k = 0; k < len; k++) {
                                    if (fun(zlist[k])) {
                                        return this;
                                    }
                                }
                            }
                        }
                        break;
                    // case 'free':
                    default:
                        //无序遍历
                        for (var i in this._elements) {
                            if (fun(this._elements[i])) {
                                return this;
                            }
                        }
                        break;
                }
            }

            return this;
        };

        /**
         * 修改
         * 
         * @param {string} idx 唯一标识
         * @param {Object} params 参数
         */
        Storage.prototype.mod = function (shapeId, params) {
            var shape = this._elements[shapeId];
            if (shape) {
                shape.updateNeedTransform();
                shape.style.__rect = null;

                this._changedZlevel[shape.zlevel] = true;    // 可能修改前后不在一层

                /**
                 * 将参数合并，params && util.merge(shape, params, true);
                 *
                 * this._changedZlevel[shape.zlevel] = true; 这里是为了防范：
                 *
                 * var imageShape = new ImageShape({src:'xxx.png',zlevel:1});
                 * imageShape.mod({zlevel:3});
                 *
                 * 这里就是：level1和level3都变化了，_maxZlevel也变化了。
                 */

                if (params) {
                    util.merge(shape, params, true);
                }
                
                this._changedZlevel[shape.zlevel] = true;    // 可能修改前后不在一层
                this._maxZlevel = Math.max(this._maxZlevel, shape.zlevel);
            }

            return this;
        };

        /**
         * 常规形状位置漂移，形状自身定义漂移函数
         * 
         * @param {string} idx 形状唯一标识
         */
        Storage.prototype.drift = function (shapeId, dx, dy) {
            var shape = this._elements[shapeId];

            if (shape) {
                shape.needTransform = true;
                if (!shape.ondrift //ondrift
                    //有onbrush并且调用执行返回false或undefined则继续
                    || (shape.ondrift && !shape.ondrift(dx, dy))
                ) {
                    if (config.catchBrushException) {
                        try {
                            shape.drift(dx, dy);
                        }
                        catch(error) {
                            log(error, 'drift error of ' + shape.type, shape);
                        }
                    }
                    else {
                        shape.drift(dx, dy);
                    }
                }

                this._changedZlevel[shape.zlevel] = true;
            }

            return this;
        };

        /**
         * 添加高亮层数据
         * 
         * @param {Object} params 参数
         */
        Storage.prototype.addHover = function (params) {
            /**
             * 这里判断了一大推参数，来预处理是否需要变形，变形金刚（Transformers）
             * 豆瓣电影：http://movie.douban.com/subject/7054604/
             * 在最初添加的时候，处理变形开关，就不用在用到的时候重新做了
             */
            if ((params.rotation && Math.abs(params.rotation[0]) > 0.0001)
                || (params.position
                    && (Math.abs(params.position[0]) > 0.0001
                        || Math.abs(params.position[1]) > 0.0001))
                || (params.scale
                    && (Math.abs(params.scale[0] - 1) > 0.0001
                    || Math.abs(params.scale[1] - 1) > 0.0001))
            ) {
                params.needTransform = true;
            }
            else {
                params.needTransform = false;
            }

            this._hoverElements.push(params); //简单的将高亮层push到_hoverElements中
            return this;
        };

        /**
         * 删除高亮层数据
         */
        Storage.prototype.delHover = function () {
            this._hoverElements = [];
            return this;
        };

        Storage.prototype.hasHoverShape = function () {
            return this._hoverElements.length > 0;
        };

        /**
         * 添加
         * 
         * @param {Shape} shape 参数
         */
        Storage.prototype.add = function (shape) {
            shape.updateNeedTransform();
            shape.style.__rect = null;
            this._elements[shape.id] = shape;
            this._zElements[shape.zlevel] = this._zElements[shape.zlevel] || [];
            this._zElements[shape.zlevel].push(shape);

            this._maxZlevel = Math.max(this._maxZlevel, shape.zlevel);
            this._changedZlevel[shape.zlevel] = true;

            /**
             * _elements ->
             * {
             *      _zrender_101_: shapeObject,
             *      _zrender_102_: shapeObject,
             *      _zrender_103_: shapeObject,
             *      ...
             * }
             *
             * _zrender_103_ 为guid生成的
             *
             * _zElements ->
             * {
             *      1: [shapeObject,shapeObject],
             *      2: [shapeObject,shapeObject....],
             *      3. [...]
             * }
             *
             * 123 为层数
             *
             * _maxZlevel: 3
             * changedZlevel: {1:true,2:true....}
             */


            return this;
        };

        /**
         * 根据指定的shapeId获取相应的shape属性
         * 
         * @param {string=} idx 唯一标识
         */
        Storage.prototype.get = function (shapeId) {
            return this._elements[shapeId];
        };

        /**
         * 删除，shapeId不指定则全清空
         * 
         * @param {string= | Array} idx 唯一标识
         */
        Storage.prototype.del = function (shapeId) {
            if (typeof shapeId != 'undefined') {
                var delMap = {};

                /**
                 * 处理各种重载
                 * 1.如果不是个数组，直接加入到delMap中
                 * 2.如果是个数组，遍历之
                 */

                if (!(shapeId instanceof Array)) {
                    // 单个
                    delMap[shapeId] = true;
                }
                else {
                    // 批量删除
                    if (shapeId.lenth < 1) { // 空数组
                        return;
                    }
                    for (var i = 0, l = shapeId.length; i < l; i++) {
                        delMap[shapeId[i].id] = true;
                    }
                }
                var newList;
                var oldList;
                var zlevel;
                var zChanged = {};
                for (var sId in delMap) {
                    if (this._elements[sId]) {
                        zlevel = this._elements[sId].zlevel;
                        this._changedZlevel[zlevel] = true;

                        /**
                         * 这里主要处理zElements中元素的删除
                         * 这里确认每一个zlevel只遍历一次，因为一旦进入这个if，在if的末尾，就会将flag设置为false，下次就进不来
                         *
                         * 1.遍历delMap，取出单个shape的zlevel，然后从_zElements[zlevel] 取出所有，命名为oldList
                         * 2.遍历oldList，如果delMap中没有当前遍历的shape，就加入到newList，最后该层的_zElements[zlevel]就是newList
                         * 3.设置标志位，使之为false，表示该层已经被处理，就不要再次处理了
                         */
                        if (!zChanged[zlevel]) {
                            oldList = this._zElements[zlevel];
                            newList = [];
                            for (var i = 0, l = oldList.length; i < l; i++){
                                if (!delMap[oldList[i].id]) {
                                    newList.push(oldList[i]);
                                }
                            }
                            this._zElements[zlevel] = newList;
                            zChanged[zlevel] = true;
                        }

                        //将shape从_elements中删除
                        delete this._elements[sId];
                    }
                }
            }
            else{
                // 不指定shapeId清空
                this._elements = {};
                this._zElements = [];
                this._hoverElements = [];
                this._maxZlevel = 0;         //最大zlevel
                this._changedZlevel = {      //有数据改变的zlevel
                    all : true
                };
            }

            return this;
        };

        Storage.prototype.getMaxZlevel = function () {
            return this._maxZlevel;
        };

        Storage.prototype.getChangedZlevel = function () {
            return this._changedZlevel;
        };

        Storage.prototype.clearChangedZlevel = function () {
            this._changedZlevel = {};
            return this;
        };

        Storage.prototype.setChangedZlevle = function (level) {
            this._changedZlevel[level] = true;
            return this;
        };

        /**
         * 释放
         */
        Storage.prototype.dispose = function () {
            this._elements =  // 应该是等于 this._elements = undefined;
            this._zElements = 
            this._hoverElements = null;
        };

        return Storage;
    }
);
