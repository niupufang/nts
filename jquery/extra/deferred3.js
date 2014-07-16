$(function()
{
	var wait = function( dtd )
	{
		var tasks = function()
		{
			// dtd.reject();
			dtd.resolve(); // 改变deferred对象的执行状态
		};

		setTimeout(tasks, 5000);

		return dtd.promise();
	};

	$.Deferred(wait).done(function()
	{
		alert("哈哈，成功了！");
	}).fail(function()
	{
		alert("出错啦！");
	});
});
