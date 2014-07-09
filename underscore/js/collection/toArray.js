/**
 * Created by Administrator on 2014/7/9 0009.
 */

function add()
{
    console.log(_.toArray(arguments));
}

add(1, 2, 3, 4, 5, 6);

console.log(_.toArray({a: 'aaa', b: 'ccc'}));

console.log(_.toArray('somethingyoudonot want'));