/* tursics.ddj.marker.js */
/* version 0.1 */

/*jslint browser: true*/
/*global L,console*/

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

(function () {

	'use strict';

	// -------------------------------------------------------------------------

	ddj.marker = {

		// ---------------------------------------------------------------------

		settings: {
			onAdd: function (marker, value) {
				return true;
			},
			onMouseOver: null,
			onMouseOut: null,
			onClick: null
		},

		// ---------------------------------------------------------------------

		data: {
			userData: null,
			map: null,
			layerGroup: null
		},

		// ---------------------------------------------------------------------

		init: function (data, settings) {
			if (null !== ddj.marker.data.map) {
				return;
			}
			if ((typeof L === 'undefined') || (L === null)) {
				console.error('Error: Please include leaflet.js in your html file.');
				return;
			}

			var key;

			if ((settings !== null) && (typeof (settings) === 'object')) {
				for (key in settings) {
					if (settings.hasOwnProperty(key) && ddj.marker.settings.hasOwnProperty(key)) {
						ddj.marker.settings[key] = settings[key];
					}
				}
			}

			ddj.marker.data.map = ddj.map.data.map;
			ddj.marker.data.userData = data;

			ddj.marker.update();
		},

		// ---------------------------------------------------------------------

		update: function () {
			var key, val, obj, addObj;

			if (ddj.marker.data.layerGroup) {
				ddj.marker.data.map.removeLayer(ddj.marker.data.layerGroup);
				ddj.marker.data.layerGroup = null;
			}

			ddj.marker.data.layerGroup = L.featureGroup([]);
			ddj.marker.data.layerGroup.addTo(ddj.marker.data.map);
			ddj.marker.data.layerGroup.addEventListener('mouseover', function (evt) {
				if (ddj.marker.settings.onMouseOver) {
					ddj.marker.settings.onMouseOver([evt.latlng.lat, evt.latlng.lng], ddj.marker.data.userData[evt.layer.options.data]);
				}
			});
			ddj.marker.data.layerGroup.addEventListener('mouseout', function (evt) {
				if (ddj.marker.settings.onMouseOut) {
					ddj.marker.settings.onMouseOut([evt.latlng.lat, evt.latlng.lng], ddj.marker.data.userData[evt.layer.options.data]);
				}
			});
			ddj.marker.data.layerGroup.addEventListener('click', function (evt) {
				if (ddj.marker.settings.onClick) {
					ddj.marker.settings.onClick([evt.latlng.lat, evt.latlng.lng], ddj.marker.data.userData[evt.layer.options.data]);
				}
			});

			for (key = 0; key < ddj.marker.data.userData.length; ++key) {
				val = ddj.marker.data.userData[key];

				if ((typeof val.lat !== 'undefined') && (typeof val.lng !== 'undefined')) {
					obj = {
						index: key,
						lat: parseFloat(val.lat),
						lng: parseFloat(val.lng),
						color: 'blue',
						opacity: 1,
						clickable: 1,
						iconPrefix: 'fa',
						iconFace: 'fa-dot-circle-o'
					};
					addObj = ddj.marker.settings.onAdd(obj, val);

					if (addObj !== false) {
						ddj.marker.data.layerGroup.addLayer(L.marker([obj.lat, obj.lng], {
							data: obj.index,
							icon: L.AwesomeMarkers.icon({
								prefix: obj.iconPrefix,
								icon: obj.iconFace,
								markerColor: obj.color
							}),
							opacity: obj.opacity,
							clickable: obj.clickable
						}));
					}
				}
			}
		}

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
