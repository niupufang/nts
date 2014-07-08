/**
 * Created by Administrator on 2014/7/8 0008.
 */

_.mixin({cap: function (str)
{
    return str.substring(0, 1).toUpperCase() + str.substring(1);
}});

console.log(_.cap('hello'));