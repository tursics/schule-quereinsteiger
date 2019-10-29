/* tursics.de/story/ - JavaScript file */

/*jslint browser: true*/
/*global $,L,window,document,ddj*/

var layerPopup = null;

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

function merge(dataSource, dataAdditional, options) {
	'use strict';

	var s,
		source,
		a,
		additional,
		p,
		push;

	options = options || {};

	if (typeof options.sourceMatch === undefined) {
		return dataSource;
	}
	if (typeof options.mergeMatch === undefined) {
		return dataSource;
	}

	try {
		for (s = 0; s < dataSource.length; ++s) {
			source = dataSource[s];

			for (a = 0; a < dataAdditional.length; ++a) {
				additional = dataAdditional[a];

				if ((source[options.sourceMatch]) && (additional[options.mergeMatch]) && (source[options.sourceMatch] === additional[options.mergeMatch])) {
					for (p = 0; p < options.add.length; ++p) {
						push = options.add[p];

						if (additional[push]) {
							source[push] = additional[push];
						}
					}
				}
			}
		}
	} catch (e) {
//		console.log(e);
	}

	return dataSource;
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

			if (!val.KlassenMehrAls26_32_Schueler || (val.KlassenMehrAls26_32_Schueler !== 'X')) {
				val.KlassenMehrAls26_32_Schueler = '';
			}
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
	if (data.KlassenMehrAls26_32_Schueler === 'X') {
		str += '<div class="bottom">+ Überbelegt</div>';
	}

	layerPopup = L.popup(options)
		.setLatLng(coordinates)
		.setContent(str)
		.openOn(ddj.getMap());
}

// -----------------------------------------------------------------------------

function updateMapVoidItem() {
	'use strict';

	if (layerPopup && ddj.getMap()) {
		ddj.getMap().closePopup(layerPopup);
		layerPopup = null;
    }
}

// -----------------------------------------------------------------------------

function selectSuggestion(selection) {
	'use strict';

	$.each(ddj.getData(), function (key, val) {
		if (val && (val.BSN === selection)) {
			ddj.getMap().panTo(new L.LatLng(val.lat, val.lng));
			updateMapSelectItem(val);
		}
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

	var basePath = '', // 'https://raw.githubusercontent.com/tursics/schule-quereinsteiger/version-2/',
		dataUrlQuereinsteiger = basePath + 'data/quereinsteiger.json',
		dataUrlUeberbelegt = basePath + 'data/ueberbelegt.json';

	$.getJSON(dataUrlQuereinsteiger, function (dataQuereinsteiger) {
		$.getJSON(dataUrlUeberbelegt, function (dataUeberbelegt) {
			var data = merge(dataQuereinsteiger, dataUeberbelegt, {
				sourceMatch: 'BSN',
				mergeMatch: 'BSN',
				add: ['KlassenMehrAls26_32_Schueler']
			});
			data = enrichMissingData(data);

			ddj.init(data);

/*			ddj.marker.init({
				onAdd: function (marker, value) {
					marker.color = getColor(value);
					marker.iconPrefix = 'fa';
					marker.iconFace = 'fa-building-o';
					marker.hotSpot = 'x' === value['Brennpunktschule-2018'];

					return settings.showHotspots ? (marker.hotSpot ? true : false) : false;
				},
				onMouseOver: function (latlng, data) {
					updateMapHoverItem(latlng, data, {
						options: {
							markerColor: getColor(data)
						}
					}, 6);
				},
				onMouseOut: function (latlng, data) {
					updateMapVoidItem(data);
				},
				onClick: function (latlng, data) {
					updateMapSelectItem(data);
				}
			});*/

			ddj.search.init({
				showNoSuggestion: true,
				titleNoSuggestion: '<i class="fa fa-info-circle" aria-hidden="true"></i> Geben sie bitte den Namen einer Schule ein',
				onAdd: function (obj, value) {
					var name = value.Schulname,
						color = getColor(value),
						schoolType = value.BSN.substr(2, 1);

					if ('' !== value.BSN) {
						name += ' (' + value.BSN + ')';
					}

					obj.sortValue1 = name;
					obj.sortValue2 = value.BSN;
					obj.data = value.BSN;
					obj.color = color;
					obj.value = name;
					obj.desc = value.Schulart;

					return ('all' === settings.type) || (schoolType === settings.type);
				},
				onFocus: function () {
					mapAction();

					window.scrollTo(0, 0);
					document.body.scrollTop = 0;
					$('#pageMap').animate({
						scrollTop: parseInt(0, 10)
					}, 500);
				},
				onFormat: function (suggestion, currentValue) {
					var color = suggestion.color,
						icon = 'fa-building-o',
						str = '';

					str += '<div class="autocomplete-icon back' + color + '"><i class="fa ' + icon + '" aria-hidden="true"></i></div>';
					str += '<div>' + suggestion.value.replace(new RegExp(currentValue.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'gi'), '<strong>' + currentValue + '</strong>') + '</div>';
					str += '<div class="' + color + '">' + suggestion.desc + '</div>';
					return str;
				},
				onClick: function (data) {
					selectSuggestion(data.BSN);
				}
			});

//			initSocialMedia();

			ddj.voronoi.init({
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
					marker.important = 'X' === value.KlassenMehrAls26_32_Schueler;

					return ('all' === settings.type) || (schoolType === settings.type);
				},
				markerRadius: 5,
				markerStroke: function (data) {
					return data.important ? '#000' : 'none';
				},
				markerStrokeWidth: 2,
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
	});

	ddj.getMap().addControl(new ControlInfo());

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
		ddj.marker.update();
	});
	$('#searchBox #cbHotspot').on('click', function () {
		settings.showHotspots = $('#searchBox #cbHotspot').is(':checked');
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #selectDistrict').change(function () {
		settings.district = $('#searchBox #selectDistrict option:selected').val();
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #selectSchoolType').change(function () {
		settings.type = $('#searchBox #selectSchoolType option:selected').val();
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #selectYear').change(function () {
		settings.year = parseInt($('#searchBox #selectYear option:selected').val(), 10);
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #rangeMin').change(function () {
		settings.rangeMin = parseInt($('#searchBox #rangeMin').val(), 10);
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #rangeMax').change(function () {
		settings.rangeMax = parseInt($('#searchBox #rangeMax').val(), 10);
		ddj.voronoi.update();
		ddj.marker.update();
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
