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
			onMouseOver: null,
			onMouseOut: null,
			onClick: null
		},

		// ---------------------------------------------------------------------

		data: {
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

			var key, mapboxTiles;

			if ((settings !== null) && (typeof (settings) === 'object')) {
				for (key in settings) {
					if (settings.hasOwnProperty(key) && ddj.marker.settings.hasOwnProperty(key)) {
						ddj.marker.settings[key] = settings[key];
					}
				}
			}

			ddj.marker.data.map = ddj.map.data.map;

			ddj.marker.data.layerGroup = L.featureGroup([]);
			ddj.marker.data.layerGroup.addTo(ddj.marker.data.map);
			ddj.marker.data.layerGroup.addEventListener('mouseover', function (evt) {
				updateMapHoverItem([evt.latlng.lat, evt.latlng.lng], evt.layer.options.data, evt.layer.options.icon, -32);
				if (ddj.marker.settings.onMouseOver) {
					ddj.marker.settings.onMouseOver(ddj.marker.data.userData[positions[i].index]);
				}
			});
			ddj.marker.data.layerGroup.addEventListener('mouseout', function (evt) {
				updateMapVoidItem(evt.layer.options.data);
				if (ddj.marker.settings.onMouseOut) {
					ddj.marker.settings.onMouseOut(ddj.marker.data.userData[positions[i].index]);
				}
			});
			ddj.marker.data.layerGroup.addEventListener('click', function (evt) {
				updateMapSelectItem(evt.layer.options.data);
				if (ddj.marker.settings.onClick) {
					ddj.marker.settings.onClick(ddj.marker.data.userData[positions[i].index]);
				}
			});

			createMarker(data);
		}

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
