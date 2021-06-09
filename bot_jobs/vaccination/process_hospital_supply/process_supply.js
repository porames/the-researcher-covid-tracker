const hospital_db = require('./hospital_db.json')
const data = require('./hospital-vaccination-data.json')
const axios = require('axios')
const fs = require('fs').promises
const _ = require('lodash')
const constructTable = data['dataResponse'][0]['dataSubset'][0]['dataset']
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
        var hospital_supply = []
        for (const i in hCodes) {        
            const hospital = {
                "h_code": String(hCodes[i]),
                "h_name": String(hNames[i]),
                "doses_delivered": Number(supplies[i]),
                "doses_remaining": Number(doses_remaining[i]),
                "percentage": Number(doses_remaining[i])/Number(supplies[i])
            }
            hospital_supply.push(hospital)
        }        
        await fs.writeFile('../../../components/gis/data/hospital-supply.json', JSON.stringify(hospital_supply), 'utf-8')
    } catch (e) {
        console.log(e)
    }
})()

