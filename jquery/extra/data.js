var box = $('#box');
box.data('someattr', 'value1');

console.log(box.data('someattr'));
console.log(box.data());

var someobject = {
    name: 'lonelyclick',
    age: 11
};

var o = $(someobject);

o.data('someattr', 'value1');

console.log(o.data('someattr'), someobject);

o.data({something: 'abc', ddd: 'aaa', ccc: 'eee'});

console.log(o.data(), someobject);

var h5box = document.getElementById('h5box');

$.type(h5box.dataset) === 'object' && console.log(h5box.dataset.option, h5box.dataset.toggle);

console.log($.type(h5box.dataset),typeof h5box.dataset);

console.log($('#h5box').data());