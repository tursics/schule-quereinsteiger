/* schulsanierung.tursics.de - JavaScript file */

/*jslint browser: true*/
/*global $,L,window,document,d3*/

var map = null;
var layerPopup = null;
var layerGroup = null;

// -----------------------------------------------------------------------------

String.prototype.startsWith = String.prototype.startsWith || function (prefix) {
	'use strict';

	return this.indexOf(prefix) === 0;
};

// -----------------------------------------------------------------------------

function mapAction() {
	'use strict';
}

// -----------------------------------------------------------------------------

function fixData(val) {
	'use strict';

	return val;
}

// -----------------------------------------------------------------------------

function formatNumber(txt) {
	'use strict';

	txt = String(parseInt(txt, 10));
	var sign = '',
		pos = 0;
	if (txt[0] === '-') {
		sign = '-';
		txt = txt.slice(1);
	}

	pos = txt.length;
	while (pos > 3) {
		pos -= 3;
		txt = txt.slice(0, pos) + '.' + txt.slice(pos);
	}

	return sign + txt;
}

// -----------------------------------------------------------------------------

function enrichMissingData(data) {
	'use strict';

	try {
		$.each(data, function (key, val) {
			var all, q, s;

			if (!val.AlleLehrkraefte_2017 || (val.AlleLehrkraefte_2017 === '')) {
				val.AlleLehrkraefte_2017 = 'keine Angabe';
			}

			if (!val.AlleLehrkraefte_2018 || (val.AlleLehrkraefte_2018 === '')) {
				val.AlleLehrkraefte_2018 = 'keine Angabe';
			}

			if (!val.AlleQ_2017 || (val.AlleQ_2017 === '')) {
				val.AlleQ_2017 = '0 %';
			}

			if (!val.AlleQS_2018 || (val.AlleQS_2018 === '')) {
				val.AlleQS_2018 = '0 %';
			}

			if (val.Q1_5_2018 && (val.Q1_5_2018 !== '')) {
				val.AlleQ_2018 = val.Q1_5_2018;
			} else if (val.Q6_x_2018 && (val.Q6_x_2018 !== '')) {
				val.AlleQ_2018 = val.Q6_x_2018;
			} else {
				val.AlleQ_2018 = '0 %';
			}

			if (val.S1_5_2018 && (val.S1_5_2018 !== '')) {
				val.AlleS_2018 = val.S1_5_2018;
			} else if (val.S6_x_2018 && (val.S6_x_2018 !== '')) {
				val.AlleS_2018 = val.S6_x_2018;
			} else {
				val.AlleS_2018 = '0 %';
			}

			all = parseInt(val.AlleLehrkraefte_2017, 10);
			q = parseInt(val.AlleQ_2017, 10);
			s = 0;
			if (isNaN(all)) {
				all = 0;
			}
			val.count_2017 = Math.round(all * q / 100) + Math.round(all * s / 100);

			all = parseInt(val.AlleLehrkraefte_2018, 10);
			q = parseInt(val.AlleQ_2018, 10);
			s = parseInt(val.AlleS_2018, 10);
			if (isNaN(all)) {
				all = 0;
			}
			val.count_2018 = Math.round(all * q / 100) + Math.round(all * s / 100);
		});
	} catch (e) {
//		console.log(e);
	}

	return data;
}

// -----------------------------------------------------------------------------

function getColor(data) {
	'use strict';

	var val = 0,
		cbRelative = $('#searchBox #cbRelative').is(':checked');

	if (cbRelative) {
		val = parseInt(data.AlleQS_2018, 10);

		return val >= 25 ? 'red' :
				val > 0 ? 'orange' :
						'green';
	}

	val = data.count_2018;

	return val >= 10 ? 'red' :
			val > 0 ? 'orange' :
					'green';
}
// -----------------------------------------------------------------------------

