/* tursics.ddj.voronoi.js */
/* version 0.1 */

/*jslint browser: true*/
/*global console,L, d3*/

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

ddj.voronoi = {

	// -------------------------------------------------------------------------

	settings: {
		markerRadius: 3,
		markerColor: '#1f78b4',
		onMouseOver: null,
		onMouseOut: null,
		onClick: null
	},

	// -------------------------------------------------------------------------

	data: {
		userData: null,
		map: null,
		svg: null,
		g: null,
		geomVoronoi: null,
		versionLeaflet: 0
	},

	// -------------------------------------------------------------------------

	init: function (leafletMap, elementName, data, settings) {
		'use strict';

		if ((typeof L === 'undefined') || (L === null)) {
			console.error('Error: Please include leaflet.js in your html file.');
			return;
		}
		if ((typeof d3 === 'undefined') || (d3 === null)) {
			console.error('Error: Please include d3.js in your html file.');
			return;
		}

		var key;

		if ((settings !== null) && (typeof (settings) === 'object')) {
			for (key in settings) {
				if (settings.hasOwnProperty(key) && ddj.voronoi.settings.hasOwnProperty(key)) {
					ddj.voronoi.settings[key] = settings[key];
				}
			}
		}

		ddj.voronoi.data.userData = data;
		ddj.voronoi.data.map = leafletMap;
		ddj.voronoi.data.versionLeaflet = parseInt(L.version.split('.')[0], 10);

		if (0 === ddj.voronoi.data.versionLeaflet) {
			ddj.voronoi.data.map._initPathRoot();
		} else {
			L.svg().addTo(ddj.voronoi.data.map);
		}

		ddj.voronoi.data.svg = d3.select('#' + elementName).select('svg');

		if (0 === ddj.voronoi.data.versionLeaflet) {
			ddj.voronoi.data.g = ddj.voronoi.data.svg.append('g').attr('class', 'leaflet-zoom-hide');
		} else {
			ddj.voronoi.data.g = ddj.voronoi.data.svg.select('g');
			ddj.voronoi.data.g.attr('class', 'leaflet-zoom-hide');
		}

		ddj.voronoi.data.geomVoronoi = d3.geom.voronoi()
			.x(function (d) {
				return d.x;
			})
			.y(function (d) {
				return d.y;
			});
//			.clipExtent([[0, 0], [width, height]]);

		ddj.voronoi.data.map.on('viewreset moveend', ddj.voronoi.update);
		ddj.voronoi.update();
//		clipVoronoi();
	},

	update: function () {
		'use strict';

		var positions = [],
			layerPolygons = null,
			key,
			val;

		for (key = 0; key < ddj.voronoi.data.userData.length; ++key) {
			val = ddj.voronoi.data.userData[key];

			if ((typeof val.lat !== 'undefined') && (typeof val.lng !== 'undefined')) {
				var latlng = new L.LatLng(val.lat, val.lng),
					color = getColor(val),
					district = val.BSN.substr(0, 2),
					schoolType = val.BSN.substr(2, 1),
					hexColor = color === 'red' ? '#e31a1c' :
									color === 'orange' ? '#fdbf6f' :
											color === 'green' ? '#33a02c' :
													'#a3a3a3',
					hexColorBrighter = '#ffffff';

				if (('all' === settings.type) || (schoolType === settings.type)) {
					positions.push({
						index: key,
						x: ddj.voronoi.data.map.latLngToLayerPoint(latlng).x,
						y: ddj.voronoi.data.map.latLngToLayerPoint(latlng).y,
						data: val,
						markerColor: color === 'orange' ? '#ff7f00' : hexColor,
						hotSpot: 'x' === val['Brennpunktschule-2018'],
						color: (settings.district === district) || (settings.district === 'berlin') ? hexColor + '80' : hexColorBrighter + '80'
					});
				}
			}
		}

		d3.selectAll('.AEDpoint').remove();

		if (settings.showHotspots) {
			ddj.voronoi.data.g.selectAll('circle')
				.data(positions)
				.enter()
				.append('circle')
				.attr('class', 'AEDpoint')
				.attr({
					'cx': function (d) {
						return d.x;
					},
					'cy': function (d) {
						return d.y;
					},
					'r': ddj.voronoi.settings.markerRadius,
					fill: ddj.voronoi.settings.markerColor
				});
		}

		layerPolygons = ddj.voronoi.data.geomVoronoi(positions);
		layerPolygons.forEach(function (v) {
			v.cell = v;
		});

		ddj.voronoi.data.svg.selectAll('.voronoi').remove();
		ddj.voronoi.data.svg.selectAll('path')
			.data(layerPolygons)
			.enter()
			.append('svg:path')
			.attr('class', 'voronoi')
			.attr({
				'd': function (d) {
					if (!d) {
						return null;
					}
					return 'M' + d.cell.join('L') + 'Z';
				},
				stroke: '#777',
				fill: function (d) {
					if (d && d.point && d.point.color) {
						return d.point.color;
					}
					return 'none';
				}
			})
			.on('mouseover', function (d, i) {
				ddj.voronoi.settings.onMouseOver(ddj.voronoi.data.userData[positions[i].index]);
			})
			.on('mouseout', function (d, i) {
				ddj.voronoi.settings.onMouseOut(ddj.voronoi.data.userData[positions[i].index]);
			})
			.on('click', function (d, i) {
				ddj.voronoi.settings.onClick(ddj.voronoi.data.userData[positions[i].index]);
			});
	}

	/*
	function clipVoronoi() {
		'use strict';

		// http://publicatodo.co/Detalles/6043/Create-d3-hull-to-clip-voronoi-diagram-on-leaflet-map

		var pointsFilteredToSelectedTypes = function () {
			return ddj.voronoi.data.userData.filter(function (item) {
				return true;
			});
		};

		var bounds = ddj.voronoi.data.map.getBounds(),
			existing = d3.set(),
			drawLimit = bounds.pad(0.4);

		// Hull Function to create polygon from points //
		var hullPoints = pointsFilteredToSelectedTypes().filter(function (d) {
			var latlng = new L.LatLng(d.lat, d.lng);

			if (!drawLimit.contains(latlng)) {
				return false
			};

			var point = ddj.voronoi.data.map.latLngToLayerPoint(latlng);

			var key = point.toString();
			if (existing.has(key)) { return false };
			existing.add(key);

			d.x = point.x;
			d.y = point.y;
			return true;
		});

		var hullFunction = d3.geom.hull()
			.x(function (d) {
				return d.x;
			})
			.y(function (d) {
				return d.y;
			});

		var svgHull = d3.select(ddj.voronoi.data.map.getPanes().overlayPane).append("svg")
			.attr("id", "overlay")
			.attr("class", "leaflet-zoom-hide")
			.style("width", ddj.voronoi.data.map.getSize().x + "px")
			.style("height", ddj.voronoi.data.map.getSize().y + "px");

		svgHull.append("rect")
			.attr("width", ddj.voronoi.data.map.getSize().x + "px")
			.attr("height", ddj.voronoi.data.map.getSize().y + "px");

		var hull = svgHull.append("path")
			.attr("class", "hull");

		var circle = svgHull.selectAll("circle");

		redraw();

		function redraw() {
			hull.datum(d3.geom.hull(hullPoints)).attr("d", function (d) {
				return "M" + d.join("L") + "Z";
			});

			circle = circle.data(hullPoints);
			circle.enter().append("circle").attr("r", 3);
			circle.attr("transform", function(d) {
				return "translate(" + d + ")";
			});
		}
	}
	*/

};

// -----------------------------------------------------------------------------
