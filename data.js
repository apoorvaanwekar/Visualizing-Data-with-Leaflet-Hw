// url for earthquake data
var quakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

// url for map base layer
var darkViewLayer = "https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYWFud2VrYXIiLCJhIjoiY2plc3JlbzhoMWtoMzMzcW4ycjFseGFubCJ9.UONw6yP0mYdLLUQtyX9oyw";

var lightViewLayer = "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYWFud2VrYXIiLCJhIjoiY2plc3JlbzhoMWtoMzMzcW4ycjFseGFubCJ9.UONw6yP0mYdLLUQtyX9oyw";

var satelliteViewLayer = "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}" +
    "?access_token=pk.eyJ1IjoiYWFud2VrYXIiLCJhIjoiY2plc3JlbzhoMWtoMzMzcW4ycjFseGFubCJ9.UONw6yP0mYdLLUQtyX9oyw";

var platesData = "platesData/PB2002_boundaries.json";

// base layers
var darkView = L.tileLayer(darkViewLayer);
var lightView = L.tileLayer(lightViewLayer)
var satelliteView = L.tileLayer(satelliteViewLayer)

// Define a markerSize function that will give each earthquake a different radius based on its magnitude
function markerSize(magnitude) {
    return magnitude * 3;
}
var legendInfo = []

// call to earthquake url
d3.json(quakeUrl, function (error, data) {
    // colors based on magnitude
    var getColors = d3.scaleLinear().domain(d3.extent(data.features, function (earthquake) {
        return +earthquake.properties.mag;
    })).range(['greenyellow', 'red']);

    // add geoJSON data
    var quakesGeoJSON = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            size = markerSize(+feature.properties.mag)
            color = getColors(+feature.properties.mag)
            legendInfo.push(+feature.properties.mag, color)
            return new L.CircleMarker(latlng, {
                radius: size,
                fillColor: color,
                fillOpacity: 0.85
            });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup('Location: $feature.properties.place<br> Magnitude: $feature.properties.mag<br> Type: $feature.properties.type');
        }
    });


    // call to tectonic plates json file
    d3.json(platesData, function (error, pData) {

        // create layer with geoJSON 
        var platesGeoJSON = L.geoJSON(pData);

        // create leaflet map
        var myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 3,
            layers: [
                satelliteView, quakesGeoJSON, platesGeoJSON
            ]
        });

        var legends = L.control({
            position: "bottomright"
        });

        legends.onAdd = function () {
            var div = L.DomUtil.create("div", "info legend");

            var labels = [];

            // Add min & max
            var legendDetails = "<h3>Earthquake Magnitude</h1>" +
                "<div class='labels'>" +
                "<div class='min'>" + legendInfo[0][0] + "</div>" +
                "<div class='max'>" + legendInfo[legendInfo.length - 1][0] + "</div>" +
                "</div>";

            div.innerHTML = legendDetails;

            legendInfo.forEach(function (marker) {
                labels.push("<li style='background-color: " + marker[1] + "'></li>");
            });

            div.innerHTML += "<ul>" + labels.join("") + "</ul>";
            
            return div;
        };

        // Adding legend to the map
        legends.addTo(myMap);

        var overlayLayers = {
            "Quake": quakesGeoJSON,
            "Plates": platesGeoJSON
        };

        var baseLayers = {
            "Dark": darkView,
            "Light": lightView,
            "Satellite": satelliteView
        };

        L.control
            .layers(baseLayers, overlayLayers)
            .addTo(myMap)
    });
});