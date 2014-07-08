/**
 * Created by Administrator on 2014/7/3 0003.
 */

var o = [
    {name: 'lonelyclick', age: 11},
    {name: 'hhstuhacker', age: 33},
    {name: 'someone', age: 32},
    {name: 'yanglg', age: 99},
    {name: 'yanglg', age: 100}
];

var result = _.where(o, {name: 'yanglg'});

console.log(result);