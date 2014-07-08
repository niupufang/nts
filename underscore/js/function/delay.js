/**
 * Created by Administrator on 2014/7/3 0003.
 */

var fn = function (message)
{
    console.log(message);
}

_.delay(fn, 1000, 'something delay 1000');


_.defer(fn, 'defer');

console.time('something');

for (var i = 0; i < 10000000; i++)
{

}

console.timeEnd('something');

function updatePosition()
{
    console.log(Math.random());
}

$(window).scroll(_.throttle(updatePosition, 500));