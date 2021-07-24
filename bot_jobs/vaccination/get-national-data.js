const axios = require('axios')
const parse = require('csv-parse/lib/sync')
const moment = require('moment')
const { sum, mean } = require('d3')
const fs = require('fs')
const _ = require('lodash')
const startDate = new Date('2021-03-06')
const age_pop = require('../th-census-age-group.json')
const estimated_pop = require('../th-census-with-hidden-pop.json')

const currentProvincesData = require('../../components/gis/data/provincial-vaccination-data_2.json')
const currentData = require('../../components/gis/data/national-vaccination-timeseries.json')

axios.get('https://raw.githubusercontent.com/wiki/djay/covidthailand/vac_timeline.csv')
    .then((response => {
        const body = response.data
        const dataset = parse(body, {
            columns: true,
            skip_empty_lines: true
        })
        var jsonData = _.cloneDeep(currentData)
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
                        'Sinovac-supply': Number(dataset[i]['Vac Allocated Sinovac']),
                        'AstraZeneca-supply': Number(dataset[i]['Vac Allocated AstraZeneca']),
                        'total_supply': Number(dataset[i]['Vac Allocated AstraZeneca']) + Number(dataset[i]['Vac Allocated Sinovac'])
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
            fs.writeFileSync('../../components/gis/data/national-vaccination-timeseries.json', JSON.stringify(sortedData, null, 4), 'utf-8')
        }
        else {
            console.log('New data already existed')
        }
    }
    )).catch(err => {
        console.log(err)
    })

function calculate_national_avg(vaccinationData) {
    var data = vaccinationData.data
    const population = sum(data, (d) => d["registered_population"])
    const first_doses_sum = sum(data, (d) => d["total-1st-dose"])
    const second_doses_sum = sum(data, (d) => d["total-2nd-dose"])
    const over_60_1st_dose_sum = sum(data, (d) => d["over-60-1st-dose"])
    const over_60_2nd_dose_sum = sum(data, (d) => d["over-60-2nd-dose"])
    const over_60_population = sum(data, (d) => d["over-60-population"])
    const supply_sum = sum(data, (d) => d["total-supply"])
    vaccinationData.data.push({
        "name": "ค่าเฉลี่ยทั้งประเทศ",
        "id": "0",
        "population": population,
        "registered_population": population,
        "over-60-population": over_60_population,
        "total_doses": first_doses_sum + second_doses_sum,
        "total-1st-dose": first_doses_sum,
        "total-2nd-dose": second_doses_sum,
        "1st-dose-coverage": first_doses_sum / population,
        "2nd-dose-coverage": second_doses_sum / population,
        "over-60-1st-dose": over_60_1st_dose_sum,
        "over-60-2nd-dose": over_60_2nd_dose_sum,
        "over-60-1st-dose-coverage": over_60_1st_dose_sum / over_60_population,
        "total-supply": supply_sum
    })
    return vaccinationData
}

axios.get('https://raw.githubusercontent.com/wiki/djay/covidthailand/vaccinations.csv')
    .then(response => {
        const body = response.data

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
                const geoData = _.find(estimated_pop, { 'clean-name': province.Province.replace(/\s/g, '').toUpperCase() })
                if (Number(province['Vac Given 1 Cum']) > 0 && Number(province['Vac Given 2 Cum']) > 0) {
                    const populationByAge = _.find(age_pop, { PROV_CODE: geoData['PROV_CODE'] })
                    vaccinationData.data.push({
                        name: geoData.province,
                        id: geoData.PROV_CODE,
                        population: geoData.estimated_living_population ? geoData.estimated_living_population : geoData.population,
                        registered_population: geoData.population,
                        total_doses: Number(province['Vac Given 1 Cum']) + Number(province['Vac Given 2 Cum']),
                        'total-1st-dose': Number(province['Vac Given 1 Cum']),
                        'total-2nd-dose': Number(province['Vac Given 2 Cum']),
                        'AstraZeneca-supply': Number(province['Vac Allocated AstraZeneca']),
                        'Sinovac-supply': Number(province['Vac Allocated Sinovac']),
                        'total-supply': Number(province['Vac Allocated Sinovac']) + Number(province['Vac Allocated AstraZeneca']),
                        'over-60-1st-dose': Number(province['Vac Group Over 60 1 Cum']),
                        'over-60-2nd-dose': Number(province['Vac Group Over 60 2 Cum']),
                        'over-60-population': populationByAge['>60']
                    })
                }
                else {
                    throw 'null found'
                }
            }
            calculate_national_avg(vaccinationData)
            fs.writeFileSync('../../components/gis/data/provincial-vaccination-data_2.json', JSON.stringify(vaccinationData, null, 4), 'utf-8')
        }
        else {
            const vaccinationData = _.cloneDeep(currentProvincesData)
            for (const i in todayData) {
                const province = todayData[i]
                const geoData = _.find(estimated_pop, { 'clean-name': province.Province.replace(/\s/g, '').toUpperCase() })
                const searchIndex = _.findIndex(vaccinationData.data, { id: String(geoData.PROV_CODE) })
                if (searchIndex >= 0 && Number(province['Vac Given 1 Cum']) > 0 && Number(province['Vac Given 2 Cum']) > 0) {
                    const populationByAge = _.find(age_pop, { PROV_CODE: geoData['PROV_CODE'] })
                    vaccinationData.data[searchIndex] = {
                        name: geoData.province,
                        id: geoData.PROV_CODE,
                        population: geoData.estimated_living_population ? geoData.estimated_living_population : geoData.population,
                        registered_population: geoData.population,
                        total_doses: Number(province['Vac Given 1 Cum']) + Number(province['Vac Given 2 Cum']),
                        'total-1st-dose': Number(province['Vac Given 1 Cum']),
                        'total-2nd-dose': Number(province['Vac Given 2 Cum']),
                        'AstraZeneca-supply': Number(province['Vac Allocated AstraZeneca']),
                        'Sinovac-supply': Number(province['Vac Allocated Sinovac']),
                        'total-supply': Number(province['Vac Allocated Sinovac']) + Number(province['Vac Allocated AstraZeneca']),
                        'over-60-1st-dose': Number(province['Vac Group Over 60 1 Cum']),
                        'over-60-2nd-dose': Number(province['Vac Group Over 60 2 Cum']),
                        'over-60-population': populationByAge['>60']
                    }

                }
                else {
                    throw 'null found :('
                }
            }
            calculate_national_avg(vaccinationData)
            fs.writeFileSync('../../components/gis/data/provincial-vaccination-data_2.json', JSON.stringify(vaccinationData, null, 4), 'utf-8')
            console.log('missing provinces')
        }

    }).catch(err => {
        console.log(err)
    })