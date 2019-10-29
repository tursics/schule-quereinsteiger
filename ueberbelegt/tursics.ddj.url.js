/* tursics.ddj.url.js */
/* version 0.2 */

/*jslint browser: true*/
/*global document, window*/

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

(function () {

	'use strict';

	// -------------------------------------------------------------------------

	ddj.url = {

		// ---------------------------------------------------------------------

		settings: {
			onInit: function () {
			},
			onLinkClicked: function () {
			},
			onKeyValueLinkClicked: function () {
			}
		},

		// ---------------------------------------------------------------------

		store: {
		},

		// ---------------------------------------------------------------------

		init: function (settings) {
			function getParent(tag, elem) {
				while (elem) {
					if ((elem.nodeName || elem.tagName).toLowerCase() === tag.toLowerCase()) {
						return elem;
					}
					elem = elem.paremtNode;
				}
				return null;
			}

			function onLinkClicked(e) {
				var elem = getParent('a', e.target || e.srcElement), key = null, value = null;
				if (elem) {
					key = elem.getAttribute('data-key');
					value = elem.getAttribute('data-value');
				}

				if ((key !== null) && (value !== null) && ddj.url.settings.onKeyValueLinkClicked) {
					return ddj.url.settings.onKeyValueLinkClicked(key, value);
				}

				return true;
			}
			ddj.url.settings.onLinkClicked = onLinkClicked;

			var key, queries, params = {}, i, split;

			if ((settings !== null) && (typeof (settings) === 'object')) {
				for (key in settings) {
					if (settings.hasOwnProperty(key) && ddj.url.settings.hasOwnProperty(key)) {
						ddj.url.settings[key] = settings[key];
					}
				}
			}

			this.initEvents();

			queries = window.location.search.replace(/^\?/, '').split('&');
			for (i = 0; i < queries.length; ++i) {
				split = queries[i].split('=');
				params[split[0]] = split[1];
			}

			if (ddj.url.settings.onInit) {
				ddj.url.settings.onInit(params);
			}
		},

		// ---------------------------------------------------------------------

		initEvents: function () {
			document.body.onclick = function (e) {
				e = e || {};

				if (ddj.url.settings.onLinkClicked) {
					if (false === ddj.url.settings.onLinkClicked(e)) {
						e.preventDefault();
					}
				}
			};
		},

		// ---------------------------------------------------------------------

		composePathname: function (obj) {
			var key,
				base = window.location.pathname.split('?')[0],
				params = (window.location.href.split('?')[1] || '').split('&'),
				p;

			if ((params.length === 1) && (params[0] === '')) {
				params = [];
			}

			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					for (p = 0; p < params.length; ++p) {
						if (params[p].split('=')[0] === key) {
							params[p] = key + '=' + obj[key];
							break;
						}
					}
					if (p >= params.length) {
						params.push(key + '=' + obj[key]);
					}
				}
			}

			return base + '?' + params.join('&');
		},

		// ---------------------------------------------------------------------

		replace: function (obj) {
			var pathname = this.composePathname(obj);
			window.history.replaceState({}, '', pathname);
		},

		// ---------------------------------------------------------------------

		push: function (obj) {
			var pathname = this.composePathname(obj);
			window.history.pushState({}, '', pathname);
		}

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
