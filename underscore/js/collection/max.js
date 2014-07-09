/**
 * Created by Administrator on 2014/7/9 0009.
 */

var arr = [
    4345,
    3453,
    24,
    213,
    45
];

var o = [
    {name: 'hh', age: 1},
    {name: 'gg', age: 12}
];

console.log(_.max(arr));
console.log(_.min(arr));

console.log(_.max(o, function (ele)
{
    return ele.age;
}));

console.log(_.min(o, function (ele)
{
    return ele.age;
}));
