/**
 * Created by Administrator on 2014/7/3 0003.
 */


var names = [
        'hhstuhacker',
        'lonelyclick',
        'someone',
        'otherone'
    ], map = {hhstuhacker: 11, lonelyclick: 22, someone: 33, otherone: 44},
    somethingObject = {getMessage: function (name)
    {
        return 'Hello , ' + name;
    }};

var m = _.map(names, function (ele, index, all)
{
    return 'Hello , ' + ele;
});

console.log(m);

var n = _.map(map, function (value, key)
{
    return value + ' !!!';
});

console.log(n);