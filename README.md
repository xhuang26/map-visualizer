# Map Visualizer

Implemented with [OpenLayers 3](http://openlayers.org/), the Map Visualizer can load a flat list of layers and let the user configure each layer and share the visual results with other users.

Visit the app at: [zodiase.github.io/map-visualizer](http://zodiase.github.io/map-visualizer/)

## Get Started
- Pass in a link to a layers source file: http://zodiase.github.io/map-visualizer/#source=sample-source/tiled-arcgis.json
- Start playing with the layers!

## Composing the Layers Source File
Check out [the sample source files folder](https://github.com/Zodiase/map-visualizer/tree/gh-pages/sample-source) to see examples.

The Souce JSON has to contain a flat list of layers and optionally some default layer configurations.

### Schema
```JSON
{
    "layers": [
        {
            "id": String,
            "title": String,
            "zIndex": Integer,
            "visible": Boolean,
            "opacity": Float,
            "extent": [Float, Float, Float, Float],
            "source": LayerSource
        }
    ],
    "extent": [Float, Float, Float, Float]
}
```

`layer.id` should be unique for each layer. It's used for identifying layers. Try to keep it short.

`layer.title` is used for displaying in the layer list.

`layer.zIndex` is used to determine the rendering order, along with the position of the layer in the list; the greater the value, the higher the layer. Try to assign a unique value for each layer. If two layers have the same `zIndex`, the later layer in the list is higher.

`layer.visible` determines the visibility of the layer.

`layer.opacity` determines the opacity of the layer.

`layer.extent` is the extent for the layer. Data outside of the extent will not be loaded or rendered.

`layer.source` determines how the layer data is loaded.

### Layer Source Schema
```JSON
{
    "type": String,
    "options": Object
}
```

`source.type` is the name of [the constructor under `ol.source`](http://openlayers.org/en/latest/apidoc/ol.source.html), case sensitive.

`source.options` is passed to the constructor as `opt_options`.

`extent` determines the initial viewing window.

## Sharing with Others
Simply copy and share the url, including all the hash values, with others. They would be able to see the same view as you do (at the time of sharing).

The app stores the changes you make, including layer configurations and viewing window adjustments, in the hash string of the url.
