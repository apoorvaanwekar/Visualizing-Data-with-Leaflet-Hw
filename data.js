// url for earthquake data
var quakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

// url for map base layer
var titleLayer = "https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
            "access_token=pk.eyJ1IjoiYWFud2VrYXIiLCJhIjoiY2plc3JlbzhoMWtoMzMzcW4ycjFseGFubCJ9.UONw6yP0mYdLLUQtyX9oyw";

// call to earthquake url
d3.json(quakeUrl, function(error, quakeData) {
    if (error) {
        console.warn(error);
    };
    console.log("In here")
    console.log(quakeData)
    // create leaflet map
    var myMap = L.map("myMap", {
        center: [37.09, -95.71],
        zoom: 5,
    });
    console.log("In here2")

    // add base layer
    L.tileLayer(titleLayer).addTo(myMap)
    console.log("In here3")

    // add geoJSON data
    L.geoJSON(quakeData).addTo(myMap)
    console.log("In here4")

})