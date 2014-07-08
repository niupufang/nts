/**
 * Created by Administrator on 2014/7/3 0003.
 */


console.log(_.without([
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    2,
    3,
    4,
    6,
    3
], 3, 4));

console.log(_.union([
    1,
    2,
    3,
    4,
    5
], [
    3,
    4,
    5,
    6,
    7,
    8,
    9
], [
    1,
    2
]));

console.log(_.difference([
    1,
    2,
    3,
    4,
    5
], [
    5,
    2,
    10
]));

console.log(_.uniq([
    1,
    2,
    3,
    1,
    3,
    5,
    4,
    3,
    2
]));

console.log(_.uniq([
    1,
    2,
    3,
    1,
    3,
    5,
],true));