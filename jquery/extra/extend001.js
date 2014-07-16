function Parent()
{
	this.property = true;

	this.colors =
	[
	    'a', 'b', 'c'
	];
}

Parent.prototype.getParentValue = function()
{
	return this.property;
};

function Child()
{
	this.subProperty = false;
}

Child.prototype = new Parent();

Child.prototype.getSubValue = function()
{
	return this.subProperty;
};

Child.prototype.constructor = Child;

// var instance = new Child();

var c1 = new Child();
var c2 = new Child();

console.log(c1.colors);
console.log(c2.colors);

c1.colors.push('d');

console.log(c1.colors);
console.log(c2.colors);

// 1.这就出现了问题，相当于把属性用在了prototype上
// 2.无法在创建子类时，向父类构造函数传递参数

//function Child()
//{
//
//}
//
//Child.prototype.colors =
//[
//    1, 2, 3, 4
//];

//所有的实例共用一个变量，当然是不行的
