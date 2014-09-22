require(
[
    'zrender', 'zrender/shape/Path'
], function( zrender, PathShape )
{
	var box = document.getElementById('box');
	var zr = zrender.init(box);

	$.get('he_nan_geo.json', function( data )
	{
		var map = new GeoMap(null, zrender, PathShape);

		map.load(data);

		map.render();
	});
});
