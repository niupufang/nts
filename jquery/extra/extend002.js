function Parent( name )
{
	this.name = name;
	this.colors =
	[
	    1, 2, 3, 4
	];
}

function Child( age )
{
	Parent.call(this, 'John');
	this.age = age;
}

var c1 = new Child(11);
var c2 = new Child(22);

c1.colors.push(5);

console.log(c1.colors);
console.log(c1.name);
console.log(c1.age);

console.log(c2.colors);
console.log(c2.name);
console.log(c2.age);

//问题：
// 1.方法只能写在构造函数里，无法复用
// 2.子类无法看到父类的方法