function Parent( name )
{
	this.name = name;

	this.colors =
	[
	    1, 2, 3, 4
	];
}

Parent.prototype =
{
	constructor: Parent,
	sayName: function()
	{
		console.log(this.name);
	},
	sayInfo: function()
	{
		console.log('parent say : ' + this.name);
	}
};

function Child( name, age )
{
	Parent.call(this, name); // 第二次调用父类
	this.age = age;
}

// Child.prototype = new Parent(); //第一次调用父类

// Child.prototype.constructor = Child;

var F = function()
{
};

F.prototype = Parent.prototype;

Child.prototype = new F();
Child.prototype.constructor = Child;
Child.prototype.superclass = Parent.prototype;

Child.prototype.sayInfo = function()
{
	console.log(Child.prototype.superclass.sayInfo.call(this, 'something.......'));
	console.log(this.name + ',' + this.age);
};
