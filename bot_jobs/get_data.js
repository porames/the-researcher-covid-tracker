
const request = require('request');
const axios = require('axios');
const parse = require('csv-parse/lib/sync');
const fs = require('fs').promises;
const _ = require('lodash');

(async () => {
    try {
        var req = await axios.get('https://raw.githubusercontent.com/wiki/djay/covidthailand/combined.csv')
        var data = parse(req.data, { columns: true })
        var dataset = []
        var totalCases = 0
        var totalDeaths = 0
        for (const i in data) {
            const date = data[i]['Date']
            const cases = Number(data[i]['Cases'])
            const deaths = Number(data[i]['Deaths'])
            totalCases = totalCases + cases
            totalDeaths = totalDeaths + deaths
            if (new Date(date) >= new Date('2021-01-01')) {
                const hospitalized = Number(data[i]['Hospitalized']) //current total patients in hospitals
                var dailyData = {
                    "Date": date,
                    "Hospitalized": hospitalized,
                    "NewConfirmed": cases,
                    "NewDeaths": deaths,
                    "Deaths": totalDeaths,
                    "Confirmed": totalCases
                }
                if (dailyData['Hospitalized'] === 0) {
                    dailyData['Hospitalized'] = dataset[dataset.length - 1]['Hospitalized']
                }
                if (dailyData['Deaths'] === 0) {
                    dailyData['Deaths'] = dataset[dataset.length - 1]['Deaths']
                }
                if (dailyData['Confirmed'] === 0) {
                    dailyData['Confirmed'] = dataset[dataset.length - 1]['Confirmed']
                }
                dataset.push(dailyData)
            }
        }
        await fs.writeFile('../components/gis/data/national-timeseries.json', JSON.stringify(dataset, null, 2));
        console.log('national dataset downloaded')

        // Switched to python backend we no longer do this now.
        //var req = await axios.get('https://data.go.th/dataset/8a956917-436d-4afd-a2d4-59e4dd8e906e/resource/be19a8ad-ab48-4081-b04a-8035b5b2b8d6/download/dataset.csv')
        //var dataset = req.data
        //dataset = dataset.replace(/ุุ/g, 'ุ')
        //dataset = dataset.replace(/อ\./g, '')
        //dataset = dataset.replace(/\/2020/g, '/20')
        //dataset = dataset.replace(/\/2021/g, '/21')
        //dataset = dataset.replace(/\/0202/g, '/21')
        //dataset = dataset.replace(/กทม/g, 'กรุงเทพมหานคร')
        //await fs.writeFile('dataset.csv', dataset);
        //console.log('provincial dataset downloaded')
    } catch (e) {
        console.log(e)
    }
})();
