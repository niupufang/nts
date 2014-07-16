

function extend( child, parent, option )
{
	/*
	 * if( !child ) { child = function() { this.superclass.call(this, option); }; }
	 */

	var io = function()
	{
		child.superclass.constructor.call(this);
	};

	if( !child )
	{
		child = io;
	}

	var F = function()
	{
	};

	F.prototype = parent.prototype;
	child.prototype = new F();
	child.prototype.constructor = child;

	child.superclass = parent.prototype;

	return child;
}

function Parent()
{
	this.name = 'abc';
	this.colors =
	[
	    1, 2, 3, 4, 5
	];
}

Parent.prototype =
{
	constructor: Parent,
	sayInfo: function()
	{
		return this.name;
	}
};

function Child( config )
{
	Child.superclass.constructor.call(this, config);
}

extend(Child, Parent,
{
	age: 11
});

// var child = new Child();
