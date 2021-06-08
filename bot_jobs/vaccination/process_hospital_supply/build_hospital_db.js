const data = require('./hospital-vaccination-data.json')
const axios = require('axios')
const fs = require('fs').promises
require('dotenv').config({ path: '../../../.env' })
const constructTable = data['dataResponse'][0]['dataSubset'][0]['dataset']
const mapboxToken = process.env.NEXT_PUBLIC_mapboxKey
const hCodes = constructTable['tableDataset']['column'][0]['stringColumn']['values']
const hNames = constructTable['tableDataset']['column'][1]['stringColumn']['values']
const supplies = constructTable['tableDataset']['column'][4]['doubleColumn']['values']
const nullIndex = constructTable['tableDataset']['column'][5]['nullIndex']
const doses_remaining = constructTable['tableDataset']['column'][5]['doubleColumn']['values']
for (const i in nullIndex) {
    doses_remaining[nullIndex[i]] = null
}

(async () => {
    try {
        var hospital_db = []
        for (const i in hNames) {
            const hospitalName = hNames[i]
            const res = await axios.get(encodeURI(`https://api.mapbox.com/geocoding/v5/mapbox.places/${hospitalName}.json?access_token=${mapboxToken}&autocomplete=true&country=th&language=th`))
            const hCode = hCodes[i]
            if (res.data['features'].length>0) {
                const address_th = res.data['features'][0]['place_name_th']
                const coordinates = res.data['features'][0]['center']
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
        await fs.writeFile('./hospital_db.json', JSON.stringify(hospital_db), 'utf-8')
    } catch (e) {
        console.log(e)
    }
})()

