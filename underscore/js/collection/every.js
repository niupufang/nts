/**
 * Created by Administrator on 2014/7/9 0009.
 */

var arr = [
    1,
    2,
    3,
    4,
    5,
    6,
    7
];

console.log(_.every([
    true,
    1,
    'a',
    'ddd'
]));
console.log(_.every([
    true,
    1,
    'a',
    'ddd',
    false
]));


console.log(_.every(arr, function (ele)
{
    console.log(this);
    return ele > 0;
}));
console.log(_.every(arr, function (ele)
{
    console.log(this);
    return ele > 1;
}, {a: 1}));
