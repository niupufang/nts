/**
 * Created by Administrator on 2014/7/3 0003.
 */

var fn = function ()
{
    console.log(document.documentElement.clientHeight + ' , ' + document.documentElement.clientWidth);
};

$(window).resize(_.debounce(fn,250/*,true*/));