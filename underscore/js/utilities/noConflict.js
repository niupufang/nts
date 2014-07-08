/**
 * Created by Administrator on 2014/7/8 0008.
 */

var underscore = _.noConflict();

console.log(underscore, _);

underscore.each([
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8
], function (ele, index, all)
{
    console.log(ele, index, all);
});