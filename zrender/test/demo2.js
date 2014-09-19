require(
[
    '../src/zrender', '../src/shape/Image', '../src/shape/Text', '../src/shape/Circle', '../src/loadingEffect/Bar'
], function( zrender, ImageShape, TextShape, CircleShape, BarEffect )
{

	var box = document.getElementById('box');
	var zr = zrender.init(box);

	zr.addShape(new CircleShape(
	{
		style:
		{
			x: 120,
			y: 120,
			r: 50,
			color: 'red'
		},
		// hoverable: true,
		clickable: true,
		onclick: function()
		{
			// alert('click on red shape!')

			zr.showLoading(new BarEffect(
			{
				textStyle:
				{
					text: '加载中'
				}
			}));
		}
	}));

	var textShape = new TextShape(
	{
		style:
		{
			x: 220,
			y: 220,
			color: 'red',
			text: 'something text'
		},
		hoverable: true,
		zlevel: 2
	});

	var imageShape = zr.shapeToImage(textShape, 1000, 600);
	zr.addShape(imageShape);
	
	zr.render();
});
