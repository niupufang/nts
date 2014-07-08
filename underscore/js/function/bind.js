/**
 * Created by Administrator on 2014/7/3 0003.
 */
var fun = function (greeting)
{
    return greeting + ' , ' + this.name;
};


var fn = _.bind(fun, {name: 'something you known'}, 'lonelyclick');

console.log(fn());

var someObject =
{
    add: function ()
    {
        console.log(this);
    },

    click: function ()
    {
        console.log(this);
    },

    name: 'something',
    age: 111
};

_.bindAll(someObject,'add','click');

someObject.add();
someObject.click();
