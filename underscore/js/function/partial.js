/**
 * Created by Administrator on 2014/7/3 0003.
 */

var fn = function (a, b, c, d, e, f)
{
    return a + b + c + d + e + f;
};

var fn2 = _.partial(fn, 5);

console.log(fn2(10, 12, 14, 16, 18));