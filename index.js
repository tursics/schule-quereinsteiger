/* tursics.de/story/ - JavaScript file */

/*jslint browser: true*/
/*global $,L,window,document,ddj*/

var map = null;
var layerPopup = null;
var layerPolygons = null;

var settings = {
	relativeValues: true,
	showHotspots: true,
	district: 'berlin',
	type: 'all',
	year: 2018,
	rangeMin: 1,
	rangeMax: 24
};

// -----------------------------------------------------------------------------

function mapAction() {
	'use strict';
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

	var val = 0;

	if (settings.relativeValues) {
		val = parseInt(settings.year === 2017 ? data.AlleQ_2017 : data.AlleQS_2018, 10);
	} else {
		val = settings.year === 2017 ? data.count_2017 : data.count_2018;
	}

	return val > settings.rangeMax ? 'red' :
			val >= settings.rangeMin ? 'orange' :
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
		if (data.hasOwnProperty(key)) {
			setText(key, data[key]);
		}
	}

	setText('count2017', data.count_2017 || 0);
	setText('count2018', data.count_2018 || 0);
	setText('hotspot', 'x' === data['Brennpunktschule-2018'] ? 'ja' : 'nein');

	$('#receiptBox').css('display', 'block');
}

// -----------------------------------------------------------------------------

