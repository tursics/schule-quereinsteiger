# tursics.ddj.marker.js

version 0.1

## description

to be done

it's required to include leaflet
```
	<script src="lib/leaflet-0.7.7/leaflet.js"></script>
```

include in HTML header
```
	<script src="lib/tursics.ddj.js"></script>
	<script src="lib/tursics.ddj.map.js"></script>
	<script src="lib/tursics.ddj.marker.js"></script>
```


call in your JavaScript file
```
	ddj.map.marker.init(elementName, data);
```
## API

```onAdd``` function(obj, val) { return false; }

```onAddHTML``` function(obj, val) { return false; }

tbd. uses

* obj.index
* obj.lat
* obj.lng
* obj.htmlClass
* obj.htmlIconSize
* obj.htmlElement
* obj.opacity
* obj.clickable
