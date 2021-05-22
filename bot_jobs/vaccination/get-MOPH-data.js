const census = require('../th-census-age-group.json')
const axios = require('axios')
const parse = require('csv-parse/lib/sync')
const _ = require('lodash')
const fs = require('fs').promises;
(async () => {
    try {
        var db = []
        const req = await axios.get('https://raw.githubusercontent.com/wiki/djay/covidthailand/vaccinations.csv')
        const dataset = parse(req.data, {
            columns: true,
            skip_empty_lines: true
        })
        for (const i in dataset) {
            const province = dataset[i]['Province']
            if (province) {
                const provinceData = _.find(census, { 'clean-name': province.replace(/\s/g, '').toUpperCase() })
                const checkDb = _.findIndex(db, { "id": provinceData['PROV_CODE'] })
                var data
                if (provinceData) {
                    if (checkDb < 0) {
                        data = {
                            'dates': [dataset[i]['Date']],
                            '1st-dose-cum': [Number(dataset[i]['Vac Given 1 Cum'])], //individual who has recevied at least 1 dose of a 2-dose vaccine
                            '2nd-dose-cum': [Number(dataset[i]['Vac Given 2 Cum'])], //individual who are fully vaccinated with a 2-dose vaccine
                            'doses-cum': [Number(dataset[i]['Vac Given 1 Cum']) + Number(dataset[i]['Vac Given 2 Cum'])], //total vaccine doses administered up until the day

                            '>60-1st-dose-cum': [Number(dataset[i]['Vac Group Over 60 1 Cum'])],
                            '>60-2nd-dose-cum': [Number(dataset[i]['Vac Group Over 60 2 Cum'])],                            
                            '>60-doses-cum': [Number(dataset[i]['Vac Group Over 60 1 Cum']) + Number(dataset[i]['Vac Group Over 60 2 Cum'])],

                            'population': provinceData['total'],
                            '>60-population': provinceData['>60'],
                            '20-60-population': provinceData['20-60'],                            
                            'id': provinceData['PROV_CODE'],
                            'name': provinceData['province'],
                        }
                        db.push(data)
                    }
                    else {
                        db[checkDb]['dates'].push(dataset[i]['Date'])
                        db[checkDb]['1st-dose-cum'].push(Number(dataset[i]['Vac Given 1 Cum']))
                        db[checkDb]['2nd-dose-cum'].push(Number(dataset[i]['Vac Given 2 Cum']))
                        db[checkDb]['doses-cum'].push(Number(dataset[i]['Vac Given 1 Cum']) + Number(dataset[i]['Vac Given 2 Cum']))

                        db[checkDb]['>60-1st-dose-cum'].push(Number(dataset[i]['Vac Group Over 60 1 Cum']))
                        db[checkDb]['>60-2nd-dose-cum'].push(Number(dataset[i]['Vac Group Over 60 2 Cum']))
                        db[checkDb]['>60-doses-cum'].push(Number(dataset[i]['Vac Group Over 60 1 Cum']) + Number(dataset[i]['Vac Group Over 60 2 Cum']))
                    }
                }
                else {
                    console.log('not found: ', province)
                }
            }
        }

        for (const i in db) {
            const province = db[i]
            const doses = province['doses-cum']
            const firstDoses = province['1st-dose-cum']
            const secondDoses = province['2nd-dose-cum']
            db[i]['total-doses'] = doses[doses.length - 1]
            db[i]['total-1st-dose'] = firstDoses[firstDoses.length - 1]
            db[i]['total-2nd-dose'] = secondDoses[secondDoses.length - 1]
            db[i]['coverage'] = ((doses[doses.length - 1] / 2) / province['population'])
        }
        await fs.writeFile('../../components/gis/data/provincial-vaccination-data.json', JSON.stringify(db), 'utf-8')
        console.log('done')        
    } catch (e) {
        console.log(e)
    }
})();