$(function()
{
	var dtd = $.Deferred();

	var wait = function( dtd )
	{
		var tasks = function()
		{
			// dtd.reject();
			dtd.resolve(); // 改变deferred对象的执行状态
		};

		setTimeout(tasks, 1000);
		return dtd;
	};

	$.when(wait(dtd)).done(function()
	{
		alert('good');
	}).fail(function()
	{
		alert('bad');
	});

});
