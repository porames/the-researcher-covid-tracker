const _ = require('lodash')
const moment = require('moment')
const dataset = require('../data/manufacturer-vaccination-data.json')
const fs = require('fs')
var newFormat = []
for (const i in dataset) {
    const q = _.findIndex(newFormat, { date: dataset[i]['date'] })
    var toPush = {
        date: dataset[i]['date'],
        'Sinovac Life Sciences': 0,
        AstraZeneca: 0,
        Sinopharm: 0
    }
    if (q < 0) {
        toPush.date = dataset[i]['date']
        toPush[dataset[i]['manufacturer']] = dataset[i]['doses_administered']
        newFormat.push(toPush)
    }
    else {
        newFormat[q][dataset[i]['manufacturer']] = dataset[i]['doses_administered']
    }
}
fs.writeFileSync('./manufacturer-timeseries.json', JSON.stringify(newFormat, null, 2))
