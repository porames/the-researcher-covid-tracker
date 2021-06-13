const hospital_db = require('./hospital_db.json')

const fs = require('fs').promises
const geojson = {
    "type": "FeatureCollection",
    "name": "th hospital db",
    "features": []
}



for (const i in hospital_db) {
    const hospital = hospital_db[i]
    if (hospital.coordinates !== 'err') {
        const feature = {
            type: "Feature",
            properties: {
                name: hospital.name,
                address_th: hospital.address_th,
                h_code: hospital.h_code,
                id: hospital.h_code
            },
            geometry: {
                type: "Point",
                coordinates: [hospital.coordinates['lng'], hospital.coordinates['lat']]
            }
        }
        geojson.features.push(feature)
    }

}
fs.writeFile('../../../components/gis/geo/hospital_db.geojson', JSON.stringify(geojson), 'utf-8')
