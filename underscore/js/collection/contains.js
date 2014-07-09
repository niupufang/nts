/**
 * Created by Administrator on 2014/7/9 0009.
 */

var array = [
    1,
    true,
    'abc',
    1.3,
    /abc/
];

console.log(_.contains(array, true));
console.log(_.contains(array, 1.3));
console.log(_.contains(array, 1.2));
console.log(_.contains(array, false));
console.log(_.contains(array, /abc/));

var o = {name: 'a', age: 12};

console.log(_.contains(o, 'a'));
console.log(_.contains(o, 'name'));