function updateMapSelectItem(data) {
	'use strict';

	function setText(key, txt) {
		var item = $('#rec' + key);

		if (item.parent().hasClass('number')) {
			txt = formatNumber(txt);
		} else if (item.parent().hasClass('boolean')) {
			txt = (txt === 1 ? 'ja' : 'nein');
		}

		item.text(txt);
	}

	mapAction();

	var key;

	for (key in data) {
		setText(key, data[key]);
	}

	setText('count2017', data.count_2017 || 0);
	setText('count2018', data.count_2018 || 0);

	$('#receiptBox').css('display', 'block');
}

// -----------------------------------------------------------------------------

function updateMapHoverItem(coordinates, data, icon, offsetY) {
	'use strict';

	var options = {
		closeButton: false,
		offset: L.point(0, offsetY),
		className: 'printerLabel'
	},
		str = '',
		value = '',
		cbRelative = $('#searchBox #cbRelative').is(':checked');

	if (cbRelative) {
		value = (data.AlleQS_2018 || '0 %');
	} else {
		value = (data.count_2018 || '0');
	}

	str += '<div class="top ' + icon.options.markerColor + '">' + data.Schulname + '</div>';
	str += '<div class="middle">' + value + '</div>';
	str += '<div class="bottom">Quereinsteiger 2018</div>';

	layerPopup = L.popup(options)
		.setLatLng(coordinates)
		.setContent(str)
		.openOn(map);
}

// -----------------------------------------------------------------------------

function updateMapVoidItem() {
	'use strict';

	if (layerPopup && map) {
		map.closePopup(layerPopup);
		layerPopup = null;
    }
}

// -----------------------------------------------------------------------------

function createMarkerGroup() {
	'use strict';

	try {
		layerGroup = L.featureGroup([]);
		layerGroup.addTo(map);

		layerGroup.addEventListener('click', function (evt) {
			updateMapSelectItem(evt.layer.options.data);
		});
		layerGroup.addEventListener('mouseover', function (evt) {
			updateMapHoverItem([evt.latlng.lat, evt.latlng.lng], evt.layer.options.data, evt.layer.options.icon, -32);
		});
		layerGroup.addEventListener('mouseout', function (evt) {
			updateMapVoidItem(evt.layer.options.data);
		});
	} catch (e) {
//		console.log(e);
	}
}

// -----------------------------------------------------------------------------
/*
function createMarker(data) {
	'use strict';

	try {
		var markerBlue = L.AwesomeMarkers.icon({
			icon: 'fa-building-o',
			prefix: 'fa',
			markerColor: 'blue'
		}),
			markerOrange = L.AwesomeMarkers.icon({
				icon: 'fa-building-o',
				prefix: 'fa',
				markerColor: 'orange'
			}),
			markerGreen = L.AwesomeMarkers.icon({
				icon: 'fa-building-o',
				prefix: 'fa',
				markerColor: 'green'
			}),
			markerRed = L.AwesomeMarkers.icon({
				icon: 'fa-building-o',
				prefix: 'fa',
				markerColor: 'red'
			});

		$.each(data, function (key, val) {
			if ((typeof val.lat !== 'undefined') && (typeof val.lng !== 'undefined')) {
				var color = getColor(val),
					marker = L.marker([parseFloat(val.lat), parseFloat(val.lng)], {
						data: fixData(val),
						icon: color === 'red' ? markerRed :
								color === 'orange' ? markerOrange :
										color === 'green' ? markerGreen :
												markerBlue,
						opacity: 1,
						clickable: 1
					});
				layerGroup.addLayer(marker);
			}
		});
	} catch (e) {
//		console.log(e);
	}
}
*/
// -----------------------------------------------------------------------------

function selectSuggestion(selection) {
	'use strict';

	$.each(layerGroup._layers, function (key, val) {
		if (val.options.data.Schulnummer === selection) {
			map.panTo(new L.LatLng(val.options.data.lat, val.options.data.lng));
			updateMapSelectItem(val.options.data);
		}
	});
}

