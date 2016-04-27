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

  const LayerListExpandedFlag = 'layer-list--expanded';

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
    button.className = 'material-icons';
    button.textContent = 'layers';

    const fakeControl = document.createElement('div');
    fakeControl.className = 'layer-list__toggle ol-control';
    fakeControl.appendChild(button);

    const layerListTitle = document.createElement('label');
    layerListTitle.className = 'layer-list__title';
    layerListTitle.textContent = 'Layers';

    const layerListBody = document.createElement('div');
    layerListBody.className = 'layer-list__body';

    const layerListContainer = document.createElement('div');
    layerListContainer.className = 'layer-list__container';
    layerListContainer.appendChild(layerListTitle);
    layerListContainer.appendChild(layerListBody);

    // Internal data structure storing layers.
    const internalLayers = [];

    const sortLayers = function (layers) {
      layers.sort((a, b) => {
        return (a.zIndex === b.zIndex) ? (b.index - a.index) : (b.zIndex - a.zIndex);
      });
    }.bind(this);

    this.reload = function (layerConfigs, extraLayerConfigs) {
      // Reset.
      const container = layerListBody;
      while (container.lastChild) {
        container.removeChild(container.lastChild);
      }
      internalLayers = [];

      // Load layers into internal data structure.
      layerConfigs.forEach((config, index) => {
        const layerId = config.id;
        const newLayer = {
          "index": index,
          "id": layerId,
          "title": config.title,
          "zIndex": config.zIndex,
          "visible": config.visible,
          "opacity": config.opacity
        };

        if (extraLayerConfigs.hasOwnProperty(layerId)) {
          const extraConfig = extraLayerConfigs[layerId];
          for (let propName of ['zIndex', 'visible', 'opacity']) {
            if (extraConfig.hasOwnProperty(propName)) {
              newLayer[propName] = extraConfig[propName];
            }
          }
        }

        internalLayers.push(newLayer);
      });

      sortLayers(internalLayers);

      // Build DOM.
      internalLayers.forEach((layer) => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'layer-list__item';
        itemContainer.setAttribute('data-layer-id', layer.id);
        itemContainer.textContent = layer.title;

        container.appendChild(itemContainer);
      });

    }.bind(this);

    this.update = function (extraLayerConfigs) {
      //console.warn('this.getMap()', this.getMap());

      // Update internal layers.
      internalLayers.forEach((layer) => {
        const layerId = layer.id;

        if (extraLayerConfigs.hasOwnProperty(layerId)) {
          const extraConfig = extraLayerConfigs[layerId];
          for (let propName of ['zIndex', 'visible', 'opacity']) {
            if (extraConfig.hasOwnProperty(propName)) {
              layer[propName] = extraConfig[propName];
            }
          }
        }
      });

      sortLayers(internalLayers);

      //! Update DOM.

    }.bind(this);

    const handleToggleLayerList = function () {
      const viewportElement = this.getMap().getViewport();
      if (viewportElement.classList.contains(LayerListExpandedFlag)) {
        viewportElement.classList.remove(LayerListExpandedFlag);
      } else {
        viewportElement.classList.add(LayerListExpandedFlag);
      }
      //this.getMap().getView().setRotation(0);
    }.bind(this);

    button.addEventListener('click', handleToggleLayerList, false);
    button.addEventListener('touchstart', handleToggleLayerList, false);

    const element = document.createElement('div');
    element.className = 'layer-list ol-unselectable';
    element.appendChild(layerListContainer);
    element.appendChild(fakeControl);

    ol.control.Control.call(this, {
      element: element,
      target: options.target
    });
  };
  ol.inherits(LayerListControl, ol.control.Control);

  const layerListControl = new LayerListControl();

  // Start map loading.
  const map = new ol.Map({
    target: $mapContainer[0],
    controls: ol.control.defaults().extend([
      layerListControl
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
      updateLayers.call(mainLayerCollection, extra.layerConfigs);
      //! Update map view extent.

      layerListControl.update(extra.layerConfigs);

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
          updateLayers.call(mainLayerCollection, extra.layerConfigs);
          //! Update map view extent.

          layerListControl.reload(data.layers, extra.layerConfigs);

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

  const updateLayers = function (extraLayerConfigs) {
    this.forEach((layer) => {
      const layerId = layer.get('id');
      if (extraLayerConfigs.hasOwnProperty(layerId)) {
        const extraConfig = extraLayerConfigs[layerId];
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
