const request = require('request')
const csv = require('csv-parser')
const fs = require('fs')
var jsonData = []
request('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv', (err,response,body) =>{
    if (!err && response.statusCode == 200) {
        var dataset = body.split('\n')
        for (const i in dataset){
            if(dataset[i].split(',')[1] === 'THA'){
                const date = dataset[i].split(',')[2]
                const vaccinated = dataset[i].split(',')[4]
                const daily_vaccinations = dataset[i].split(',')[7]
                jsonData.push({
                    'date': date,
                    'vaccinated': Number(vaccinated),
                    'daily_vaccinations': Number(daily_vaccinations)
                })

            }
        }
        for(const i in jsonData){
            if(i>=1){
                if(jsonData[i]['vaccinated'] === 0){
                    jsonData[i]['vaccinated'] = jsonData[i-1]['vaccinated']
                }
                if(jsonData[i]['daily_vaccinations'] === 0){
                    jsonData[i]['daily_vaccinations'] = jsonData[i-1]['daily_vaccinations']
                }
            }
        }
        fs.writeFileSync('../../components/gis/data/national-vaccination-timeseries.json',JSON.stringify(jsonData),'utf-8')
        console.log('done')
    }
    else {
        console.log(err)
    }
})