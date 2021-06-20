const hospital_data = require('../../../components/gis/data/hospital-vaccination-data.json');
const geo = require('../../th-census-data.json');
const saved_hospitals = require('../../../components/gis/geo/hospital-locations.json')
const _ = require('lodash');
const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config({ path: '../../../.env' });
const mapsToken = process.env.google_maps_key;
    (async () => {
        try {
            var geojson = saved_hospitals
            var hospital_db = []
            const data = hospital_data['data']
            console.log("Finding new hospital locations.")
            for (const i in data) {
                const hospitalName = data[i]['h_name']
                const province = data[i]['province']
                const hCode = data[i]['h_code']
                if (_.findIndex(saved_hospitals.features, { "id": hCode }) < 0) {
                    const endpoint = encodeURI(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${hospitalName} ${province}&inputtype=textquery&fields=formatted_address,name,opening_hours,geometry&key=${mapsToken}`)
                    const res = await axios.get(endpoint)
                    if (res.data['candidates'].length > 0) {
                        const address_th = res.data['candidates'][0]['formatted_address']
                        const coordinates = res.data['candidates'][0]['geometry']['location']
                        hospital_db.push({
                            h_code: hCode,
                            h_name: hospitalName,
                            address_th: address_th,
                            province: province,
                            coordinates: [coordinates['lng'], coordinates['lat']],
                        })
                    }
                    else {
                        hospital_db.push({
                            h_code: hCode,
                            h_name: hospitalName,
                            address_th: 'err',
                            coordinates: 'err',
                            province: province
                        })
                    }
                    console.log(`${i}/${data.length}`)
                }
            }
            console.log('Geophrasing complete. Building GeoJSON.')
            for (const i in hospital_db) {
                const hospital = hospital_db[i]
                if (hospital.coordinates !== 'err') {
                    const feature = {
                        type: "Feature",
                        properties: {
                            h_name: hospital.h_name,
                            address_th: hospital.address_th,
                            h_code: hospital.h_code,
                            province: hospital.province
                        },
                        id: hospital.h_code,
                        geometry: {
                            type: "Point",
                            coordinates: hospital.coordinates
                        }
                    }
                    geojson.features.push(feature)
                }
            }
            console.log(geojson)
            await fs.writeFile('./hospital-locations.geojson', JSON.stringify(geojson), 'utf-8');
            
        }
        catch (err) {
            console.log(err);
        }
    })();