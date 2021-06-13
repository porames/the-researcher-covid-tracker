const hospital_data = require('./hospital-vaccination-data.json');
const geo = require('../../th-census-data.json');
const saved_hospitals = require('./hospital_db.json')
const _ = require('lodash');
const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config({ path: '../../../.env' });
const mapsToken = process.env.google_maps_key;

(async () => {
    try {
        var hospital_db = saved_hospitals
        const data = hospital_data['data']
        for (const i in data) {
            const hospitalName = data[i]['h_name']
            const province = data[i]['province']
            const hCode = data[i]['h_code']
            if(_.findIndex(saved_hospitals,{"h_code": hCode})<0){
                const endpoint = encodeURI(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${hospitalName} ${province}&inputtype=textquery&fields=formatted_address,name,opening_hours,geometry&key=${mapsToken}`)
                const res = await axios.get(endpoint)
                if (res.data['candidates'].length > 0) {
                    const address_th = res.data['candidates'][0]['formatted_address']
                    const coordinates = res.data['candidates'][0]['geometry']['location']
                    hospital_db.push({
                        h_code: hCode,
                        name: hospitalName,
                        address_th: address_th,
                        coordinates: [coordinates['lng'],coordinates['lat']]
                    })
    
                }
                else {
                    hospital_db.push({
                        h_code: hCode,
                        name: hospitalName,
                        address_th: 'err',
                        coordinates: 'err'
                    })
                }
                console.log(`${i}/${data.length}`)    
            }
        }
        await fs.writeFile('./hospital_db.json', JSON.stringify(hospital_db), 'utf-8')               
    }
    catch (err) {
        console.log(err)
    }
})();