const centroids = require('../geo/th-provinces-centroids.json')
var provincesMap = require('../geo/th-map-provinces.json')
const fs = require('fs')
var features = provincesMap.features
for (var i = 0; i < centroids.features.length; i++) {
    const centroid = centroids.features[i].geometry.coordinates
    features[i].properties['centroid'] = centroid
}
for (var i = 0; i < features.length; i++) {
    console.log(features[i].properties)
}

fs.writeFileSync('../geo/th-map-provinces-with-centroids-id.json', JSON.stringify(provincesMap), 'utf-8');