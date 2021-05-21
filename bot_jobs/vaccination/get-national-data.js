const request = require('request')
const parse = require('csv-parse/lib/sync')
const moment = require('moment')
const fs = require('fs')
const _ = require('lodash')
var jsonData = []
const startDate = new Date('2021-03-01')
request('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/Thailand.csv', (err, response, body) => {
    if (!err && response.statusCode == 200) {
        const dataset = parse(body, {
            columns: true,
            skip_empty_lines: true
        })
        for (const i in dataset) {
            if (new Date(dataset[i]['date']) >= startDate) {
                jsonData.push({
                    'date': dataset[i]['date'],
                    'total_doses': Number(dataset[i]['total_vaccinations']),
                    'first_dose': Number(dataset[i]['people_vaccinated']),
                    'second_dose': Number(dataset[i]['people_fully_vaccinated'])
                })
            }
        }
        const endDate = new Date(jsonData[jsonData.length - 1]['date'])
        var dates = [startDate]
        var process_date = moment(startDate)
        while (process_date < moment(endDate)) {
            process_date = process_date.add(1, 'days')
            dates.push(process_date.toDate())
        }
        var sortedData = []
        for (const i in dates) {
            const day = moment(dates[i]).format('YYYY-MM-DD')
            const query = _.findIndex(jsonData, { 'date': day })
            if (query < 0) {
                sortedData.push({
                    'date': day,
                    'missing_data': true
                })
            }
            else {
                sortedData.push(
                    jsonData[query]
                )
            }
        }
        
        for (const i in sortedData) {
            if (sortedData[i]['missing_data'] === true){
                sortedData[i] = {
                    ...sortedData[i],
                    'total_doses': sortedData[i-1]['total_doses'],
                    'first_dose': sortedData[i-1]['first_dose'],
                    'second_dose': sortedData[i-1]['second_dose']
                }
            }
            if (i > 0) {
                sortedData[i]['daily_vaccinations'] = sortedData[i]['total_doses'] - sortedData[i - 1]['total_doses']
            }
            else {
                sortedData[i]['daily_vaccinations'] = 0
            }
        }
        fs.writeFileSync('../../components/gis/data/national-vaccination-timeseries.json', JSON.stringify(sortedData), 'utf-8')
        console.log('done')
    }
    else {
        console.log(err)
    }
})