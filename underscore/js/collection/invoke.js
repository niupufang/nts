/**
 * Created by Administrator on 2014/7/9 0009.
 */

var o = [
    [
        3,
        5,
        6,
        2,
        1
    ],
    [
        32,
        34,
        6,
        2,
        3,
        5
    ]
];

function msort(arr)
{
    arr.sort(function (a, b)
    {
        return a - b;
    });
}

console.log(_.invoke(o, 'msort'));