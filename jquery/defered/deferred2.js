$(function()
{
	var wait = function()
	{
		var dtd = $.Deferred();

		var tasks = function()
		{
			// dtd.reject();
			dtd.resolve(); // 改变deferred对象的执行状态
		};

		setTimeout(tasks, 5000);

		return dtd.promise();
	};

	$.when(wait()).done(function()
	{
		alert('good');
	}).fail(function()
	{
		alert('bad');
	});
});
