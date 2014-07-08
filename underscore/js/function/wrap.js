/**
 * Created by Administrator on 2014/7/3 0003.
 */

var foo = function ()
{
    console.log('FOO');
}

var bar = function (func, message)
{
    func();

    console.log('BAR ' + message);
};

var fn = _.wrap(foo, bar);

fn('some message');

_.wrap({a: 1, b: 2}, function (o, message)
{
    console.log(o);
    console.log('this is ' + message);
})('Message It is!!!');