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

_.each(names, function (ele, index, all)
{
    console.log(ele, index, all, this);
}, {a: 1, b: 2});

_(names).each(function (ele, index, all)
{
    console.log(ele, index, all, this);
});

_.each(map, function (value, key)
{
    console.log(value, key);
});

_(map).each(function (value, key)
{
    console.log(value, this.getMessage(key));
}, somethingObject);