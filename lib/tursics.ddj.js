/* tursics.ddj.js */
/* version 0.1 */

/*jslint browser: true*/
/*global */

// -----------------------------------------------------------------------------

String.prototype.startsWith = String.prototype.startsWith || function (prefix) {
	'use strict';

	return this.indexOf(prefix) === 0;
};

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

(function () {

	'use strict';

	// -------------------------------------------------------------------------

	ddj.data = {
		userData: null
	};

	// -------------------------------------------------------------------------

	ddj.init = function (data) {
		ddj.data.userData = data;
	};

	// -------------------------------------------------------------------------

	ddj.getData = function (key) {
		if (typeof key === 'undefined') {
			return ddj.data.userData;
		}
		if (key === null) {
			return ddj.data.userData;
		}
		return ddj.data.userData[key];
	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
