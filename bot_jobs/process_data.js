const census = require('./th-census-data.json')
const geo = require('../components/gis/geo/th-provinces-centroids.json')
const amphoesGeo = require('../components/gis/geo/th-map-amphoes.json')

const csv = require('csv-parser')
const fs = require('fs')
const _ = require('lodash')
const moment = require('moment')

var features = geo['features']
var provinces = []

for (var i = 0; i < features.length; i++) {
    const queryPopulation =  _.find(census, {"PROV_CODE": features[i]['properties']['PROV_CODE']})
    province = {}
    province['name'] = features[i]['properties']['PROV_NAMT']
    province['id'] = Number(features[i]['properties']['PROV_CODE'])
    province['population'] = Number(queryPopulation['population'])
    province['cases'] = []
    province['caseCount'] = 0
    provinces.push(province)
}

var amphoes = []
for (var i = 0; i < amphoesGeo['features'].length; i++) {
    const features = amphoesGeo['features']
    var district = {}
    district['name'] = features[i]['properties']['A_NAME_T']
    district['province'] = features[i]['properties']['P_NAME_T']
    district['id'] = i + 1
    district['caseCount'] = 0
    amphoes.push(district)
}
var allDates = []
fs.createReadStream('dataset.csv')
    .pipe(csv())
    .on('data', (data) => {
        allDates.push(data['announce_date'])
    }).on('end', () => {
        var i = 0
        var today = allDates[allDates.length-1].split('/')
        console.log(today)
        today = moment(new Date(`${today[1]}/${today[0]}/20${today[2]}`))
        const startDate = new Date(today.subtract(13, 'd').startOf('day'))
        console.log(startDate)
        fs.createReadStream('dataset.csv')
            .pipe(csv())
            .on('data', (data) => {
                const row = data
                var province = row['province_of_isolation']
                if (province) {
                    var query = _.findIndex(provinces, { 'name': province })
                    if (query >= 0) {
                        var date = row['announce_date']
                        const d = date.split('/')
                        date = new Date(`${d[1]}/${d[0]}/20${d[2]}`)
                        /*
                        if(d[0]>12){
                            date = new Date(`${d[1]}/${d[0]}/${d[2]}`)
                        }
                        else{
                            date = new Date(date)
                        }
                        */

                        if (date >= startDate) {
                            var caseCount = provinces[query]['caseCount']
                            caseCount++
                            provinces[query]['caseCount'] = caseCount
                            var cases = provinces[query]['cases']
                            cases.push(date)
                            provinces[query]['cases'] = cases
                        }
                    }
                    else {
                        console.log(i, province)
                    }
                }
                var amphoe = row['district_of_onset']
                if (amphoe) {
                    if (amphoe == 'เมือง') {
                        amphoe = 'เมือง' + row['province_of_onset']
                    }
                    var query = _.findIndex(amphoes, { 'name': amphoe })
                    if (query >= 0) {
                        var date = row['announce_date']
                        const d = date.split('/')
                        date = new Date(`${d[1]}/${d[0]}/20${d[2]}`)
                        //console.log(date)
                        if (date >= startDate) {
                            var caseCount = amphoes[query]['caseCount']
                            caseCount++
                            amphoes[query]['caseCount'] = caseCount
                        }
                    }
                }
                i = i + 1
            }).on('end', () => {
                for (const i in provinces){
                    const province = provinces[i]
                    province['cases'] =_.countBy(province['cases'])
                    province['cases-per-100k']=(province['caseCount']*100000 / province['population'])
                }
                fs.writeFileSync('../components/gis/data/provinces-data-14days.json', JSON.stringify(provinces), 'utf-8')
                fs.writeFileSync('../components/gis/data/amphoes-data-14days.json', JSON.stringify(amphoes), 'utf-8');
                console.log('done')
            })

    })


