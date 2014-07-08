/**
 * Created by Administrator on 2014/7/3 0003.
 */

var ns = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10
], objectArray = [
    {name: 'a', price: 1},
    {name: 'b', price: 2},
    {name: 'c', price: 3},
    {name: 'd', price: 4},
    {name: 'e', price: 5}
];

var result = _.reject(ns, function (ele, index, all)
{
    console.log(ele, index, all);
    return ele % 2 === 0;
});

console.log(result);

result = _.reject(ns, function (ele, index, all)
{
    console.log(ele, index, all, this);
    return ele % 2 !== 0;
}, {a: 1});

console.log(result);

result = _.reject(objectArray, function (ele, index, all)
{
    return ele.price > 3;
});

console.log(result);