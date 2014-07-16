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

var callbacks = $.Callbacks();

callbacks.add(fn1);
callbacks.fire('foo');

callbacks.add(fn2);
callbacks.fire('bar');

callbacks.remove(fn2);

callbacks.add(fn3);
callbacks.fire('infoq');

// ----------------------------------------------------------------
console.log('########################');

var cbs = $.Callbacks('once'); // fire只能触发一次

cbs.add(fn1);
cbs.fire('aaa');
cbs.add(fn2);
cbs.fire('bbb');

// ----------------------------------------------------------------
console.log('########################');

var cbs = $.Callbacks('memory'); // 有记忆功能

cbs.add(fn1);
cbs.fire('aaa');
cbs.add(fn2);
cbs.fire('bbb');

// ----------------------------------------------------------------
console.log('########################');

var cbs2 = $.Callbacks('unique'); // 对于相同的函数，只调用一次

cbs2.add(fn1);
cbs2.add(fn1);
cbs2.add(fn1);
cbs2.fire('aaa');
cbs2.add(fn2);
cbs2.add(fn2);
cbs2.add(fn2);
cbs2.add(fn2);
cbs2.add(fn2);
cbs2.add(fn2);
cbs2.fire('bbb');

// ----------------------------------------------------------------
console.log('########################');

function fn4()
{
	console.log('I am fn4');
	return false;
}

var cbs3 = $.Callbacks('stopOnFalse'); // 对于相同的函数，只调用一次

cbs3.add(fn1);
cbs3.add(fn1);
cbs3.add(fn1);
cbs3.fire('aaa');
cbs3.add(fn4);
cbs3.add(fn2);
cbs3.add(fn2);
cbs3.add(fn2);
cbs3.add(fn2);
cbs3.add(fn2);
cbs3.add(fn2);
cbs3.fire('bbb');

//$.Callbacks( 'unique memory' )