function updateMapHoverItem(coordinates, data, icon, offsetY) {
	'use strict';

	var options = {
		closeButton: false,
		offset: L.point(0, offsetY),
		className: 'printerLabel teacher' + Math.floor(Math.random() * 10)
	},
		str = '',
		value = '';

	if (settings.relativeValues) {
		value = (settings.year === 2017 ? data.AlleQ_2017 : data.AlleQS_2018) || '0 %';
	} else {
		value = (settings.year === 2017 ? data.count_2017 : data.count_2018) || '0';
	}
	icon.options.markerColor = '';

	str += '<div class="top ' + icon.options.markerColor + '">' + data.Schulname + '</div>';
	str += '<div class="middle">' + value + '</div>';
	str += '<div class="bottom">Quereinsteigende ' + settings.year + '</div>';

	layerPopup = L.popup(options)
		.setLatLng(coordinates)
		.setContent(str)
		.openOn(ddj.map.data.map);
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

function selectSuggestion(selection) {
	'use strict';

	if (layerGroup && layerGroup._layers && (layerGroup._layers.length > 0)) {
		$.each(layerGroup._layers, function (key, val) {
			if (val.options.data.BSN === selection) {
				map.panTo(new L.LatLng(val.options.data.lat, val.options.data.lng));
				updateMapSelectItem(val.options.data);
			}
		});
	} else {
		$.each(layerPolygons, function (key, val) {
			if (val && (val.point.data.BSN === selection)) {
				map.panTo(new L.LatLng(val.point.data.lat, val.point.data.lng));
				updateMapSelectItem(val.point.data);
			}
		});
	}
}

//-----------------------------------------------------------------------------

function initSearchBox(data) {
	'use strict';

	var schools = [];

	try {
		$.each(data, function (key, val) {
			if ((typeof val.lat !== 'undefined') && (typeof val.lng !== 'undefined')) {
				var name = val.Schulname,
					color = getColor(val);

				if ('' !== val.BSN) {
					name += ' (' + val.BSN + ')';
				}
				schools.push({ value: name, data: val.BSN, color: color, desc: val.Schulart });
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

var ControlInfo = L.Control.extend({
	options: {
		position: 'bottomright'
	},

	onAdd: function () {
		'use strict';

		var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

		container.innerHTML = '<a style="font-size:1.2em" href="#popupShare" title="Teilen" data-rel="popup" data-position-to="window" data-transition="pop"><i class="fa fa-share-alt" aria-hidden="true"></i></a>';
		container.innerHTML += '<a style="font-size:1.2em" href="#popupInfo" title="Info" data-rel="popup" data-position-to="window" data-transition="pop"><i class="fa fa-info" aria-hidden="true"></i></a>';
		container.innerHTML += '<a style="font-size:1.2em" href="#popupAuthor" title="Autor" data-rel="popup" data-position-to="window" data-transition="pop"><i class="fa fa-envelope" aria-hidden="true"></i></a>';

		return container;
	}
});

// -----------------------------------------------------------------------------

$(document).on("pageshow", "#pageMap", function () {
	'use strict';

	function updateEmbedURI() {
		var size = $('#selectEmbedSize').val().split('x'),
			x = size[0],
			y = size[1],
			html = '<iframe src="https://tursics.github.io/schule-quereinsteiger/" width="' + x + '" height="' + y + '" frameborder="0" style="border:0" allowfullscreen></iframe>';

		$('#inputEmbedURI').val(html);
		if (-1 === $('#embedMap iframe')[0].outerHTML.indexOf('width="' + x + '"')) {
			$('#embedMap iframe')[0].outerHTML = html.replace('.html"', '.html?foo=' + (new Date().getTime()) + '"');
			$('#embedMap input').focus().select();
		}
	}

	// center the city hall
	ddj.map.init('mapContainer', {
		mapboxId: 'tursics.l7ad5ee8',
		mapboxToken: 'pk.eyJ1IjoidHVyc2ljcyIsImEiOiI1UWlEY3RNIn0.U9sg8F_23xWXLn4QdfZeqg',
		centerLat: 52.518413,
		centerLng: 13.408368,
		zoom: 13,
		onFocusOnce: mapAction
	});

	var dataUrl = 'data/quereinsteiger.json';
	$.getJSON(dataUrl, function (data) {
		data = enrichMissingData(data);

		ddj.marker.init(data, {
			onAdd: function (marker, value) {
				marker.color = getColor(value);
				marker.iconPrefix = 'fa';
				marker.iconFace = 'fa-building-o';

				return true;
			}
		});

		initSearchBox(data);
//		initSocialMedia();

		ddj.voronoi.init(data, {
			onAdd: function (marker, value) {
				var color = getColor(value),
					hexColor = color === 'red' ? '#e31a1c' :
									color === 'orange' ? '#fdbf6f' :
											color === 'green' ? '#33a02c' :
													'#a3a3a3',
					hexColorBrighter = '#ffffff',
					district = value.BSN.substr(0, 2),
					schoolType = value.BSN.substr(2, 1);

				marker.color = (settings.district === district) || (settings.district === 'berlin') ? hexColor + '80' : hexColorBrighter + '80';
				marker.markerColor = color === 'orange' ? '#ff7f00' : hexColor;
				marker.hotSpot = 'x' === value['Brennpunktschule-2018'];

				return ('all' === settings.type) || (schoolType === settings.type);
			},
			markerRadius: 5,
			markerFill: function (data) {
				return settings.showHotspots ? (data.hotSpot ? data.markerColor : 'none') : 'none';
			},
			pathStroke: '#777',
			onMouseOver: function (data) {
				updateMapHoverItem([data.lat, data.lng], data, {
					options: {
						markerColor: getColor(data)
					}
				}, 6);
			},
			onMouseOut: function (data) {
				updateMapVoidItem(data);
			},
			onClick: function (data) {
				updateMapSelectItem(data);
			}
		});
	});

	ddj.map.data.map.addControl(new ControlInfo());

	$('#autocomplete').val('');
	$('#receipt .group').on('click', function () {
		$(this).toggleClass('groupClosed');
	});
	$('#receiptClose').on('click', function () {
		$('#receiptBox').css('display', 'none');
	});
	$('#searchBox .sample a:nth-child(1)').on('click', function () {
		$('#autocomplete').val('32. Schule (Grundschule) (11G32)');
		selectSuggestion('11G32');
	});
	$('#searchBox .sample a:nth-child(2)').on('click', function () {
		$('#autocomplete').val('Staatliche Ballettschule Berlin und Schule für Artistik (03B08)');
		selectSuggestion('03B08');
	});
	$('#filterOpen').on('click', function () {
		$('#filterBox').css('display', 'block');
		$('#filterOpen').css('display', 'none');
	});
	$('#filterClose').on('click', function () {
		$('#filterBox').css('display', 'none');
		$('#filterOpen').css('display', 'inline-block');
	});

	$('#searchBox #cbRelative').on('click', function () {
		settings.relativeValues = $('#searchBox #cbRelative').is(':checked');
		ddj.voronoi.update();
	});
	$('#searchBox #cbHotspot').on('click', function () {
		settings.showHotspots = $('#searchBox #cbHotspot').is(':checked');
		ddj.voronoi.update();
	});
	$('#searchBox #selectDistrict').change(function () {
		settings.district = $('#searchBox #selectDistrict option:selected').val();
		ddj.voronoi.update();
	});
	$('#searchBox #selectSchoolType').change(function () {
		settings.type = $('#searchBox #selectSchoolType option:selected').val();
		ddj.voronoi.update();
	});
	$('#searchBox #selectYear').change(function () {
		settings.year = parseInt($('#searchBox #selectYear option:selected').val(), 10);
		ddj.voronoi.update();
	});
	$('#searchBox #rangeMin').change(function () {
		settings.rangeMin = parseInt($('#searchBox #rangeMin').val(), 10);
		ddj.voronoi.update();
	});
	$('#searchBox #rangeMax').change(function () {
		settings.rangeMax = parseInt($('#searchBox #rangeMax').val(), 10);
		ddj.voronoi.update();
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
