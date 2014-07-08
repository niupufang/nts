/**
 * Created by Administrator on 2014/7/3 0003.
 */

var names = [
    100,
    200,
    300,
    500
];

var flex = {people: [
    {name: 'a', price: 11},
    {name: 'b', price: 42},
    {name: 'c', price: 98}
]};

var order = [
    1,
    2,
    4,
    5,
    6,
    7,
    8,
    9
];


var result = _.reduce(names, function (memo, curr, index, all)
{
    console.log(memo, curr, index, all);
    return memo + curr;
});

console.log(result);

result = _.reduce(flex.people, function (memo, curr, index, all)
{
    console.log(memo, curr, index, all);
    return memo + curr.price;
}, 0);

console.log(result);

result = _.reduceRight(order, function (memo, curr)
{
    if (memo)
    {
        return memo + ',' + curr;
    }
    else
    {
        return memo + curr;
    }
}, '');

console.log(result);

console.log(order.reverse().join(','));