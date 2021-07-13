const request = require('request')
const parse = require('csv-parse/lib/sync')
const moment = require('moment')
const fs = require('fs')
const _ = require('lodash')
const startDate = new Date('2021-03-06')
const currentData = require('../../components/gis/data/national-vaccination-timeseries.json')
const geo = require('../th-census-age-group.json')
const estimated_pop = require('../th-census-with-hidden-pop.json')
const currentProvincesData = require('../../components/gis/data/provincial-vaccination-data_2.json')
var jsonData = _.cloneDeep(currentData)

request('https://raw.githubusercontent.com/wiki/djay/covidthailand/vac_timeline.csv', (err, response, body) => {
    if (!err && response.statusCode == 200) {
        const dataset = parse(body, {
            columns: true,
            skip_empty_lines: true
        })
        const latest_date = dataset[dataset.length - 1]['Date'] //Latest date in the dataset.
        //Check if the local file is already up to date.
        if (moment(latest_date) > moment(currentData[currentData.length - 1]['date'])) {
            for (const i in dataset) {
                if (
                    //moment(dataset[i]['Date']) < moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(1, 'day')
                    _.findIndex(currentData, { date: dataset[i]['Date'] }) < 0 &&
                    dataset[i]['Vac Given 1 Cum'] !== ''
                ) {
                    console.log(dataset[i]['Date'])
                    jsonData.push({
                        'date': dataset[i]['Date'],
                        'total_doses': Number(dataset[i]['Vac Given 1 Cum']) + Number(dataset[i]['Vac Given 2 Cum']),
                        'first_dose': Number(dataset[i]['Vac Given 1 Cum']),
                        'second_dose': Number(dataset[i]['Vac Given 2 Cum']),
                        'total_supply': Number(dataset[i]['Vac Delivered Cum'])
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
                if (sortedData[i]['total_doses'] == 0) {
                    sortedData[i]['missing_data'] = true
                }
            }
            for (const i in sortedData) {
                if (sortedData[i]['missing_data'] === true && i > 0) {
                    sortedData[i] = {
                        ...sortedData[i],
                        'total_doses': sortedData[i - 1]['total_doses'],
                        'first_dose': sortedData[i - 1]['first_dose'],
                        'second_dose': sortedData[i - 1]['second_dose'],
                        'total_supply': sortedData[i - 1]['total_supply'],
                    }
                }
            }
            for (const i in sortedData) {
                if (sortedData[i]['total_supply'] === 0 && i > 0) {
                    sortedData[i] = {
                        ...sortedData[i],
                        'total_supply': sortedData[i - 1]['total_supply'],
                    }
                }
            }
            for (const i in sortedData) {
                if (i > 0) {
                    sortedData[i]['daily_vaccinations'] = sortedData[i]['total_doses'] - sortedData[i - 1]['total_doses']
                }
                else {
                    sortedData[i]['daily_vaccinations'] = sortedData[i]['total_doses']
                }
            }
            fs.writeFileSync('../../components/gis/data/national-vaccination-timeseries.json', JSON.stringify(sortedData, null, 2), 'utf-8')
        }
        else {
            console.log('New data already existed')
        }
    }
    else {
        console.log('Error', err)
    }
})

request('https://raw.githubusercontent.com/wiki/djay/covidthailand/vaccinations.csv', (err, response, body) => {
    if (!err && response.statusCode == 200) {
        const dataset = parse(body, {
            columns: true,
            skip_empty_lines: true
        })
        var latestDate = dataset[dataset.length - 1]['Date']
        console.log(latestDate)
        var todayData = _.filter(dataset, { 'Date': latestDate })
        var vaccinationData = {
            update_at: latestDate,
            data: []
        }
        if (todayData.length === 77) {
            for (const i in todayData) {
                const province = todayData[i]
                const geoData = _.find(estimated_pop, { "clean-name": province.Province.replace(/\s/g, '').toUpperCase() })
                if (Number(province['Vac Given 1 Cum']) > 0 && Number(province['Vac Given 2 Cum']) > 0) {
                    vaccinationData.data.push({
                        name: geoData.province,
                        id: geoData.PROV_CODE,
                        population: geoData.estimated_living_population ? geoData.estimated_living_population : geoData.population,
                        registered_population: geoData.population,
                        total_doses: Number(province['Vac Given 1 Cum']) + Number(province['Vac Given 2 Cum']),
                        "total-1st-dose": Number(province['Vac Given 1 Cum']),
                        "total-2nd-dose": Number(province['Vac Given 2 Cum'])
                    })
                }
                else {
                    throw new Error('null found')
                }
            }
            fs.writeFileSync('../../components/gis/data/provincial-vaccination-data_2.json', JSON.stringify(vaccinationData, null, 2), 'utf-8')
        }
        else {
            const vaccinationData = _.cloneDeep(currentProvincesData)
            for (const i in todayData) {
                const province = todayData[i]
                console.log(province)
                const geoData = _.find(estimated_pop, { "clean-name": province.Province.replace(/\s/g, '').toUpperCase() })
                const searchIndex = _.findIndex(vaccinationData.data, { id: String(geoData.PROV_CODE) })
                if (searchIndex >= 0 && Number(province['Vac Given 1 Cum']) > 0 && Number(province['Vac Given 2 Cum']) > 0) {
                    vaccinationData.data[searchIndex] = {
                        name: geoData.province,
                        id: geoData.PROV_CODE,
                        population: geoData.estimated_living_population ? geoData.estimated_living_population : geoData.population,
                        registered_population: geoData.population,
                        total_doses: Number(province['Vac Given 1 Cum']) + Number(province['Vac Given 2 Cum']),
                        "total-1st-dose": Number(province['Vac Given 1 Cum']),
                        "total-2nd-dose": Number(province['Vac Given 2 Cum'])
                    }
                }
                else {
                    throw new Error('null found')
                }
            }
            fs.writeFileSync('../../components/gis/data/provincial-vaccination-data_2.json', JSON.stringify(vaccinationData, null, 2), 'utf-8')
            console.log('missing provinces')
        }
    }
})