/**
 * Created by Administrator on 2014/7/4 0004.
 */

var o = {name: 'abc', age: 11};
var oo = {address: 'somehow', dd: 'ssss', age: 45};

var ooo = _.extend(o, oo);

console.log(ooo, oo, o);