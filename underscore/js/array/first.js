/**
 * Created by Administrator on 2014/7/3 0003.
 */

var arr = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
];

console.log(_.first(arr));
console.log(_.first(arr, 3));

console.log(_.initial(arr));
console.log(_.initial(arr, 3));


console.log(_.last(arr));
console.log(_.last(arr, 2));
console.log(_.rest(arr));
console.log(_.rest(arr, 4));