/**
 * Created by Administrator on 2014/8/5 0005.
 */

require(['../src/zrender', '../src/shape/Image', '../src/shape/Text', '../src/shape/Circle'], function (zrender, ImageShape, TextShape, CircleShape) {

    var box = document.getElementById('box');

    /*box.addEventListener('click', function () {
        console.log('origin event click!');
    }, false);*/

    //var imageShape = new ImageShape({url:});

    var zr = zrender.init(box);

    /*zr.on('click', function () {
        console.log('zrender dispatch event:::CLICK!!!');
    });

    zr.on('mousewheel', function () {
        console.log('zrender dispatch event::: mousewheel');
    });*/


    /*zr.addShape(new ImageShape({
     style: {
     x: 100,
     y: 100,
     image: "../../bootstrap/images/backbone.png",
     width: 899,
     height: 160
     }
     }));*/

    zr.addShape(new CircleShape({
        style: {
            x: 120,
            y: 120,
            r: 50,
            color: 'red'
        },

        //clickable: true,
        //draggable : true,
        hoverable: true//,

       /* onclick: function () {
            console.log(1);
            //return true; 这里如果返回是不undefined或者不是false的话，就不会触发zr.on('click',function () {}) 绑定的函数了;
        },

        onmousewheel: function (eventPacket) {
            console.log(eventPacket);
        }*/
    }));


    zr.render();
});