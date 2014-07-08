/**
 * Created by Administrator on 2014/7/8 0008.
 */

var o = {name: 'lonelyclick', age: 111, full: function ()
{
    return 'this is full';
}};

console.log(_.result(o,'name'));
console.log(_.result(o,'age'));
console.log(_.result(o,'full'));