//-----------------------------------------------------------------------------

function initSearchBox(data) {
	'use strict';

	var schools = [];

	try {
		$.each(data, function (key, val) {
			if ((typeof val.lat !== 'undefined') && (typeof val.lng !== 'undefined')) {
				var name = val.Schulname, color = 'gray';
				if ('' !== val.Schulnummer) {
					name += ' (' + val.Schulnummer + ')';
				}
				color = ((val.Schulart === 'Bezirk') || (val.Schulart === 'Stadt') ? 'gray' :
								val.Kosten >= 10000000 ? 'red' :
										val.Kosten >= 5000000 ? 'orange' :
												val.Kosten >= 1000 ? 'blue' :
														'green');
				schools.push({ value: name, data: val.Schulnummer, color: color, desc: val.Schulart });
			}
		});
	} catch (e) {
//		console.log(e);
	}

	schools.sort(function (a, b) {
		if (a.value === b.value) {
			return a.data > b.data ? 1 : -1;
		}

		return a.value > b.value ? 1 : -1;
	});

	$('#autocomplete').focus(function () {
		mapAction();

		window.scrollTo(0, 0);
		document.body.scrollTop = 0;
		$('#pageMap').animate({
			scrollTop: parseInt(0, 10)
		}, 500);
	});
	$('#autocomplete').autocomplete({
		lookup: schools,
		onSelect: function (suggestion) {
			selectSuggestion(suggestion.data);
		},
		formatResult: function (suggestion, currentValue) {
			var color = suggestion.color,
				icon = 'fa-building-o',
				str = '';

			str += '<div class="autocomplete-icon back' + color + '"><i class="fa ' + icon + '" aria-hidden="true"></i></div>';
			str += '<div>' + suggestion.value.replace(new RegExp(currentValue.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'gi'), '<strong>' + currentValue + '</strong>') + '</div>';
			str += '<div class="' + color + '">' + suggestion.desc + '</div>';
			return str;
		},
		showNoSuggestionNotice: true,
		noSuggestionNotice: '<i class="fa fa-info-circle" aria-hidden="true"></i> Geben sie den Namen einer Schule ein'
	});
}

// -----------------------------------------------------------------------------
/*
function initSocialMedia() {
	'use strict';

	setTimeout(function () {
		$.ajax('http://www.tursics.de/v5shariff.php?url=http://schulsanierung.tursics.de/')
			.done(function (json) {
				$('.social .facebook span').html(json.facebook);
				if (json.facebook > 0) {
					$('.social .facebook span').addClass('active');
				}

				$('.social .twitter span').html(json.twitter);
				if (json.twitter > 0) {
					$('.social .twitter span').addClass('active');
				}
			});
	}, 1000);
}
*/
// -----------------------------------------------------------------------------

