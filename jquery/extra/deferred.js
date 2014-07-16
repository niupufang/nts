$(function()
{
	$.ajax('../AUTHORS.txt').done(function()
	{
		console.log('success!!');
	}).fail(function()
	{
		console.log('failure');
	}).done(function()
	{
		console.log(1);
	}).done(function()
	{
		console.log(2);
	}).done(function()
	{
		console.log(3);
	}).done(function()
	{
		console.log(4);
	}).done(function()
	{
		console.log(5);
	}).done(function()
	{
		console.log(6);
	}).done(function()
	{
		console.log(7);
	});

	$.when($.ajax('../AUTHORS.txt'), $.ajax('../MIT-LICENSE.txt')).done(function()
	{
		console.log('Both Success');
	}).fail(function()
	{
		console.log('Someone is NOT success');
	});
});
