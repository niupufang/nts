function fn1( value )
{
	console.log('fn1 says:::' + value);
}

function fn2( value )
{
	console.log('fn2 says:::' + value);
}

function fn3( value )
{
	console.log('fn3 says:::' + value);
}

var callbacks = $.Callbacks('once memory');

callbacks.add(fn1);
callbacks.add(fn3);
callbacks.fire('infoq');
callbacks.add(fn2);
callbacks.fire('infoq2222');
//callbacks.add(fn1);
//callbacks.add(fn2);