function updateVoronoi(svg, g, data, voronoi) {
	'use strict';

	var positions = [],
//		marker,
		polygons,
		selectDistrict = $('#searchBox #selectDistrict option:selected').val(),
		selectSchoolType = $('#searchBox #selectSchoolType option:selected').val();

	$.each(data, function (key, val) {
		if ((typeof val.lat !== 'undefined') && (typeof val.lng !== 'undefined')) {
			var latlng = new L.LatLng(val.lat, val.lng),
				color = getColor(val),
				district = val.BSN.substr(0, 2),
				schoolType = val.BSN.substr(2, 1),
				hexColor = color === 'red' ? '#d63e2a' :
								color === 'orange' ? '#f69730' :
										color === 'green' ? '#72b026' :
												'#a3a3a3',
				hexColorBrighter = '#ffffff';

			if (('all' === selectSchoolType) || (schoolType === selectSchoolType)) {
				positions.push({
					index: key,
					x: map.latLngToLayerPoint(latlng).x,
					y: map.latLngToLayerPoint(latlng).y,
					tooltipColor: color,
					markerColor: hexColor,
					color: (selectDistrict === district) || (selectDistrict === 'berlin') ? hexColor + '80' : hexColorBrighter + '80'
				});
			}
		}
	});

	d3.selectAll('.AEDpoint').remove();

/*	marker = g.selectAll('circle')
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
			'r': '5',
			fill: function (d) {
				return d.markerColor;
			}
		});*/

	polygons = voronoi(positions);
	polygons.forEach(function (v) {
		v.cell = v;
	});

	svg.selectAll('.volonoi').remove();
	svg.selectAll('path')
		.data(polygons)
		.enter()
		.append('svg:path')
		.attr('class', 'volonoi')
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
		.on("mouseover", function (d, i) {
			updateMapHoverItem([data[positions[i].index].lat, data[positions[i].index].lng], data[positions[i].index], {
				options: {
					markerColor: d.point.tooltipColor
				}
			}, 6);
		})
		.on("mouseout", function (d, i) {
			updateMapVoidItem(data[positions[i].index]);
		})
		.on('click', function (d, i) {
			updateMapSelectItem(data[positions[i].index]);
		});
}

