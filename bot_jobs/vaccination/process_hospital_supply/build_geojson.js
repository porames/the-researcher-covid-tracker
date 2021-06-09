const hospital_db = require('./hospital_db.json')
const fs = require('fs').promises
const geojson = {
    "type": "FeatureCollection",
    "name": "th hospital db",
    "features": []
}



for (const i in hospital_db) {
    const hospital = hospital_db[i]
    const feature = {
        type: "Feature",
        properties: hospital,
        geometry: {
            type: "Point",
            coordinates: [hospital.coordinates['lng'], hospital.coordinates['lat']]
        }
    }
    geojson.features.push(feature)
}
fs.writeFile('./hospital_db.geojson', JSON.stringify(geojson), 'utf-8')
