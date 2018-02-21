define(
  "dojo/_base/declare dojo/_base/array dojo/_base/Color dojo/_base/lang dojo/dom dojo/dom-class dojo/dom-construct dojo/dom-style dojo/on esri/geometry/Extent esri/geometry/Point esri/Graphic esri/layers/GraphicsLayer esri/layers/TileLayer esri/layers/VectorTileLayer esri/Map esri/PopupTemplate esri/symbols/SimpleMarkerSymbol esri/symbols/TextSymbol esri/views/MapView application/Card/Card application/Switch/widget application/countries dojo/domReady!".split(
    " "
  ),
  function(
    declare,
    array,
    Color,
    lang,
    dom,
    domClass,
    domConstruct,
    domStyle,
    on,
    Extent,
    Point,
    Graphic,
    GraphicsLayer,
    TileLayer,
    VectorTileLayer,
    Map,
    PopupTemplate,
    SimpleMarkerSymbol,
    TextSymbol,
    MapView,
    Card,
    SwitchWidget,
    countriesData
  ) {
    return declare(null, {
      config: {},
      mode: 0,
      medals: [],
      tweets: [],
      tweetIndex: -1,
      timer: null,
      startup: function(config) {
        config
          ? ((this.config = config), this._initApp())
          : this.reportError(Error("Main:: Config is not defined"));
      },
      reportError: function(a) {
        domClass.remove(document.body, "app-loading");
        domClass.add(document.body, "app-error");
        var b = dom.byId("loading_message");
        b && (b.innerHTML = "Unable to create map: " + a.message);
        return a;
      },
      _initApp: function() {
        this._initColors();
        this._initMap();
        domClass.remove(document.body, "app-loading");
      },
      _initColors: function() {
        this.color = this.config.colors[this.mode];
      },
      _initMap: function() {
        this.map = new Map();
        var backMap = new TileLayer({
          url:
            "http://services.arcgisonline.com/arcgis/rest/services/canvas/world_light_gray_base/mapserver"
        });
        this.map.add(backMap);
        this.lyrPulse = new GraphicsLayer({
          id: "PULSE"
        });
        this.lyrPulse.popupEnabled = false;
        this.map.add(this.lyrPulse);
        this.lyrPulse.on(
          "layerview-create",
          lang.hitch(this, function(a) {
            this.lyrView = a.layerView;
            var b = this.lyrView._graphicsView,
              c = b.addMany;
            b.addMany = function(a) {
              c.call(b, a);
              array.forEach(b.group.vectors, function(a) {
                a.shape.rawNode.setAttribute("data-type", "pulse");
              });
            };
          })
        );
        this.lyrMedals = new GraphicsLayer({
          id: "MEDALS"
        });
        this.lyrMedals.popupEnabled = !1;
        this.map.add(this.lyrMedals);
        this.mapView = new MapView({
          container: "panelView",
          map: this.map,
          constraints: {
            minZoom: 2
          }
        });
        this.mapView.extent = new Extent({
          xmin: -118,
          ymin: -40,
          xmax: 150,
          ymax: 71
        });
        this.mapView.ui.components = ["zoom"];
        this.mapView.padding.bottom = 200;
        this.mapView.then(
          lang.hitch(this, function() {
            this.mapView.popup.watch(
              "selectedFeature",
              lang.hitch(this, this._popupUpdated)
            );
          })
        );
        this._initUI();
      },
      _initUI: function() {
        this._initSwitch();
        this._startTimer();
      },
      _initSwitch: function() {
        this.switchMode = new SwitchWidget({
          labels: ["GOLD", "SILVER", "BRONZE", "TOTAL"]
        });
        on(this.switchMode, "change", lang.hitch(this, this._toggleSwitch));
        this.switchMode.placeAt(dom.byId("panelSwitch"));
        this.switchMode.startup();
        this._setMode(0);
      },
      _toggleSwitch: function(a) {
        this._setMode(a.value);
      },
      _startTimer: function() {
        this._getData();
        this.timer = setInterval(
          lang.hitch(this, this._getData),
          this.config.interval
        );
      },
      _getData: function() {
        this._getMedals().then(
          lang.hitch(this, function(a) {
            this.medals = a;
            this._processMedals();
            this._updateMedals();
          })
        );
      },
      _getMedals: function() {
        return dojo.xhrGet({
          url: this.config.dataUrl,
          handleAs: "json"
        });
      },
      _processMedals: function() {
        var a = dom.byId("panelContent");
        domConstruct.empty(a);
        this._sortMedals();
        domStyle.set("panelContent", "width", 140 * this.medals.length + "px");
        array.forEach(
          this.medals,
          lang.hitch(this, function(b, d) {
            var c = this._getCountry(b.CODE, b.NAME);
            c
              ? ((b.RANK = d),
                (b.X = c.X),
                (b.Y = c.Y),
                (b.NAME = c.NAME),
                (b.NAME2 = c.NAME2),
                (b.LINK = c.LINK),
                (b.FLAG = c.FLAG),
                (c = lang.clone(b)),
                (c = new Card(c)),
                (b.CARD = c),
                on(c, "center", lang.hitch(this, this._center)),
                on(c, "change", lang.hitch(this, this._switchMode)),
                c.placeAt(a),
                c.startup())
              : console.log(b.CODE, b.NAME);
          })
        );
      },
      _sortMedals: function() {
        var a = "GOLD";
        switch (this.mode) {
          case 1:
            a = "SILVER";
            break;
          case 2:
            a = "BRONZE";
            break;
          case 3:
            a = "TOTAL";
        }
        this.medals.sort(
          lang.hitch(this, function(b, d) {
            var c = parseInt(
                b[a] +
                  this._pad(b.GOLD, 9) +
                  this._pad(b.SILVER, 6) +
                  this._pad(b.BRONZE, 3),
                10
              ),
              e = parseInt(
                d[a] +
                  this._pad(d.GOLD, 9) +
                  this._pad(d.SILVER, 6) +
                  this._pad(d.BRONZE, 3),
                10
              );
            return c < e
              ? 1
              : c > e ? -1 : b.NAME < d.NAME ? -1 : b.NAME > d.NAME ? 1 : 0;
          })
        );
        array.forEach(this.medals, function(a, d) {
          a.RANK = d;
        });
      },
      _pad: function(a, b) {
        a += "";
        return a.length >= b ? a : Array(b - a.length + 1).join("0") + a;
      },
      _getCountry: function(a, b) {
        var d = array.filter(countriesData, function(c) {
          return c.CODE === a || c.NAME === b || c.CNTRY_NAME === b;
        });
        return 0 < d.length ? d[0] : null;
      },
      _switchMode: function(a) {
        a = a.mode;
        this.switchMode.toggle(a);
        this._setMode(a);
      },
      _setMode: function(a) {
        this.mode !== a &&
          ((this.mode = a),
          (this.color = this.config.colors[a]),
          this._updateMedals());
      },
      _updateMedals: function() {
        this._sortMedals();
        dom.byId("panelBottom").scrollLeft = 0;
        var a = this.lyrMedals;
        a.removeAll();
        this.lyrPulse.removeAll();
        var b = Color.fromString(this.color).toRgb();
        b.push(0.7);
        var d = "GOLD";
        switch (this.mode) {
          case 1:
            d = "SILVER";
            break;
          case 2:
            d = "BRONZE";
            break;
          case 3:
            d = "TOTAL";
        }
        var c = new PopupTemplate({
          title: "",
          content: "{NAME}"
        });
        array.forEach(
          this.medals,
          lang.hitch(this, function(e) {
            var f = e[d];
            if (0 < f) {
              var h = new Point(e.X, e.Y),
                g = {
                  CODE: e.CODE,
                  RANK: e.RANK,
                  NAME: e.NAME
                },
                k = new SimpleMarkerSymbol({
                  color: b,
                  outline: {
                    color: [255, 255, 255, 0],
                    width: "0.5px"
                  },
                  size: 20 + f / 2
                });
              k = new Graphic({
                geometry: h,
                symbol: k,
                attributes: g,
                popupTemplate: c
              });
              a.add(k);
              k = new SimpleMarkerSymbol({
                color: "#000000",
                outline: {
                  color: "#000000",
                  width: "0px"
                },
                size: 16
              });
              k = new Graphic({
                geometry: h,
                symbol: k,
                attributes: g,
                popupTemplate: c
              });
              a.add(k);
              f = new TextSymbol({
                color: "#ffffff",
                text: f,
                xoffset: 0,
                yoffset: -3,
                font: {
                  size: 8,
                  family: "sans-serif"
                }
              });
              h = new Graphic({
                geometry: h,
                symbol: f,
                attributes: g,
                popupTemplate: c
              });
              a.add(h);
            }
            if ((h = e.CARD))
              h.update({
                rank: e.RANK,
                mode: this.mode
              }),
                h.unselect();
          })
        );
      },
      _popupUpdated: function(a, b, d, c) {
        a &&
          a.layer &&
          "MEDALS" === a.layer.id &&
          ((a = a.attributes.RANK),
          (dom.byId("panelBottom").scrollLeft = 140 * a),
          this._clearSelection(),
          this._highlightSelection(a));
      },
      _center: function(a) {
        var b = a.rank,
          d = this.medals[b];
        d = new Point({
          x: d.X,
          y: d.Y
        });
        this.mapView.goTo(d);
        this._clearSelection();
        a.selected && this._highlightSelection(b);
      },
      _highlightSelection: function(a) {
        this.lyrPulse.removeAll();
        var b = this.medals[a];
        b.CARD.select();
        a = new Point({
          x: b.X,
          y: b.Y
        });
        var d = new SimpleMarkerSymbol({
          size: "20px",
          color: [0, 0, 0, 0.5],
          outline: {
            color: [0, 0, 0, 0.2],
            width: "1px"
          }
        });
        b = {
          CODE: b.CODE,
          RANK: b.RANK,
          NAME: b.NAME
        };
        var c = new PopupTemplate({
          title: "",
          content: "{NAME}"
        });
        a = new Graphic({
          geometry: a,
          symbol: d,
          attributes: b,
          popupTemplate: c
        });
        this.lyrPulse.add(a);
      },
      _clearSelection: function() {
        this.lyrPulse.removeAll();
        array.forEach(this.medals, function(a) {
          a.CARD.unselect();
        });
      }
    });
  }
);
