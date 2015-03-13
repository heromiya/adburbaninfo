/*
 * ADB Urban Information System
 * Copyright (c) 2014 adb.org
 */

Ext.require([
    'Ext.button.*',
    'Ext.container.Viewport',
    'Ext.data.JsonP',
    'Ext.grid.GridPanel',
    'Ext.layout.container.Border',
    'Ext.Window',
    'Ext.window.MessageBox',
    'GeoExt.Action',
    'GeoExt.container.UrlLegend',
    'GeoExt.container.VectorLegend',
    'GeoExt.container.WmsLegend',
    'GeoExt.data.FeatureStore',
    'GeoExt.data.MapfishPrintProvider',
    'GeoExt.grid.column.Symbolizer',
    'GeoExt.panel.Legend',
    'GeoExt.panel.Map',
    'GeoExt.panel.PrintMap',
    'GeoExt.selection.FeatureModel',
    'GeoExt.window.Popup'
]);

Ext.application({
    name: 'UrbanInformationSystem',
    launch: function() {
	var popup;
	var map;
	var google_var;
	var google_hybrid;
	var google_physical;
	var google_streets;
	var google_satellite;
	var google_terrain;
	var gm_satellite_wmts;
	var gm_satellite_wms;
	var gm_satellite_tms;
	var osm;
	var osm_wms;
	var context;
	var jsonURL;
	var gad2mGeoJSON;
	var ctrl, toolbarItems = [], action, actions = {};
	var template;
	var selTemplate;
	var style; 
	var selStyle;
	var vecLayer;
	var store;
	var records = [];
	var store;
	var cnt90=0, cnt100=0, cnt105=0, cnt110=0;
	var area90=0, area100=0, area105=0, area110=0;
	var center;
	var selectCtrl;
	var cityName;
	var params_0;
	var params_1;
	var params_2;
	var city_ext;
	var city_bounds;
	var layerExist = 0;
	var localhost = "http://guam.csis.u-tokyo.ac.jp:28080";
	var geoserverURL = localhost + "/geoserver/wfs";
	var geoserver_WMS_URL = localhost + "/geoserver/adburbaninfo/wms";
	var layerName;
	var vecPol;
	var r2000;
	var r2005;
	var r2010;
	var rpop2010;
	var rpop2015;
	var rpop2020;
	var layerExist = 0;
	var opa = 0.8;
	var obj;
	var chartWidth = 250, chartHeight = 155;
	var city;
	var maxScale;
	var minZoomLevel;
	jsonURL = localhost + "/geoserver/adburbaninfo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=adburbaninfo:city&outputFormat=json";
	
	var mapExtent = new OpenLayers.Bounds(4200000,-6000000,24000000,7500000);
	map = new OpenLayers.Map("map-id", 
				 {
				     projection: new OpenLayers.Projection("EPSG:900913"),
				     displayProjection: new OpenLayers.Projection("EPSG:4326"),
				     units: 'degrees',
				     restrictedExtent: mapExtent,
				     eventListeners: {
					 'moveend': function(e){
					     /*if(map.getZoom() < minZoomLevel) {
						 map.setCenter(null,minZoomLevel);
					     }*/
					 }
				     }
				 }
				);
	
	map.addControl(new OpenLayers.Control.LayerSwitcher());	
	map.addControl(new OpenLayers.Control.ScaleLine());
	map.addControl(new OpenLayers.Control.LayerSwitcher({'ascending':false}));
	map.addControl(new OpenLayers.Control.MousePosition());
	map.addControl(new OpenLayers.Control.KeyboardDefaults());
	map.addControl(new OpenLayers.Control.MousePosition());
	
	osm_wms = new OpenLayers.Layer.WMS(
	    "OpenStreetMap WMS",
	    "http://ows.terrestris.de/osm/service?",
	    {layers: 'OSM-WMS'},
	    {
		attribution: '&copy; terrestris GmbH & Co. KG <br>' +
		    'Data &copy; OpenStreetMap ' +
		    '<a href="http://www.openstreetmap.org/copyright/en"' +
		    'target="_blank">contributors<a>'
	    }
	);
	
	osm = new OpenLayers.Layer.OSM(
	    "OpenStreetMap"
	);
	
	// GoogleMap Base Layers
	google_var = new OpenLayers.Layer.Google(
	    "Google",
	    {type: google.maps.MapTypeId.BaseLayer}
	);
	
	google_hybrid = new OpenLayers.Layer.Google(
	    "Google Hybrid",
	    {type: google.maps.MapTypeId.HYBRID}
	);
	
	google_physical = new OpenLayers.Layer.Google(
	    "Google Physical",
	    {type: google.maps.MapTypeId.PHYSICAL}
	);
	
	google_satellite = new OpenLayers.Layer.Google(
	    "Google Satellite",
	    {type: google.maps.MapTypeId.SATELLITE}
	);
	
	google_streets = new OpenLayers.Layer.Google(
	    "Google Streets",
	    {type: google.maps.MapTypeId.STREETS}
	);
	
	google_terrain = new OpenLayers.Layer.Google(
	    "Google Terrain",
	    {type: google.maps.MapTypeId.TERRAIN}
	);

	gm_satellite_wmts = new OpenLayers.Layer.WMTS(
	    {
		name: "WMTS gm_satellite",
		url: 'http://guam.csis.u-tokyo.ac.jp:3857/wmts/gm_satellite/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.jpeg',
		layer: 'gm_satellite',
		matrixSet: 'GLOBAL_MERCATOR',
		format: 'image/jpeg',
		isBaseLayer: true,
		style: 'default',
		srs:"EPSG:900913",
		requestEncoding: 'REST'
	    }
	);
	gm_satellite_wms = new OpenLayers.Layer.WMS( "WMS gm_satellite",
					      "http://guam.csis.u-tokyo.ac.jp:3857/service?",
					      {layers: "gm_satellite", format: "image/jpeg", srs:"EPSG:900913",
					       exceptions: "application/vnd.ogc.se_inimage"},
					      {singleTile: true, ratio: 1, isBaseLayer: true} );
	
	gm_satellite_tms = new OpenLayers.Layer.TMS('TMS gm_satellite', 'http://guam.csis.u-tokyo.ac.jp:3857/tms/',
					     {layername: 'gm_satellite/GLOBAL_MERCATOR', type: 'jpeg',
					      tileSize: new OpenLayers.Size(256, 256)
					     });
	context = {
	    getColor: function(feature) {
		return 'blue';
	    },
	    getName: function(feature) {
		return feature.attributes.name;
	    }
	};
	
	// Updated - 12/23/2014
	// Added image for map pointer
	template = {
	    "cursor": "pointer",
	    "fillOpacity": 1,
	    "fillColor": "${getColor}",
	    "pointRadius": 5,
	    "strokeWidth": 1,
	    "strokeOpacity": 1,
	    "strokeColor": "${getColor}",
	    "graphicTitle": "${getName}",
	    "externalGraphic": "icons/balloon.png",
	    "graphicWidth": 14,
	    "graphicHeight": 24
	};
	
	selTemplate = {
	    "cursor": "pointer",
	    "fillOpacity": 1,
	    "fillColor": "${getColor}",
	    "pointRadius": 8,
	    "strokeWidth": 1,
	    "strokeOpacity": 1,
	    "strokeColor": "${getColor}",
	    "graphicTitle": "${getName}",
	    "externalGraphic": "icons/balloon.png",
	    "graphicWidth": 18,
	    "graphicHeight": 28
	};
	
	style = new OpenLayers.Style(template, {context: context});
	selStyle = new OpenLayers.Style(selTemplate, {context: context});
	
	// Updated - 1/23/2015
	// Use WMS instead of WFS
	var city_wms = new OpenLayers.Layer.WMS(
	    "City", 
	    localhost + "/geoserver/adburbaninfo/wms", {
		layers: 'adburbaninfo:city_coordinates',
		format: 'image/png',
		transparent: true,
		srs: 'EPSG:4326',
		opacity: 0.8
	    },
	    {
		singleTile: false, 
		ratio: 1, 
		isBaseLayer: false,
		yx : {'EPSG:4326' : true}
	    }
	);
	
	// WFS
	vecLayer = new OpenLayers.Layer.Vector("City WFS", {
	    strategies: [new OpenLayers.Strategy.Fixed()],
	    protocol: new OpenLayers.Protocol.WFS({
		url: geoserverURL,
		version: "1.1.0",
		featureType: "city",
		featureNS: "http://www.adburbaninfo.org"
	    }),
	    styleMap: new OpenLayers.StyleMap({
		'default': style,
		'select': selStyle
	    }),
	    projection: new OpenLayers.Projection("EPSG:4326"),
	    eventListeners: {
		'loadend': function(evt) {		    
		    // console.log(vecLayer.getDataExtent());
		    // remove after zoonToExtent
		    map.removeLayer(vecLayer)
		}
	    }
	});
	
	//map.addLayers([city_wms, vecLayer, osm, google_var, google_hybrid, google_physical, google_streets, google_satellite, google_terrain]);
	map.addLayers([city_wms, google_satellite, osm]);
	//map.addLayers([city_wms, gm_satellite_tms]);

	Ext.define('City', {
	    extend: 'Ext.data.Model',
	    fields: [
		{name: "id", type: "int"},
		{name: "name", type: "string"},
		{name: "id_0", type: "int"},
		{name: "id_1", type: "int"},
		{name: "id_2", type: "int"}
	    ]
	});
	
	var cityStoreJSON = new Ext.create('Ext.data.Store', {
	    model: 'City',
	    proxy: {
		type: 'ajax',
		url: jsonURL,
		reader: {
		    type: 'json',
		    root: 'features',
		    record: 'properties'
		}
	    },
	    fields: [{
		name: 'symbolizer',
		convert: function(v, r) {
		    return r.raw.layer.styleMap.createSymbolizer(r.raw, 'default');
		}
	    },
		     {name: 'id', type: 'int'},
		     {name: 'id_3', type: 'int'},
		     {name: 'name', type: 'string'}
		    ],
	    autoLoad: true
	});
	
	Ext.define('Scale', {
	    extend: 'Ext.data.Model',
	    fields: [{
		name: "name", 
		type: "string"
	    },{
		name: "value", 
		type: "int"
	    }]
	});
	
	var printScaleJSON = new Ext.create('Ext.data.Store', {
	    model: 'Scale',
	    proxy: {
		type: 'ajax',
		//url: '../geoserver/pdf/info.json',
                url: localhost + '/geoserver/pdf/info.json',
		reader: {
		    type: 'json',
		    root: 'scales'
		},
		fields: [
		    {name: 'name', type: 'string'},
		    {name: 'value', type: 'int'}
		]	
	    },
	    autoLoad: true
	});
	
	function JSONToCSVConvertor(ReportTitle, ShowLabel) {
	    if (typeof obj != 'object') {        
		alert("No statistical information, please check historical data!");
		return;
	    }  
	    var CSV = '';    
	    CSV += ReportTitle + '\r\n\n';
	    if (ShowLabel) {
		var row = "";
		for (var index in obj.features[0].properties) {
		    if(index=="gridcode"||index=="cluster"||index=="area")
			row += index + ',';
		}
		row = row.slice(0, -1);
		CSV += row + '\r\n';
	    }
	    for (var i = 0; i < obj.features.length; i++) {
		var row = "";
		row = obj.features[i].properties.gridcode+ ','+obj.features[i].properties.cluster+ ','+obj.features[i].properties.area;
		row.slice(0, row.length - 1);
		
		CSV += row + '\r\n';
	    }
	    if (CSV == '') {        
		alert("Invalid data");
		return;
	    }
	    var fileName = ReportTitle.replace(/ /g,"_").replace(",",""); 
	    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
	    var link = document.createElement("a");
	    
	    link.href = uri;
	    link.style = "visibility:hidden";
	    link.download = fileName + ".csv";
	    document.body.appendChild(link);
	    link.click();
	    document.body.removeChild(link);
	}
	
	function getLayerName(id_0, id_1, id_2, year, type) {
	    var layerName;
	    switch(type) {
	    case 'raster':
		if(year != '') {
		    layerName = 'adburbaninfo:' + 'r_' 
			+ id_0 + '_' 
			+ id_1 + '_' 
			+ id_2 + '_' 
			+ year;
		} else {
		    layerName = 'adburbaninfo:' + 'r_' 
			+ id_0 + '_' 
			+ id_1 + '_' 
			+ id_2;
		}
		break;
	    case 'vector':
		layerName = 'adburbaninfo:' + 'v_' 
		    + id_0 + '_' 
		    + id_1 + '_' 
		    + id_2;
		break;
	    default:
		layerName = 'adburbaninfo:' + 'r_' 
		    + id_0 + '_' 
		    + type;
	    }
	    return layerName;
	}
	
	//////////////////////////////////////////////////////////////
	function showCityExt(cityName, params_0, params_1, params_2) {
	    var mLayers2 = map.layers;
	    var layerExist = 0;
	    
	    city = cityName;
	    
	    if(popup) {
		popup.close();
	    }
	    
	    for(var b = 0; b < mLayers2.length; b++ ) {
		if(mLayers2[b].name == cityName) {
		    map.removeLayer(mLayers2[b]);
		}
	    };
	    
	    city_ext = new OpenLayers.Layer.Vector(cityName, {
		strategies: [new OpenLayers.Strategy.Fixed()],
		protocol: new OpenLayers.Protocol.WFS({
		    url: geoserverURL,
		    version: "1.1.0",
		    featureType: "city",
		    featureNS: "http://www.adburbaninfo.org",
		    srsName: "EPSG:900913"
		}),
		filter: new OpenLayers.Filter.Logical({
		    type: OpenLayers.Filter.Logical.AND,
		    filters: [
			new OpenLayers.Filter.Comparison({
			    type: OpenLayers.Filter.Comparison.EQUAL_TO,
			    property: "id_2", // city
			    value: params_2
			}),
			new OpenLayers.Filter.Comparison({
			    type: OpenLayers.Filter.Comparison.EQUAL_TO,
			    property: "id_1", // province
			    value: params_1
			}),
			new OpenLayers.Filter.Comparison({
			    type: OpenLayers.Filter.Comparison.EQUAL_TO,
			    property: "id_0", // country
			    value: params_0
			})
		    ]
		}),
		
		eventListeners: {
		    'loadstart': function() {
		    },
		    'loadend': function() {
			city_bounds = city_ext.getDataExtent();
			map.setCenter(city_bounds.getCenterLonLat(), map.getZoomForExtent(city_bounds));
			//map.zoomToExtent(city_bounds);
			map.setOptions({restrictedExtent: city_bounds});
			map.setBaseLayer(osm);
			maxScale = map.getScale();
			minZoomLevel = map.getZoomForExtent(city_bounds);
		    }
		}
	    });
	    
	    map.addLayer(city_ext);
	    
	    city_ext.displayInLayerSwitcher = false;
	    city_ext.setVisibility(true);

	    r1990 = new OpenLayers.Layer.WMS("Landsat 1990","http://guam.csis.u-tokyo.ac.jp/cgi-bin/mapserv-6.4.1?map=/var/www/map/landsat_gls.map", {layers: 'GLS1990', format: "image/jpeg"},{ singleTile: false,isBaseLayer: false});
	    r2000 = new OpenLayers.Layer.WMS("Landsat 2000","http://guam.csis.u-tokyo.ac.jp/cgi-bin/mapserv-6.4.1?map=/var/www/map/landsat_gls.map", {layers: 'GLS2000', format: "image/jpeg"},{ singleTile: false,isBaseLayer: false});
	    r2005 = new OpenLayers.Layer.WMS("Landsat 2005","http://guam.csis.u-tokyo.ac.jp/cgi-bin/mapserv-6.4.1?map=/var/www/map/landsat_gls.map", {layers: 'GLS2005', format: "image/jpeg"},{ singleTile: false,isBaseLayer: false});
	    r2010 = new OpenLayers.Layer.WMS("Landsat 2010","http://guam.csis.u-tokyo.ac.jp/cgi-bin/mapserv-6.4.1?map=/var/www/map/landsat_gls.map", {layers: 'GLS2010', format: "image/jpeg"},{ singleTile: false,isBaseLayer: false});

	    rpop2010 = new OpenLayers.Layer.WMS(
		"Population 2010 (/km2)",
		"http://guam.csis.u-tokyo.ac.jp/cgi-bin/mapserv-6.4.1?map=/var/www/map/worldpop.map", {
		    layers: 'r_' + params_0 + '_' + params_1 + '_' + params_2 + '_pop2010', 
		    transparent: "true", 
		    format: "image/png"
		},{
		    opacity: opa, 
                    singleTile: false,
		    isBaseLayer: false
		}
	    );

	    rpop2015 = new OpenLayers.Layer.WMS(
		"Population 2015 (/km2)",
		"http://guam.csis.u-tokyo.ac.jp/cgi-bin/mapserv-6.4.1?map=/var/www/map/worldpop.map", {
		    layers: 'r_' + params_0 + '_' + params_1 + '_' + params_2 + '_pop2015', 
		    transparent: "true", 
		    format: "image/png"
		},{
		    opacity: opa, 
                    singleTile: false,
		    isBaseLayer: false
		}
	    );

	    rpop2020 = new OpenLayers.Layer.WMS(
		"Population 2020 (/km2)",
		"http://guam.csis.u-tokyo.ac.jp/cgi-bin/mapserv-6.4.1?map=/var/www/map/worldpop.map", {
		    layers: 'r_' + params_0 + '_' + params_1 + '_' + params_2 + '_pop2020', 
		    transparent: "true", 
		    format: "image/png"
		},{
		    opacity: opa, 
                    singleTile: false,
		    isBaseLayer: false
		}
	    );
	    
	    vecPol = new OpenLayers.Layer.WMS(
		"Urban Growth",
		"http://guam.csis.u-tokyo.ac.jp/cgi-bin/mapserv-6.4.1?map=/var/www/map/llgc.cls.tile.map", {
		    layers: "URBAN_GROWTH",
		    transparent: "true", 
		    format: "image/png"
		},{
		    opacity: opa, 
                    singleTile: false,
		    isBaseLayer: false
		}
	    );
	    
	    vecPol.setVisibility(false);
	    r1990.setVisibility(false);
	    r2000.setVisibility(false);
	    r2005.setVisibility(false);
	    r2010.setVisibility(false);
	    rpop2010.setVisibility(false);
	    rpop2015.setVisibility(false);
	    rpop2020.setVisibility(false);
	    
	    for(var b = 0; b < mLayers2.length; b++ ) {
		if(mLayers2[b].name == "Landsat 2000") {
		    layerExist = 1;
		}
	    };
	    
	    if(!layerExist == 1) {
		map.addLayers([
		    r1990,
		    r2000, 
		    r2005, 
		    r2010, 
		    rpop2010, 
		    rpop2015, 
		    rpop2020,
		    vecPol
		]);
	    }
	    
	    for(i = 0; i < map.layers.length; i++) {
		console.log(map.layers[i].name);
		if(map.layers[i].name == "Urban Growth") {
		    map.raiseLayer(city_wms, i);
		}
	    }
	    
	    layerName = getLayerName(params_0, params_1, params_2, 2010, 'vector');
	    layerName = layerName.replace("v_", "a_");
	    jsonURL = localhost + "/geoserver/adburbaninfo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + layerName + "&outputFormat=json";		
	    getHistoryData(jsonURL);
	}
	
	// Function that retrieves chart figure
	function getHistoryData(jsonURL) {
	    records = [];
	    Ext.Ajax.request({
		loadMask: true,
		url: jsonURL,
		params: {id: "1"},
		success: function(response, callOptions) {
		    var i, gridcode, area, cluster;
		    obj = Ext.decode(response.responseText);
		    for(i=0;i < obj.features.length; i++) {
			gridcode = obj.features[i].properties.gridcode;
			cluster = obj.features[i].properties.cluster;
			area = obj.features[i].properties.area/1000000; // convert the AREA unit from sqm to sqkm
			switch (gridcode) {
			case 90:
			    cnt90 = cluster;
			    area90 = area;
			    break;
			case 100:
			    cnt100 = cluster;
			    area100 = area;
			    break;
			case 105:
			    cnt105 = cluster;
			    area105 = area;
			    break;
			case 110:
			    cnt110 = cluster;
			    area110 = area;
			    break;
			}
		    }
		    records.push({
			name: '1990',
			data1: area90,
			data2: 0,
			data3: cnt90
		    });
		    growth100 = (area100-area90)/area90*100; 
		    //console.log("growth 2000 = "+ growth100);
		    records.push({
			name: '2000',
			data1: area100,
			data2: growth100,
			data3: cnt100
		    });
		    growth105 = (area105-area100)/(area100)*100;
		    //console.log("growth 2005 = "+ growth105);
		    records.push({
			name: '2005',
			data1: area105,
			data2: growth105,
			data3: cnt105
		    });
		    growth110 = (area110-area105)/(area105)*100;
		    //console.log("growth 2010 = "+ growth110);
		    records.push({
			name: '2010',
			data1: area110,
			data2: growth110,
			data3: cnt110
		    });
		    store.loadData(records);
		},
		failure: function(response, callOptions) {
		    console.log('server-side failure with status code ' + response.status);
		}
	    });
	}
	
	var mapPanel = Ext.create('GeoExt.panel.Map', {
	    title: 'Map',
	    map: map,
	    region: 'center'
	});
	
	dropdownCity = Ext.create('Ext.form.field.ComboBox', {
	    xtype: 'combo',
	    name: 'City',
	    id: 'dropdowncombo',
	    triggerAction: 'all',
	    displayField: 'name',
	    valueField: 'id',
	    width: 230,
	    store: cityStoreJSON,
	    emptyText: 'Select City',
	    typeAhead: true,
	    listConfig: {
		listeners: {
		    select: function(list, record) {
			if(popup) {
			    popup.close();
			}
			
			Ext.getCmp('viewchart').setVisible(true);
			Ext.getCmp('legend').setVisible(true);
			Ext.getCmp('viewChart1').setVisible(true);
			Ext.getCmp('viewChart2').setVisible(true);
			Ext.getCmp('viewChart3').setVisible(true);
			Ext.getCmp('exportToCSV').setVisible(true);
			
			cityName = record.get('name');
			params_0 = record.get('id_0');
			params_1 = record.get('id_1');
			params_2 = record.get('id_2');
			
			// updated - 1/9/2015
			// added getCityName function
			showCityExt(cityName, params_0, params_1, params_2);
			getCityName();
		    }
		}
	    }
	});
	
	toolbarItems.push(dropdownCity);
	
	var refreshButton = ({
	    text: 'Home',
	    width: 100,
	    handler: function() {
		location.reload();
	    },
	    tooltip: 'Back to Home'
	});
	
	toolbarItems.push(refreshButton);
	toolbarItems.push("-");
	
	var contactLink = ({
	    text: 'Contact',
	    url: 'contact.html',
	    width: 100,
	    baseParams: {
		q: 'html+anchor+tag'
	    },
	    tooltip: 'Contact Us'
	});
	
	toolbarItems.push(contactLink);
	toolbarItems.push("-");
	
	var links = ({
	    text: 'Links',
	    url: 'links.html',
	    width: 100,
	    baseParams: {
		q: 'html+anchor+tag'
	    },
	    tooltip: 'Links to other resource'
	});
	
	toolbarItems.push(links);
	toolbarItems.push("-");
	
	var aboutLinks = ({
	    text: 'About',
	    url: 'about.html',
	    width: 100,
	    baseParams: {
		q: 'html+anchor+tag'
	    },
	    tooltip: 'About ADB Urban Information System'
	});
	
	toolbarItems.push(aboutLinks);
	toolbarItems.push("-");
	
	// CONVERT TO CSV
	
	// updated - 1/9/2015
	// get current selected city_name
	function getCityName() {
	    var layer = map.layers;
	    for(var a = 0; a < layer.length; a++ ) {
		if(layer[a].CLASS_NAME == 'OpenLayers.Layer.Vector') {
		    if(layer[a].selectedFeatures == 0) {
			city_name = layer[a].name;
		    } else {
			city_name = 'Map';
		    }
		}
	    };
	    
	    return city_name;
	}
	
	action = Ext.create('GeoExt.Action', {
	    id: 'exportToCSV',
	    xtype:'button',
	    renderTo: Ext.getBody(),
	    text: "Export to CSV",
	    width: chartWidth-15,
	    scale: 'medium',
	    x: 15, // offset
	    handler: function() {
		// updated - 1/9/2015
		// added getCityName function
		getCityName();
		JSONToCSVConvertor(city_name, true);
	    },
	    tooltip: 'Export to CSV',
	    hidden: true
	});
	
	var convertToCSV = Ext.create('Ext.button.Button', action);
	
	
	// check if vector layers are set for print module
	function checkWFSLayers() {
	    var layer = map.layers;
	    var layerCounter = 0;
	    for(var a = 0; a < layer.length; a++ ) {
		if(layer[a].CLASS_NAME == 'OpenLayers.Layer.Vector') {
		    if(layer[a].getVisibility() == true) {
			layerCounter = layerCounter + 1;
		    }
		}
	    };
	    return layerCounter;
	}
	
	// Updated - 2/5/2015
	// Scale dropdown will use the selected scale value instead of the actual scale 
	
	action = Ext.create('GeoExt.Action', {
	    text: "Print Preview",
	    width: 100,
	    tooltip: "Print Preview",
	    items: [mapPanel, legendPanel],
	    handler: function() {
		city_name = getCityName();
		var printProvider = Ext.create('GeoExt.data.MapfishPrintProvider', {
		    method: "POST", // "POST" recommended for production use, "GET" = Error!
		    capabilities: printCapabilities, // from the info.json script in the html
		    customParams: {
			mapTitle: "Urban Information System\n" + city_name,
			comment: "Legend:",
			mapScale: Math.round(map.getScale()),
			dpi: 300,
			outputFilename : city_name.replace(", ", "_")+".pdf"
		    }
		});
		
		var printPage = Ext.create('GeoExt.data.PrintPage', {
		    printProvider: printProvider
		});
		
		var printMapPanel = new GeoExt.PrintMapPanel({
		    sourceMap: mapPanel,
		    printProvider: printProvider
		});
		
		var printDialog = Ext.create('Ext.Window', {
		    title: "Print Preview",
		    id: "printDialog",
		    layout: "fit",
		    border: false,
		    width: 350,
		    height: 400,
		    items: [printMapPanel],
		    bbar: [{
			xtype: 'combo',
			emptyText: 'Select Scale',
			triggerAction: 'all',
			displayField: 'name',
			valueField: 'value',
			store: printScaleJSON,
			listConfig: {
			    listeners: {
				select: function(list, record) {
				    var name = record.get('name');
				    var value = record.get('value');
				    // console.log(name + ' - ' + value);
				    map.zoomToScale(value);
				    var printDialogItem = printDialog.items.first();
				    // console.log(printDialogItem);
				    printDialog.remove(printDialogItem);
				    
				    printProvider = Ext.create('GeoExt.data.MapfishPrintProvider', {
					method: "POST",
					capabilities: printCapabilities,
					customParams: {
					    mapTitle: "Urban Information System\n" + city_name,
					    comment: "Legend:",
					    // mapScale: Math.round(map.getScale()),
					    mapScale: value,
					    dpi: 300,
					    outputFilename : city_name.replace(", ", "_")+".pdf"
					}
				    });
				    
				    printDialog.add({
					xtype: "gx_printmappanel",
					sourceMap: mapPanel,
					printProvider: printProvider
				    });
				}
			    }
			}
		    },{
			text: "Create PDF",
			handler: function(){
			    var vectorCounter = checkWFSLayers();
			    // convenient way to fit the print page to the visible map area
			    printPage.fit(mapPanel, true);
			    // print the page, optionally including the legend
			    if(vectorCounter > 0) {
				// printProvider.print(mapPanel, printPage);
				printProvider.print(mapPanel, printPage);
			    } else {
				printProvider.print(mapPanel, printPage, {legend: legendPanel});
			    }
			}
		    }]
		});
		printDialog.show();
	    },
	    tooltip: 'Print Map'
	});
	
	toolbarItems.push(Ext.create('Ext.button.Button', action));
	toolbarItems.push("->");
	
	action = Ext.create('GeoExt.Action', {
	    text: "Download GeoTiff",
	    tooltip: "Download GeoTiff",
	    handler: function() {
		downloadGeoTiff();
	    }
	});
	toolbarItems.push(Ext.create('Ext.button.Button', action));

	function downloadGeoTiff() {
	    var layer = map.layers;
	    var layerlist="";
	    for(var a = 0; a < layer.length; a++ ) {
		if(layer[a].CLASS_NAME == 'OpenLayers.Layer.Vector' || layer[a].CLASS_NAME == 'OpenLayers.Layer.WMS') {
		    if(layer[a].getVisibility() == true) {
			if(layer[a].CLASS_NAME == 'OpenLayers.Layer.Vector') {
			    if(layerlist == '')
				layerlist = layerlist + "adburbaninfo:" + layer[a].name.toLowerCase();
			    else
				layerlist = layerlist + "," + "adburbaninfo:" + layer[a].name.toLowerCase();
			}else{ //WMS
			    if(layerlist == '')
				layerlist = layerlist + layer[a].params.LAYERS;
			    else 
				layerlist = layerlist + ","  + layer[a].params.LAYERS;
			}
		    }
		}
	    };
	    var ext = map.getExtent().transform(
		new OpenLayers.Projection("EPSG:900913"), 
		new OpenLayers.Projection("EPSG:4326") 
	    );
	    //var url = geoserver_WMS_URL + "?service=WMS&version=1.1.0&request=GetMap&layers=" + layerlist + "&styles=&bbox=" + ext.toBBOX() +"&width=512&height=394&srs=EPSG:4326&format=image/geotiff";
	    var url = "http://guam.csis.u-tokyo.ac.jp/cgi-bin/mapserv-6.4.1?map=/var/www/map/llgc.cls.tile.wcs.map&&SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&FORMAT=GTiff&COVERAGE=URBAN_GROWTH_WCS&BBOX="+map.getExtent().toBBOX()+"&CRS=EPSG:3857&RESPONSE_CRS=EPSG:3857&RESX=30&RESY=30"
	    window.location.assign(url);
	    return;
	}

	center = new OpenLayers.LonLat(100, 12);
//	map.setCenter(center, 4);
//	map.zoomToMaxExtent();
	map.setCenter(mapExtent.getCenterLonLat(), map.getZoomForExtent(mapExtent));
	
	if(store) {
	    store.reload();
	} else {
	    store = Ext.create('Ext.data.Store', {
		fields : ['name','data1', 'data2', 'data3'],
		data: records,
		paging : false
	    });
	}
	
	var viewChart1 = Ext.create('Ext.chart.Chart', {
	    id: 'viewChart1',
	    renderTo: Ext.getBody(),
	    width: chartWidth,
	    height: chartHeight,
	    animate: true,
	    store: store,
	    axes: [{
		type: 'Numeric',
		grid: true,
		position: 'left',
		fields: ['data1'],
		label: {
		    renderer: Ext.util.Format.numberRenderer('0,0')
		},
		title: 'Total Area (km2)',
		grid: true
	    }, {
		type: 'Category',
		position: 'bottom',
		fields: ['name'],
		title: 'Year'
	    }],
	    series: [{
		type: 'line',
		highlight: {
		    size: 7,
		    radius: 7
		},
		axis: 'left',
		fill: true,
		xField: 'name',
		yField: 'data1',
		markerConfig: {
		    type: 'circle',
		    size: 4,
		    radius: 4,
		    'stroke-width': 0
		}
	    }]
	});
	
	var viewChart2 = Ext.create('Ext.chart.Chart', {
	    id: 'viewChart2',
	    renderTo: Ext.getBody(),
	    width: chartWidth,
	    height: chartHeight,
	    animate: true,
	    store: store,
	    axes: [{
		type: 'Numeric',
		position: 'left',
		fields: 'data2',
		label: {
		    renderer: Ext.util.Format.numberRenderer('0,0')
		},
		title: 'Growth %',
		grid: true,
		minimum: 0
	    }, {
		type: 'Category',
		position: 'bottom',
		fields: ['name'],
		title: 'Year'
	    }],
	    series: [{
		type: 'line',
		highlight: {
		    size: 7,
		    radius: 7
		},
		axis: 'left',
		fill: true,
		xField: 'name',
		yField: 'data2',
		markerConfig: {
		    type: 'circle',
		    size: 4,
		    radius: 4,
		    'stroke-width': 0
		}
	    }]
	});
	
	var viewChart3 = Ext.create('Ext.chart.Chart', {
	    id: 'viewChart3',
	    renderTo: Ext.getBody(),
	    width: chartWidth,
	    height: chartHeight,
	    animate: true,
	    store: store,
	    axes: [{
		type: 'Numeric',
		grid: true,
		position: 'left',
		fields: 'data3',
		label: {
		    renderer: Ext.util.Format.numberRenderer('0,0')
		},
		title: '# of Cluster',
		grid: true
	    }, {
		type: 'Category',
		position: 'bottom',
		fields: ['name'],
		title: 'Year'
	    }],
	    series: [{
		type: 'line',
		highlight: {
		    size: 7,
		    radius: 7
		},
		axis: 'left',
		fill: true,
		xField: 'name',
		yField: 'data3',
		markerConfig: {
		    type: 'circle',
		    size: 4,
		    radius: 4,
		    'stroke-width': 0
		}
	    }]
	});
	
	var legendPanel = Ext.create('GeoExt.panel.Legend', {
	    defaults: {
		labelCls: 'mylabel',
		style: 'padding:5px',
		baseParams: {
		    FORMAT: 'image/png'
		}
	    },
	    bodyStyle: 'padding:5px',
	    width: 230,
	    height: 600,
	    autoScroll: true,
	    layerStore: mapPanel.layers,
	    filter: function(record) {
		if(record.data.title == city){
		    // console.log(record.data);
		    return false;
		}else{
		    // console.log(record.data);
		    return true;
		}
	    }
	});
	
	var viewport = Ext.create('Ext.container.Viewport', {
	    layout: 'border',
	    items: [mapPanel, {
		title: 'Urban Information System',
		region: 'north',
		autoHeight: true,
		border: true,
		dockedItems: [{
		    xtype: 'toolbar',
		    dock: 'top',
		    items: toolbarItems
		}]
	    },
		    {
			title: 'Historical Summary',
			id: 'viewchart',
			region: 'east',
			width: 280,
			collapsible: true,
			autoScroll: true,
			items: [viewChart1, viewChart2, viewChart3, convertToCSV],
			hidden: true
		    },
		    {
			title: 'Legend',
			id: 'legend',
			region: "west",
			// width: 230,
			collapsible: true,
			autoScroll: true,
			items: [legendPanel],
			hidden: true				
		    }]
	});
	
	// simplified the createPopup function
	// Updated - 1/23/2015
	// Changed to onclick on WMS layer
	getWMSFeatureInfo = new OpenLayers.Control.WMSGetFeatureInfo({
	    url: geoserver_WMS_URL,
	    title: 'Get Feature Info',
	    layers: [city_wms],
	    queryVisible: true
	});
	
	getWMSFeatureInfo.infoFormat = 'application/vnd.ogc.gml';
	getWMSFeatureInfo.events.register("getfeatureinfo", this, getWMSFeature);
	
	map.addControl(getWMSFeatureInfo);
	getWMSFeatureInfo.activate();
	
	function getWMSFeature(e) {
	    if(popup2) {
		popup2.close();
	    }
	    
	    if(e.features && e.features.length) {
		var city_name = e.features[0].attributes.name;
		var id_0 = e.features[0].attributes.id_0;
		var id_1 = e.features[0].attributes.id_1;
		var id_2 = e.features[0].attributes.id_2;				
		var desc = e.features[0].attributes.dbpedia_comment;
		
		var popup2 = new GeoExt.Popup({
		    title: "Feature Info",
		    width: 300,
		    map: map,
		    location: e.xy,
		    html: "<b>"+city_name+"</b>" + "<br/>" + "<p>"+desc+"</p>",
		    buttons: [{
			text: 'View',
			onClick: function() {
			    var name = city_name;
			    var id0 = id_0;
			    var id1 = id_1;
			    var id2 = id_2;
			    
			    showCityExt(name,id0,id1,id2);
			    city_name = getCityName();
			    
			    for(var f=0;f<e.features.length;f++) {
				if(e.features[f].attributes.id_0 == id0) {
				    Ext.getCmp('viewchart').setVisible(true);
				    Ext.getCmp('legend').setVisible(true);
				    Ext.getCmp('viewChart1').setVisible(true);
				    Ext.getCmp('viewChart2').setVisible(true);
				    Ext.getCmp('viewChart3').setVisible(true);
				    Ext.getCmp('exportToCSV').setVisible(true);
				    break;
				}
			    }
			    popup2.close();
			}
		    }],
		    maximizable: true,
		    collapsible: true,
		    anchorPosition: 'auto'
		})
		popup2.show();
	    }
	}
    }
});





















