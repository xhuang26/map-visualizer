(function () {
  'use strict';

  /**
   * @param {String} hash
   * @returns {Object}
   */
  const parseHash = (hash) => {
    let parse = {};
    hash.substr((hash.indexOf('#') === 0) ? 1 : 0).split('&').forEach((segment) => {
      const delimiterIndex = segment.indexOf('=');
      if (delimiterIndex > 0) {
        // Key-value pair.
        parse[decodeURIComponent(segment.substring(0, delimiterIndex))] =
          decodeURIComponent(segment.substring(delimiterIndex + 1));
      } else if (delimiterIndex === -1) {
        // Flag.
        parse[decodeURIComponent(segment)] = true;
      } else {
        // Invalid.
      }
    });
    return parse;
  };

  /**
   * @param {Object} map
   * @returns {String}
   */
  const buildHash = (map) => {
    let segments = [];
    map.forEach((value, key) => {
      segments.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });
    return segments.join('&');
  };

  /**
   * @param {*} value
   * @returns {Boolean}
   */
  const isValidConfigValue = (value) => {
    return typeof value === 'string' && value.length > 0 && !isNaN(value);
  };

  /**
   * @param {String} configString
   * @returns {Object}
   */
  const parseLayerConfig = (configString) => {
    const layerConfigs = {};
    if (configString.length > 0) {
      configString.split('|').forEach((segment) => {
        const delimiterIndex = segment.indexOf(':');
        if (delimiterIndex > 0) {
          const layerId = segment.substring(0, delimiterIndex),
                layerProps = segment.substring(delimiterIndex + 1).split(',').map((value) => value.trim());
          layerConfigs[layerId] = {
            zIndex: isValidConfigValue(layerProps[0]) ? Number(layerProps[0]) : 0,
            visible: isValidConfigValue(layerProps[1]) ? Boolean(Number(layerProps[1])) : true,
            opacity: isValidConfigValue(layerProps[2]) ? Number(layerProps[2]) : 1
          };
        }
      });
    }
    return layerConfigs;
  };

  /**
   * @param {Object} layerConfigs
   * @returns {String}
   */
  const buildLayerConfigString = (layerConfigs) => {
    const segments = [];
    for (let layerId of Object.keys(layerConfigs)) {
      const layerConfig = layerConfigs[layerId];
      segments.push(`${layerId}:${layerConfig.zIndex},${layerConfig.visible},${layerConfig.opacity}`);
    }
    return segments.join('|');
  };

  /**
   * @param {String} extentString
   * @returns {Array.<Number>}
   */
  const parseExtent = (extentString) => {
    const extentStringSegments = extentString.split(',').map((value) => value.trim()).filter((value) => value.length > 0);
    let extent = null;
    if (extentStringSegments.length === 4) {
      extent = extentStringSegments.map((value) => Number(value));
    }
    return extent;
  };

  /**
   * @param {Array.<Number>} extent
   * @returns {String}
   */
  const buildExtentString = (extent) => {
    const segments = extent.slice(0, 4);
    return (segments.length === 4) ? segments.join(',') : '';
  };

  // @type {Object.<SourceType, LayerType>}
  const layerTypeMapping = {
    "BingMaps": "Tile",
    "CartoDB": "Tile",
    "Cluster": "Vector",
    "ImageCanvas": "Image",
    "ImageMapGuide": "Image",
    //"Image": "Image",
    "ImageStatic": "Image",
    "ImageVector": "Image",
    "ImageWMS": "Image",
    "MapQuest": "Tile",
    "OSM": "Tile",
    "Raster": "Image",
    //"Source", // Abstract
    "Stamen": "Tile",
    "TileArcGISRest": "Tile",
    "TileDebug": "Tile",
    "TileImage": "Tile",
    "TileJSON": "Tile",
    //"Tile", // Abstract
    "TileUTFGrid": "Tile",
    "TileWMS": "Tile",
    "Vector": "Vector",
    "VectorTile": "VectorTile",
    "WMTS": "Tile",
    "XYZ": "Tile",
    "Zoomify": "Tile"
  };

  const supportedSourceTypes = Object.keys(layerTypeMapping);

  const $mapContainer = $('#map');
  const $notificationContainer = $('#notifications');

  if ($mapContainer.length === 0 || $notificationContainer.length === 0) {
    throw new ReferenceError('Can not find elements.');
  }

  // Layer List Control.
  const LayerListControl = function (opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = 'N';

    const this_ = this;
    const handleRotateNorth = function() {
      this_.getMap().getView().setRotation(0);
    };

    button.addEventListener('click', handleRotateNorth, false);
    button.addEventListener('touchstart', handleRotateNorth, false);

    const element = document.createElement('div');
    element.className = 'rotate-north ol-unselectable ol-control';
    element.appendChild(button);

    ol.control.Control.call(this, {
      element: element,
      target: options.target
    });
  };
  ol.inherits(LayerListControl, ol.control.Control);

  // Start map loading.
  const map = new ol.Map({
    target: $mapContainer[0],
    controls: ol.control.defaults().extend([
      new LayerListControl()
    ]),
    view: new ol.View({
      center: [0, 0],
      zoom: 0
    })
  });
  const mainLayerGroup = map.getLayerGroup();
  const mainLayerCollection = mainLayerGroup.getLayers();

  // Runtime data.
  let busy = false,
      loaded = false,
      loadedSourceUrl = null;

  const startWithHash = (hash) => {
    if (busy) {
      console.warn('Hash update while busy!');
      location.reload();
      return;
    }
    busy = true;
    console.info('Hash', hash);
    const parse = parseHash(hash);
    console.info('parse', parse);
    const sourceUrl = (parse.source || '').trim();
    console.info('sourceUrl', sourceUrl);
    const extra = {};
    const configString = (parse.config || '').trim();
    // Config String is optional.
    extra.layerConfigs = parseLayerConfig(configString);
    console.info('extra.layerConfigs', extra.layerConfigs);
    const extentString = (parse.extent || '').trim();
    // Extent String is optional.
    extra.extent = parseExtent(extentString);
    console.info('extra.extent', extra.extent);
    if (loaded && sourceUrl === loadedSourceUrl) {
      // Source Url didn't change.
      console.warn('Updating...');
      // Update layers.
      updateLayers.call(mainLayerCollection, extra);
      //! Update map view extent.
      console.log('Updated');
      busy = false;
    } else {
      console.warn('Loading new...');
      // Some resetting here.
      loaded = false;
      mainLayerCollection.clear();
      $notificationContainer.empty();
      $notificationContainer.append($('<span>').text(hash));
      // Source Url is necessary.
      if (sourceUrl.length === 0) {
        // No source url available.
        console.warn('No source url available.');
        $notificationContainer.append($('<span>').text('No source url available.'));
        return;
      }
      console.log('Downloading source file...');
      $notificationContainer.append($('<span>').text('Downloading source file...'));
      const JSONP_URL = (sourceUrl.indexOf('?') > -1) ? `${sourceUrl}&jsoncallback=?` : `${sourceUrl}?jsoncallback=?`;
      $.getJSON(sourceUrl)
      .fail((jqxhr, textStatus, error) => {
        const err = textStatus + ", " + error;
        console.error(err);
        $notificationContainer.append($('<span>').text(err));
      })
      .done((data, textStatus, jqxhr) => {
        console.info('Downloaded', data);
        $notificationContainer.empty();
        try {
          // Load layers.
          loadLayers.call(mainLayerCollection, data.layers);
          // Update layers.
          updateLayers.call(mainLayerCollection, extra);
          //! Update map view extent.
          loaded = true;
          loadedSourceUrl = sourceUrl;
          console.log('Loaded');
        } catch (err) {
          console.error(err);
          $notificationContainer.append($('<span>').text(err));
        }
        busy = false;
      });
    }
  };

  const loadLayers = function (layerConfigs) {
    if (!Array.isArray(layerConfigs)) {
      throw new TypeError('Expect layers to be an array.');
    }
    if (layerConfigs.length === 0) {
      throw new RangeError('There is no layer to load.');
    }
    // Create layers.
    for (let config of layerConfigs) {
      if (typeof config !== 'object') {
        throw new TypeError('Expect each layer to be an object.');
      }
      if (typeof config.id !== 'string') {
        throw new TypeError('Expect layer ID to be a string.');
      }
      if (typeof config.title !== 'string') {
        throw new TypeError('Expect layer title to be a string.');
      }
      if (typeof config.zIndex !== 'number') {
        throw new TypeError('Expect layer z-index to be a number.');
      }
      if (typeof config.visible !== 'boolean') {
        throw new TypeError('Expect layer visibility to be a boolean.');
      }
      if (typeof config.opacity !== 'number') {
        throw new TypeError('Expect layer opacity to be a number.');
      }
      if (typeof config.extent !== 'undefined') {
        if (!Array.isArray(config.extent)) {
          throw new TypeError('Expect layer extent to be an array.');
        }
        if (config.extent.length !== 4) {
          throw new RangeError('Expect layer extent to be an array of length 4.');
        }
        for (let cell of config.extent) {
          if (typeof cell !== 'number') {
            throw new TypeError('Expect layer extent to contain only numbers.');
          }
        }
      }
      if (typeof config.source !== 'object') {
        throw new TypeError('Expect layer source to be an object.');
      }
      if (typeof config.source.type !== 'string') {
        throw new TypeError('Expect layer source type to be a string.');
      }
      if (typeof config.source.options !== 'object') {
        throw new TypeError('Expect layer source options to be an object.');
      }
      if (supportedSourceTypes.indexOf(config.source.type) === -1) {
        throw new RangeError('Unsupported layer source type.');
      }
      const layerSource = new ol.source[config.source.type](config.source.options);
      console.info('layerSource', layerSource);
      const layerType = layerTypeMapping[config.source.type];
      const layer = new ol.layer[layerType]({
        id: config.id,
        title: config.title,
        source: layerSource,
        opacity: config.opacity,
        visible: config.visible,
        extent: config.extent,
        zIndex: config.zIndex
      });
      console.info('layer', layer);
      this.push(layer);
    }
  };

  const updateLayers = function (extra) {
    this.forEach((layer) => {
      const layerId = layer.get('id');
      if (extra.layerConfigs.hasOwnProperty(layerId)) {
        const extraConfig = extra.layerConfigs[layerId];
        if (extraConfig.hasOwnProperty('zIndex')) {
          layer.setZIndex(extraConfig.zIndex);
        }
        if (extraConfig.hasOwnProperty('visible')) {
          layer.setVisible(extraConfig.visible);
        }
        if (extraConfig.hasOwnProperty('opacity')) {
          layer.setOpacity(extraConfig.opacity);
        }
      }
    });
  };

  $(window).on('load', () => {
    startWithHash(location.hash);
    $(window).on('hashchange', () => {
      // Need to check if Source Url has been changed.
      startWithHash(location.hash);
    });
  });
})();
