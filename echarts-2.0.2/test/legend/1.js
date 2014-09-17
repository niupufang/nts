require.config({
    baseUrl: '../../src',
    urlArgs: '_dc=' + new Date().getTime()
});

// 使用
require(
    [
        'echarts',
        'chart/bar',
        'chart/map',
        'component/grid',
        'component/dataZoom',
        'component/axis',
        'component/legend',
        'component/dataRange',
        'zrender',
        'zrender/tool/util'
    ],
    function (ec) {
        // 基于准备好的dom，初始化echarts图表
        var myChart = ec.init(document.getElementById('box'));

        var option = {
            title: {
                text: 'iphone销量',
                subtext: '纯属虚构',
                x: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data: ['iphone3', 'iphone4', 'iphone5']
            },
            dataRange: {
                min: 0,
                max: 100,
                x: 'right',
                y: 'bottom',
                //text:['高','低'],           // 文本，默认为数值文本
                itemGap: 0,
                calculable: false,
                splitNumber: 6,
                precision: 2,
                formatter: function (v, v2) {
                    console.log(v, v2);
                    return 'A';
                },

                getColor: function (value) {
                    if (value < 20) return 'red';
                    else if (value < 30) return 'blue';
                    else if(value < 50) return 'black';
                    else if(value < 70) return '#ededda';
                    else if (value <= 100) return 'green';
                    return '#f60';
                },

                forceHeight: true,
                textOpposite: false
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                x: 'right',
                y: 'center',
                feature: {
                    mark: {show: true},
                    dataView: {show: true, readOnly: false},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            roamController: {
                show: true,
                x: 'right',
                mapTypeControl: {
                    'china': true
                }
            },
            series: [
                {
                    name: 'iphone3',
                    type: 'map',
                    mapType: 'china',
                    roam: false,
                    itemStyle: {
                        normal: {label: {show: true}},
                        emphasis: {label: {show: true}}
                    },
                    data: [
                        {name: '北京', value: Math.random() * 100},
                        {name: '天津', value: Math.random() * 100},
                        {name: '上海', value: Math.random() * 100},
                        {name: '重庆', value: Math.random() * 100},
                        {name: '河北', value: Math.random() * 100},
                        {name: '河南', value: Math.random() * 100},
                        {name: '云南', value: Math.random() * 100},
                        {name: '辽宁', value: Math.random() * 100},
                        {name: '黑龙江', value: Math.random() * 100},
                        {name: '湖南', value: Math.random() * 100},
                        {name: '安徽', value: Math.random() * 100},
                        {name: '山东', value: Math.random() * 100},
                        {name: '新疆', value: Math.random() * 100},
                        {name: '江苏', value: Math.random() * 100},
                        {name: '浙江', value: Math.random() * 100},
                        {name: '江西', value: Math.random() * 100},
                        {name: '湖北', value: Math.random() * 100},
                        {name: '广西', value: Math.random() * 100},
                        {name: '甘肃', value: Math.random() * 100},
                        {name: '山西', value: Math.random() * 100},
                        {name: '内蒙古', value: Math.random() * 100},
                        {name: '陕西', value: Math.random() * 100},
                        {name: '吉林', value: Math.random() * 100},
                        {name: '福建', value: Math.random() * 100},
                        {name: '贵州', value: Math.random() * 100},
                        {name: '广东', value: Math.random() * 100},
                        {name: '青海', value: Math.random() * 100},
                        {name: '西藏', value: Math.random() * 100},
                        {name: '四川', value: Math.random() * 100},
                        {name: '宁夏', value: Math.random() * 100},
                        {name: '海南', value: Math.random() * 100},
                        {name: '台湾', value: Math.random() * 100},
                        {name: '香港', value: Math.random() * 100},
                        {name: '澳门', value: Math.random() * 100}
                    ]
                },
                {
                    name: 'iphone4',
                    type: 'map',
                    mapType: 'china',
                    itemStyle: {
                        normal: {label: {show: true}},
                        emphasis: {label: {show: true}}
                    },
                    data: [
                        {name: '北京', value: Math.random() * 100},
                        {name: '天津', value: Math.random() * 100},
                        {name: '上海', value: Math.random() * 100},
                        {name: '重庆', value: Math.random() * 100},
                        {name: '河北', value: Math.random() * 100},
                        {name: '安徽', value: Math.random() * 100},
                        {name: '新疆', value: Math.random() * 100},
                        {name: '浙江', value: Math.random() * 100},
                        {name: '江西', value: Math.random() * 100},
                        {name: '山西', value: Math.random() * 100},
                        {name: '内蒙古', value: Math.random() * 100},
                        {name: '吉林', value: Math.random() * 100},
                        {name: '福建', value: Math.random() * 100},
                        {name: '广东', value: Math.random() * 100},
                        {name: '西藏', value: Math.random() * 100},
                        {name: '四川', value: Math.random() * 100},
                        {name: '宁夏', value: Math.random() * 100},
                        {name: '香港', value: Math.random() * 100},
                        {name: '澳门', value: Math.random() * 100}
                    ]
                },
                {
                    name: 'iphone5',
                    type: 'map',
                    mapType: 'china',
                    itemStyle: {
                        normal: {label: {show: true}},
                        emphasis: {label: {show: true}}
                    },
                    data: [
                        {name: '北京', value: Math.random() * 100},
                        {name: '天津', value: Math.random() * 100},
                        {name: '上海', value: Math.random() * 100},
                        {name: '广东', value: Math.random() * 100},
                        {name: '台湾', value: Math.random() * 100},
                        {name: '香港', value: Math.random() * 100},
                        {name: '澳门', value: Math.random() * 100}
                    ]
                }
            ]
        };

        // 为echarts对象加载数据
        myChart.setOption(option);
    }
);