// Store our API endpoint inside queryUrl
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
    // Once we get a response, send the data.features object to the createMap function
    createMap(data.features);

});



function createMap(earthquakeData) {

    let magArr = [];

    // Get an array of eq mags (for color scale)
    earthquakeData.forEach(feature =>
        magArr.push(feature.properties.mag)
    );

    // Grab the max of the eq mags to set up color scale domain
    let colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain([0, d3.max(magArr)]);

    // Loop through locations and markers elements
    EarthquakeMarkers = earthquakeData.map((feature) => 
    //Yes, the geojson 'FORMAT' stores it in reverse, for some reason. (L.geojson parses it as [lat,lng] for you)
     //lat                         //long
    // let myIcon = L.icon({

    // }); 
     
    L.circleMarker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], 
        {
            radius: feature.properties.mag*3,
            color: 'black',
            weight: 0.5,
            fillOpacity: 0.5,
            fillColor: colorScale(feature.properties.mag)
        })
        .bindPopup("<h2> Magnitude : " + feature.properties.mag +
                    "</h2><hr><h3>" + feature.properties.place +
                    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"))

    // Add the earthquakes layer to a marker cluster group.
    var earthquakes = L.layerGroup(EarthquakeMarkers)

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
        37.09, -95.71
        ],
        zoom: 4,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0,1,2,3,4,5,6]
    var labels = [];

    // Add min & max
    var legendInfo = "<div style='background-color: white'>EQ Magnitude</div>" 
    //   "<div class=\"labels\">" +
    //     "<div class=\"min\">" + limits[0] + "</div>" +
    //     "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
    //   "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      //labels.push("<div style=\"background-color: " + colorScale(limit) + "\"></div>");
      labels.push(`<div class='label' style="background-color: ${colorScale(limit)}">${index}</div>`);
    });

    div.innerHTML += labels.join("");
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);


}