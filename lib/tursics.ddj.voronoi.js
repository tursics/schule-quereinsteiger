/* tursics.ddj.voronoi.js */
/* version 0.1 */

/*jslint browser: true*/
/*global console,L,d3*/

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

(function () {

	'use strict';

	// -------------------------------------------------------------------------

	ddj.voronoi = {

		// ---------------------------------------------------------------------

		settings: {
			markerRadius: 3,
			markerFill: '#1f78b4',
			markerX: function (data) {
				return data.x;
			},
			markerY: function (data) {
				return data.y;
			},
			onAdd: function () {
				return true;
			},
			onMouseOver: null,
			onMouseOut: null,
			onClick: null,
			pathStroke: '#1f78b4',
			pathFill: function (data) {
				if (data && data.point && data.point.color) {
					return data.point.color;
				}
				return 'none';
			}
		},

		// ---------------------------------------------------------------------

		store: {
			svg: null,
			g: null,
			geomVoronoi: null,
			versionLeaflet: 0
		},

		// ---------------------------------------------------------------------

		init: function (settings) {
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

			ddj.voronoi.store.versionLeaflet = parseInt(L.version.split('.')[0], 10);

			if (0 === ddj.voronoi.store.versionLeaflet) {
				ddj.getMap()._initPathRoot();
			} else {
				L.svg().addTo(ddj.getMap());
			}

			ddj.voronoi.store.svg = d3.select('#' + ddj.getMapDOMName()).select('svg');

			if (0 === ddj.voronoi.store.versionLeaflet) {
				ddj.voronoi.store.g = ddj.voronoi.store.svg.append('g').attr('class', 'leaflet-zoom-hide');
			} else {
				ddj.voronoi.store.g = ddj.voronoi.store.svg.select('g');
				ddj.voronoi.store.g.attr('class', 'leaflet-zoom-hide');
			}

			ddj.voronoi.store.geomVoronoi = d3.geom.voronoi()
				.x(function (d) {
					return d.x;
				})
				.y(function (d) {
					return d.y;
				});
//				.clipExtent([[0, 0], [width, height]]);

			ddj.getMap().on('viewreset moveend', ddj.voronoi.update);
			ddj.voronoi.update();
//			clipVoronoi();
		},

		// ---------------------------------------------------------------------

		update: function () {
			var positions = [],
				layerPolygons = null,
				key,
				val,
				latlng,
				obj,
				addObj;

			if (ddj.getData()) {
				for (key = 0; key < ddj.getData().length; ++key) {
					val = ddj.getData(key);

					if ((typeof val.lat !== 'undefined') && (typeof val.lng !== 'undefined')) {
						latlng = new L.LatLng(val.lat, val.lng);
						obj = {
							index: key,
							x: ddj.getMap().latLngToLayerPoint(latlng).x,
							y: ddj.getMap().latLngToLayerPoint(latlng).y,
							color: '#1f78b440'
						};
						addObj = ddj.voronoi.settings.onAdd(obj, val);

						if (addObj !== false) {
							positions.push(obj);
						}
					}
				}
			}

			d3.selectAll('.AEDpoint').remove();

			if (ddj.voronoi.store.g) {
				ddj.voronoi.store.g.selectAll('circle')
					.data(positions)
					.enter()
					.append('circle')
					.attr('class', 'AEDpoint')
					.attr({
						'cx': ddj.voronoi.settings.markerX,
						'cy': ddj.voronoi.settings.markerY,
						'r': ddj.voronoi.settings.markerRadius,
						fill: ddj.voronoi.settings.markerFill
					});
			}

			if (ddj.voronoi.store.geomVoronoi) {
				layerPolygons = ddj.voronoi.store.geomVoronoi(positions);
				layerPolygons.forEach(function (v) {
					v.cell = v;
				});
			}

			if (ddj.voronoi.store.svg) {
				ddj.voronoi.store.svg.selectAll('.voronoi').remove();
				ddj.voronoi.store.svg.selectAll('path')
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
						stroke: ddj.voronoi.settings.pathStroke,
						fill: ddj.voronoi.settings.pathFill
					})
					.on('mouseover', function (d, i) {
						if (ddj.voronoi.settings.onMouseOver) {
							ddj.voronoi.settings.onMouseOver(ddj.getData(positions[i].index));
						}
					})
					.on('mouseout', function (d, i) {
						if (ddj.voronoi.settings.onMouseOut) {
							ddj.voronoi.settings.onMouseOut(ddj.getData(positions[i].index));
						}
					})
					.on('click', function (d, i) {
						if (ddj.voronoi.settings.onClick) {
							ddj.voronoi.settings.onClick(ddj.getData(positions[i].index));
						}
					});
			}
		}

		// ---------------------------------------------------------------------
/*
		function clipVoronoi() {
			// http://publicatodo.co/Detalles/6043/Create-d3-hull-to-clip-voronoi-diagram-on-leaflet-map

			var pointsFilteredToSelectedTypes = function () {
				return ddj.getData().filter(function (item) {
					return true;
				});
			};

			var bounds = ddj.getMap().getBounds(),
				existing = d3.set(),
				drawLimit = bounds.pad(0.4);

			// Hull Function to create polygon from points //
			var hullPoints = pointsFilteredToSelectedTypes().filter(function (d) {
				var latlng = new L.LatLng(d.lat, d.lng);

				if (!drawLimit.contains(latlng)) {
					return false
				};

				var point = ddj.getMap().latLngToLayerPoint(latlng);

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

			var svgHull = d3.select(ddj.getMap().getPanes().overlayPane).append("svg")
				.attr("id", "overlay")
				.attr("class", "leaflet-zoom-hide")
				.style("width", ddj.getMap().getSize().x + "px")
				.style("height", ddj.getMap().getSize().y + "px");

			svgHull.append("rect")
				.attr("width", ddj.getMap().getSize().x + "px")
				.attr("height", ddj.getMap().getSize().y + "px");

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

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
