const geo = require('../components/gis/geo/th-provinces-centroids.json')
const amphoesGeo = require('../components/gis/geo/th-map-amphoes.json')
const csv = require('csv-parser')
const fs = require('fs')
const _ = require('lodash')
const moment = require('moment')
/*
var features = geo['features']
var provinces = []

const today = moment().startOf('day')
const startDate = new Date(today.subtract(14, 'd').startOf('day'))
const startCollect = new Date(today.subtract(30, 'd').startOf('day'))
console.log(startDate)
console.log(startCollect)
for (var i = 0; i < features.length; i++) {
    //console.log((i+1),features[i]['properties']['A_NAME_T'],features[i]['properties']['P_NAME_T'])
    province = {}
    province['name'] = features[i]['properties']['PROV_NAMT']
    province['id'] = Number(features[i]['properties']['PROV_CODE'])
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
    district['cases'] = []
    amphoes.push(district)
}

var i = 0


fs.createReadStream('dataset.csv')
    .pipe(csv())
    .on('data', (data) => {
        const row = data
        var province = row['province_of_onset']
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
/*
                if (date >= startDate) {
                    var caseCount = provinces[query]['caseCount']
                    caseCount++
                    provinces[query]['caseCount'] = caseCount
                }
                if (date >= startCollect) {
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
                    var cases = amphoes[query]['cases']
                    var caseCount = amphoes[query]['caseCount']
                    caseCount++
                    amphoes[query]['caseCount'] = caseCount
                    cases.push(date)
                    amphoes[query]['cases'] = cases
                }

            }
        }
        i = i + 1
    }).on('end', () => {
        fs.writeFileSync('../components/gis/data/provinces-data-30days.json', JSON.stringify(provinces), 'utf-8')
        fs.writeFileSync('../components/gis/data/amphoes-data-14days.json', JSON.stringify(amphoes), 'utf-8');
        console.log('done')
    })
*/

var testData = []
fs.createReadStream('testing_data.csv')
    .pipe((csv({headers: false})))
    .on('data', (data) => {
        const row = data
        const date = row[0]
        const positive = row[1]
        const tests = row[2]
        testData.push({
            date: String(date),
            positive: Number(positive),
            tests: Number(tests)
        })
    })
    .on('end', () => {
        fs.writeFileSync('../components/gis/data/testing-data.json', JSON.stringify(testData), 'utf-8')
        console.log(JSON.stringify(testData))
    })