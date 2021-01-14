const geo = require('./gis/geo/th-provinces-centroids.json')
const csv = require('csv-parser')
const fs = require('fs')
const _ = require('lodash')
const moment = require('moment')
var features = geo['features']
var provinces = []

const today = moment().startOf('day')
const startDate = new Date(today.subtract(14, 'd').startOf('day'))
console.log(startDate)
for (var i = 0; i < features.length; i++) {
    //console.log((i+1),features[i]['properties']['A_NAME_T'],features[i]['properties']['P_NAME_T'])
    province = {}
    province['name'] = features[i]['properties']['PROV_NAMT']
    province['id'] = Number(features[i]['properties']['PROV_CODE'])
    province['cases'] = []
    province.caseCount = 0
    provinces.push(province)
}
var i = 0
var count = 0
//fs.writeFileSync('amphoes.json', JSON.stringify(amphoes), 'utf-8');
fs.createReadStream('./gis/data/data-9-jan-2021.csv')
    .pipe(csv())
    .on('data', (data) => {
        row = data
        var province = row['province_of_onset']
        if (province) {
            var query = _.findIndex(provinces, { 'name': province })
            if (query >= 0) {
                var date = row['announce_date']
                date = new Date(date)
                if (date >= startDate) {
                    var cases = provinces[query]['cases']
                    var caseCount = provinces[query]['caseCount']
                    caseCount++
                    provinces[query]['caseCount'] = caseCount
                    cases.push(date)
                    provinces[query]['cases'] = cases
                    count++
                }
            }
            else {
                console.log(i, province)
            }
        }
        i = i + 1
    })

    .on('end', () => {
        fs.writeFileSync('./gis/data/provinces-data-14days.json', JSON.stringify(provinces), 'utf-8');
        console.log('done')
    })