// -----------------------------------------------------------------------------
/*
function clipVoronoi(data) {
	'use strict';

	// http://publicatodo.co/Detalles/6043/Create-d3-hull-to-clip-voronoi-diagram-on-leaflet-map

	var pointsFilteredToSelectedTypes = function () {
		return data.filter(function (item) {
			return true;
		});
	};

	var bounds = map.getBounds(),
		drawLimit = bounds.pad(0.4);

	// Hull Function to create polygon from points //
	var hullPoints = pointsFilteredToSelectedTypes().filter(function (d) {
		var latlng = new L.LatLng(d.lat, d.lng);

		if (!drawLimit.contains(latlng)) {
			return false
		};

		var point = map.latLngToLayerPoint(latlng);

key = point.toString();
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

	var svgHull = d3.select(map.getPanes().overlayPane).append("svg")
		.attr("id", "overlay")
		.attr("class", "leaflet-zoom-hide")
		.style("width", map.getSize().x + "px")
		.style("height", map.getSize().y + "px");

	svgHull.append("rect")
		.attr("width", map.getSize().x + "px")
		.attr("height", map.getSize().y + "px");

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
// -----------------------------------------------------------------------------

function initVoronoi(elementName, data) {
	'use strict';

	map._initPathRoot();

	var svg = d3.select('#' + elementName).select('svg');
	var g = svg.append('g').attr('class', 'leaflet-zoom-hide');

	var voronoi = d3.geom.voronoi()
		.x(function (d) {
			return d.x;
		})
		.y(function (d) {
			return d.y;
		});
//		.clipExtent([[0, 0], [width, height]]);

	map.on('viewreset moveend', function () {
		updateVoronoi(svg, g, data, voronoi);
	});
	updateVoronoi(svg, g, data, voronoi);
//	clipVoronoi(data);

	$('#searchBox #cbRelative').on('click', function () {
		updateVoronoi(svg, g, data, voronoi);
	});
	$('#searchBox #selectDistrict').change(function () {
		updateVoronoi(svg, g, data, voronoi);
	});
	$('#searchBox #selectSchoolType').change(function () {
		updateVoronoi(svg, g, data, voronoi);
	});
}

// -----------------------------------------------------------------------------

var ControlInfo = L.Control.extend({
	options: {
		position: 'bottomright'
	},

	onAdd: function (map) {
		'use strict';

		var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

		container.innerHTML = '<a style="font-size:1.2em" href="#popupShare" title="Teilen" data-rel="popup" data-position-to="window" data-transition="pop"><i class="fa fa-share-alt" aria-hidden="true"></i></a>';
//		container.innerHTML += '<a style="font-size:1.2em" href="#popupInfo" title="Info" data-rel="popup" data-position-to="window" data-transition="pop"><i class="fa fa-info" aria-hidden="true"></i></a>';

		return container;
	}
});

// -----------------------------------------------------------------------------

function initMap(elementName, lat, lng, zoom) {
	'use strict';

	if (null === map) {
		var mapboxToken = 'pk.eyJ1IjoidHVyc2ljcyIsImEiOiI1UWlEY3RNIn0.U9sg8F_23xWXLn4QdfZeqg',
			mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/tursics.l7ad5ee8/{z}/{x}/{y}.png?access_token=' + mapboxToken, {
				attribution: '<a href="http://www.openstreetmap.org" target="_blank">OpenStreetMap-Mitwirkende</a>, <a href="https://www.mapbox.com" target="_blank">Mapbox</a>'
			}),
			dataUrl = 'data/quereinsteiger.json';

		map = L.map(elementName, {zoomControl: false, scrollWheelZoom: true})
			.addLayer(mapboxTiles)
			.setView([lat, lng], zoom);

		map.addControl(L.control.zoom({ position: 'bottomright'}));
		map.addControl(new ControlInfo());
		map.once('focus', mapAction);

		$.getJSON(dataUrl, function (data) {
			data = enrichMissingData(data);
			createMarkerGroup();
//			createMarker(data);
			initSearchBox(data);
//			initSocialMedia();
			initVoronoi(elementName, data);
		});
	}
}

// -----------------------------------------------------------------------------

$(document).on("pageshow", "#pageMap", function () {
	'use strict';

	function updateEmbedURI() {
		var size = $('#selectEmbedSize').val().split('x'),
			x = size[0],
			y = size[1],
			html = '<iframe src="https://tursics.github.io/schulsanierung/karte-quereinsteiger.html" width="' + x + '" height="' + y + '" frameborder="0" style="border:0" allowfullscreen></iframe>';

		$('#inputEmbedURI').val(html);
		if (-1 === $('#embedMap iframe')[0].outerHTML.indexOf('width="' + x + '"')) {
			$('#embedMap iframe')[0].outerHTML = html.replace('.html"', '.html?foo=' + (new Date().getTime()) + '"');
			$('#embedMap input').focus().select();
		}
	}

	// center the city hall
	initMap('mapContainer', 52.518413, 13.408368, 13);

	$('#autocomplete').val('');
	$('#receipt .group').on('click', function () {
		$(this).toggleClass('groupClosed');
	});
	$('#receiptClose').on('click', function () {
		$('#receiptBox').css('display', 'none');
	});
	$('#searchBox .sample a:nth-child(1)').on('click', function () {
		$('#autocomplete').val('Clay-Schule (08K05)');
		selectSuggestion('08K05');
	});
	$('#searchBox .sample a:nth-child(2)').on('click', function () {
		$('#autocomplete').val('Pankow');
		selectSuggestion('03');
	});
	$('#filterOpen').on('click', function () {
		$('#filterBox').css('display', 'block');
		$('#filterOpen').css('display', 'none');
	});
	$('#filterClose').on('click', function () {
		$('#filterBox').css('display', 'none');
		$('#filterOpen').css('display', 'inline-block');
	});

	$("#popupShare").on('popupafteropen', function () {
		$('#shareLink input').focus().select();
	});
	$('#tabShareLink').on('click', function () {
		$('#popupShare').popup('reposition', 'positionTo: window');
		$('#shareLink input').focus().select();
	});
	$('#tabEmbedMap').on('click', function () {
		updateEmbedURI();
		$('#popupShare').popup('reposition', 'positionTo: window');
		$('#embedMap input').focus().select();
	});

	$('#selectEmbedSize').val('400x300').selectmenu('refresh');
	$('#selectEmbedSize').on('change', function () {
		updateEmbedURI();
		$('#popupShare').popup('reposition', 'positionTo: window');
	});
});

// -----------------------------------------------------------------------------
