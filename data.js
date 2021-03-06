// url for earthquake data
var quakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// url for map base layer
var darkViewLayer = 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFud2VrYXIiLCJhIjoiY2plc3JlbzhoMWtoMzMzcW4ycjFseGFubCJ9.UONw6yP0mYdLLUQtyX9oyw';

var lightViewLayer = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFud2VrYXIiLCJhIjoiY2plc3JlbzhoMWtoMzMzcW4ycjFseGFubCJ9.UONw6yP0mYdLLUQtyX9oyw';

var satelliteViewLayer = 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFud2VrYXIiLCJhIjoiY2plc3JlbzhoMWtoMzMzcW4ycjFseGFubCJ9.UONw6yP0mYdLLUQtyX9oyw';

var platesData = './platesData/PB2002_boundaries.json';

// base layers
var darkView = L.tileLayer(darkViewLayer);
var lightView = L.tileLayer(lightViewLayer);
var satelliteView = L.tileLayer(satelliteViewLayer);

// Define a markerSize function that will give each earthquake a different radius based on its magnitude
function markerSize (magnitude) {
  return magnitude * 3;
}

var legendInfo = [];

// call to earthquake url
d3.json(quakeUrl, function (error, data) {
  // colors based on magnitude
  var getColors2 = d3.scaleLinear().domain(d3.extent(data.features, function (earthquake) {
    // anything 5+ should be same color
    return +earthquake.properties.mag;
  })).range(['greenyellow', 'red']);

  var idx;
  for (idx = 0; idx <= 5; idx++) {
    legendInfo.push(getColors2(idx));
  }

  // add geoJSON data
  var quakesGeoJSON = L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      var mSize = markerSize(+feature.properties.mag);
      var mColor = getColors2(+feature.properties.mag);
      //legendInfo.push(+feature.properties.mag, mColor);
      return new L.CircleMarker(latlng, {
        radius: mSize,
        fillColor: mColor,
        fillOpacity: 0.75,
        color: '#000',
        weight: 1
      });
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`Location: ${feature.properties.place}<br> Magnitude: ${feature.properties.mag}<br> Type: ${feature.properties.type}`);
    }
  });

  legendInfo.sort();

  // call to tectonic plates json file
  d3.json(platesData, function (error, pData) {
    // create layer with geoJSON
    var platesGeoJSON = L.geoJSON(pData, {
      style: function(feature) {
        return {
          color: "orange",
          weight: 2,
          fillOpacity: 1
        };
      }
    });

    // create leaflet map
    var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [
        lightView, quakesGeoJSON, platesGeoJSON
      ]
    });

    var legends = L.control({
      position: "bottomright"
    });

    legends.onAdd = function () {
      var div = L.DomUtil.create("div", "info legend");

      var labels = [];

      var legInfo = "<h1>Earthquake Magnitude</h1>";

      div.innerHTML = legInfo;

      legendInfo.forEach(function (colorValue, index) {
        if (index == 5) {
          labels.push("<li style=\"background-color: " + colorValue + "\">5+</li>");
        } else {
          labels.push("<li style=\"background-color: " + colorValue + "\">" + index + "-" + (index+1) + "</li>");
        }
      });

      div.innerHTML += "<ul>" + labels.join("") + "</ul>";

      return div;
    };

    sliderControl = L.control.sliderControl({
        position: "bottomleft",
        layer: quakesGeoJSON, 
        timeAttribute: "epoch",
        isEpoch: true,
        range: true
    });

    // Adding legend to the map
    legends.addTo(myMap);

    var overlayLayers = {
      'Earthquakes': quakesGeoJSON,
      'Faultlines': platesGeoJSON
    };

    var baseLayers = {
      'Dark': darkView,
      'Light': lightView,
      'Satellite': satelliteView
    };

    L.control
      .layers(baseLayers, overlayLayers)
      .addTo(myMap);
    myMap.addControl(sliderControl);
    sliderControl.startSlider();
  });
});