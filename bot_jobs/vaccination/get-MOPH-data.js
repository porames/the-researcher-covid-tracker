const census = require('./th-census-data.json')
const axios = require('axios')
const csv = require('csv-parser')
const _ = require('lodash')
const fs = require('fs').promises;
(async () => {
    try {
        var db = []
        const req = await axios.get('https://raw.githubusercontent.com/wiki/djay/covidthailand/vaccinations.csv')
        const row = req.data.split('\n')
        for (const i in row) {
            if (i > 0) {
                const cols = row[i].split(',')
                const province = cols[1]
                if (province) {
                    const provinceData = _.find(census, { 'clean-name': province.replace(/\s/g, '').toUpperCase() })
                    const checkDb = _.findIndex(db, { "id": provinceData['PROV_CODE'] })
                    var data
                    if (provinceData) {
                        if (checkDb<0) {
                            data = {
                                'dates': [cols[0]],
                                '1st-dose-cum': [Number(cols[7])], //individual who has recevied at least 1 dose of a 2-dose vaccine
                                '2nd-dose-cum': [Number(cols[9])], //individual who are fully vaccinated with a 2-dose vaccine
                                'doses-cum': [Number(cols[7]) + Number(cols[9])], //total vaccine doses administered up until the day
                                'population': provinceData['population'],
                                'id': provinceData['PROV_CODE'],
                                'name': provinceData['province'],                                
                            }
                            db.push(data)
                        }
                        else{
                            db[checkDb]['dates'].push(cols[0])
                            db[checkDb]['1st-dose-cum'].push(Number(cols[7]))
                            db[checkDb]['2nd-dose-cum'].push(Number(cols[9]))
                            db[checkDb]['doses-cum'].push(Number(cols[7]) + Number(cols[9]))
                        }
                    }
                    else {
                        console.log('not found: ', province)
                    }
                }
            }
        }
        for(const i in db){
            const province = db[i]
            const doses = province['doses-cum']     
            const firstDoses = province['1st-dose-cum']       
            const secondDoses = province['2nd-dose-cum']
            db[i]['total-doses'] = doses[doses.length-1]
            db[i]['total-1st-dose'] = firstDoses[firstDoses.length-1]
            db[i]['total-2nd-dose'] = secondDoses[secondDoses.length-1]
            db[i]['coverage'] = ((doses[doses.length-1]/2)/province['population'])
        }
        await fs.writeFile('../../components/gis/data/provincial-vaccination-data.json', JSON.stringify(db), 'utf-8')
        console.log('done')
    } catch (e) {
        console.log(e)
    }
})();