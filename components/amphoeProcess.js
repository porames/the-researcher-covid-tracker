const geo = require('./gis/geo/th-map-amphoes.json')
const csv = require('csv-parser')
const fs = require('fs')
const _ = require('lodash')
const moment = require('moment')
var features = geo['features']
var amphoes = []

const today = moment()
const startDate = new Date(today.subtract(14, 'd').startOf('day'))

for (var i = 0; i < features.length; i++) {
    //console.log((i+1),features[i]['properties']['A_NAME_T'],features[i]['properties']['P_NAME_T'])
    district = {}
    district['name'] = features[i]['properties']['A_NAME_T']
    district['province'] = features[i]['properties']['P_NAME_T']
    district['id'] = i + 1
    district['caseCount'] = 0
    district['cases'] = []
    amphoes.push(district)
}
var i = 0
var count = 0
//fs.writeFileSync('amphoes.json', JSON.stringify(amphoes), 'utf-8');
fs.createReadStream('./gis/data/dataset-1-of-2.csv')
    .pipe(csv())
    .on('data', (data) => {
        row = data
        var amphoe = row['district_of_onset']

        if (amphoe) {
            if (amphoe == 'อ.เมือง') {
                amphoe = 'เมือง' + row['province_of_onset']
            }
            else if (amphoe == 'เมือง') {
                amphoe = 'เมือง' + row['province_of_onset']
            }
            
            var query = _.findIndex(amphoes, { 'name': amphoe })
            if (query >= 0) {
                var date = row['announce_date'].split('/')
                date = new Date(date)
                if (date >= startDate) {
                    var cases = amphoes[query]['cases']
                    var caseCount = amphoes[query]['caseCount']
                    caseCount++
                    amphoes[query]['caseCount'] = caseCount
                    cases.push(date)
                    amphoes[query]['cases'] = cases
                    count++
                }

            }
        }
        i = i + 1
    }).on('end', () => {
        fs.createReadStream('./gis/data/dataset-2-of-2.csv')
            .pip(csv())
            .on('data', data => {
                row = data
                var amphoe = row['district_of_onset']

                if (amphoe) {
                    if (amphoe == 'อ.เมือง') {
                        amphoe = 'เมือง' + row['province_of_onset']
                    }
                    else if (amphoe == 'เมือง') {
                        amphoe = 'เมือง' + row['province_of_onset']
                    }

                    if (amphoe)
                        var query = _.findIndex(amphoes, { 'name': amphoe })
                    if (query >= 0) {
                        var date = row['announce_date'].split('/')
                        date = new Date(date[1] + '/' + date[0] + '/' + date[2])
                        if (date >= startDate) {
                            var cases = amphoes[query]['cases']
                            var caseCount = amphoes[query]['caseCount']
                            caseCount++
                            amphoes[query]['caseCount'] = caseCount
                            cases.push(date)
                            amphoes[query]['cases'] = cases
                            count++
                        }

                    }
                }
                i = i + 1
            })
            .on('end', () => {
                fs.writeFileSync('./gis/data/amphoes-data-14days.json', JSON.stringify(amphoes), 'utf-8');
            })

    })