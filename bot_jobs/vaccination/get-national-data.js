const request = require('request')
const parse = require('csv-parse/lib/sync')
const fs = require('fs')
var jsonData = []
request('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/Thailand.csv', (err, response, body) => {
    if (!err && response.statusCode == 200) {
        const dataset = parse(body, {
            columns: true,
            skip_empty_lines: true
        })
        for (const i in dataset) {
            jsonData.push({
                'date': dataset[i]['date'],
                'total_doses': Number(dataset[i]['total_vaccinations']),
                'first_dose': Number(dataset[i]['people_vaccinated']),
                'second_dose': Number(dataset[i]['people_fully_vaccinated'])
            })
        }
        for (const i in jsonData) {
            if (i > 0) {
                jsonData[i]['daily_vaccinations'] = jsonData[i]['total_doses'] - jsonData[i - 1]['total_doses']
            }
            else {
                jsonData[i]['daily_vaccinations'] = 0
            }
        }
        fs.writeFileSync('../../components/gis/data/national-vaccination-timeseries.json', JSON.stringify(jsonData), 'utf-8')
        console.log('done')
    }
    else {
        console.log(err)
    }
})