/**
 * Created by Administrator on 2014/7/4 0004.
 */

var stooges = [
    {name: 'curly', age: 25},
    {name: 'moe', age: 21},
    {name: 'larry', age: 23}
];

var a = _.chain(stooges).sortBy(function (stooge)
{
    return stooge.age;
}).tap(_.bind(console.log,console)).map(function (ele)
{
    return ele.name + ' , ' + ele.age;
}).first().value();

console.log(a);