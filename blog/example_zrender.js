Ext.define('Nts.Utils.ChartHelper', {
    singleton: true,
    shapeMap: {},
    requireMap: {},

    /**
     * 通过shape的类型获得shape的构造函数
     * 由于zrender的升级，所以导致该方法的出现，详情
     * see:https://github.com/ecomfe/zrender/wiki/2.x%E7%9B%B8%E6%AF%941.x%E7%9A%84%E5%8F%98%E5%8C%96
     *
     * @param shapeType shape类型
     * @returns {Constructor}
     */
    getShapeTypeConstructor: function (shapeType) {
        // 由于zrender2.0的addShape时不能add对象，只能add一个初始化好的shape类，
        // 所以每次都需要require加载所需的类，在这里，shapeMap是一个缓存对象
        // 因为echarts包含了requirejs的源码，但是没有将define和require方法暴露出来
        // 迫不得已修改了echarts的源代码,window.require = require;
        if (!this.shapeMap[shapeType]) {
            this.shapeMap[shapeType] = require('zrender/shape/' + Ext.String.capitalize(shapeType));
        }

        return this.shapeMap[shapeType];
    },

    /**
     * 根据shape类型和传入shape的参数，新建shape类，返回的结果可以直接被addShape
     *
     * 该方法有多个重载，如下
     *
     * 1.Nts.Utils.ChartHelper.makeShapeInstance('image',{scale:[1,2],hover:....});
     * 2.Nts.Utils.ChartHelper.makeShapeInstance({shape:'image',scale:[1,2],hover:....});
     *
     * 第2中方式为zrender1.x中兼容的方式，其中shape属性可以是 shape|shapeType|type
     *
     * @param shapeType shape类型
     * @param option 参数
     * @returns {Object} shape对象
     */
    makeShapeInstance: function (shapeType, option) {

        if (Ext.isObject(shapeType)) {
            option = shapeType;
            shapeType = option.shape || option.shapeType || option.type
        }

        var ctor = this.getShapeTypeConstructor(shapeType);
        if (!ctor) new Error('cannot find this shape in zrender');

        return new ctor(option);
    }
});
