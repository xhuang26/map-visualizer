# Map Visualizer

Implemented with [OpenLayers 3](http://openlayers.org/), the Map Visualizer can load a flat list of layers and let the user to configure each layer and share the visual results with other users.

Visit the app at: [zodiase.github.io/map-visualizer](http://zodiase.github.io/map-visualizer/)

## Get Started
- Pass in a link to a layers source file: http://zodiase.github.io/map-visualizer/#source=sample-source/tiled-arcgis.json
- Start playing with the layers!

## Layers Source File
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

### Layer Source Schema
```JSON
{
    "type": String,
    "options": Object
}
```

`source.type` is the name of [the constructor under `ol.source`](http://openlayers.org/en/latest/apidoc/ol.source.html), case sensitive.

`source.options` is passed to the constructor as `opt_options`.
