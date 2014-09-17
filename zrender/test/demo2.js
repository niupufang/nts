require(['../src/zrender',
    '../src/shape/Image',
    '../src/shape/Text',
    '../src/shape/Circle'],
    function (zrender, ImageShape, TextShape, CircleShape) {

    var box = document.getElementById('box');
    var zr = zrender.init(box);


    zr.addShape(new CircleShape({
        style: {
            x: 120,
            y: 120,
            r: 50,
            color: 'red'
        },
        hoverable: true
    }));

    zr.addShape(new TextShape({
        style: {
            x: 220,
            y: 220,
            color: 'red',
            text: 'something text'
        },
        hoverable: true,
        zlevel: 2
    }));


    zr.render();
});