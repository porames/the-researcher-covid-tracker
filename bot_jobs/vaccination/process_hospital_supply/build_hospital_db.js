const hospital_db = require('./hospital_db.json')
const data = require('./hospital-vaccination-data.json')
const geo = require('../../th-census-data.json')
require('dotenv').config({ path: '../../../.env' })

const _ = require('lodash')
const axios = require('axios')
const fs = require('fs').promises

const constructTable = data['dataResponse'][0]['dataSubset'][0]['dataset']
const mapsToken = process.env.google_maps_key
const hCodes = constructTable['tableDataset']['column'][0]['stringColumn']['values']
const hNames = constructTable['tableDataset']['column'][1]['stringColumn']['values']
const provincese = constructTable['tableDataset']['column'][3]['stringColumn']['values']
const supplies = constructTable['tableDataset']['column'][4]['doubleColumn']['values']
const nullIndex = constructTable['tableDataset']['column'][5]['nullIndex']
const doses_remaining = constructTable['tableDataset']['column'][5]['doubleColumn']['values']
for (const i in nullIndex) {
    doses_remaining[nullIndex[i]] = null
}

(async () => {
    try {
        for (const i in provincese) {
            hospital_db[i]['province'] = provincese[i]
            const query = _.find(geo, { province: provincese[i] })
            hospital_db[i]['PROV_CODE'] = query['PROV_CODE']
        }
        /*
        for (const i in hNames) {
            const hospitalName = hNames[i]
            const province = provincese[i]
            const endpoint = encodeURI(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${hospitalName} ${province}&inputtype=textquery&fields=formatted_address,name,opening_hours,geometry&key=${mapsToken}`)        
            const res = await axios.get(endpoint)
            const hCode = hCodes[i]
            if (res.data['candidates'].length>0) {                
                const address_th = res.data['candidates'][0]['formatted_address']
                const coordinates = res.data['candidates'][0]['geometry']['location']
                console.log(address_th)
                hospital_db.push({
                    h_code: hCode,
                    name: hospitalName,
                    address_th: address_th,
                    coordinates: coordinates
                })
                
            }
            else{
                hospital_db.push({
                    h_code: hCode,
                    name: hospitalName,
                    address_th: 'err',
                    coordinates: 'err'
                })
            }
            console.log(`${i}/${hNames.length}`)          
        }        
        */
        await fs.writeFile('./hospital_db.json', JSON.stringify(hospital_db), 'utf-8')
    } catch (e) {
        console.log(e)
    }
})()

