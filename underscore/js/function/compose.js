/**
 * Created by Administrator on 2014/7/3 0003.
 */

var three = function (a, b)
{
    console.log('this is three', arguments);
    return 'this is three';
}

var two = function (message)
{
    console.log('message is ' + message);
    console.log('this is function 2');

    return 'two';
}

var one = function (message)
{
    console.log('one message is ' + message);

    return 'this is finally function';
};

console.log(_.compose(one, two, three)(1, 2));
