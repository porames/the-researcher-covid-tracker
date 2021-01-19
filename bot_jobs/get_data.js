const request = require('request')
const csv = require('csv-parser')
const fs = require('fs')
request('https://data.go.th/dataset/8a956917-436d-4afd-a2d4-59e4dd8e906e/resource/329f684b-994d-476b-91a4-62b2ea00f29f/download/dataset.csv', (err, response, body) => {
    if (!err && response.statusCode == 200) {
        var dataset = body
        dataset = dataset.replace(/ุุ/g, 'ุ')
        dataset = dataset.replace(/อ\./g, '')
        dataset = dataset.replace(/\/2020/g, '/20')
        dataset = dataset.replace(/\/2021/g, '/21')
        dataset = dataset.replace(/กทม/g, 'กรุงเทพมหานคร')
        fs.writeFileSync('dataset.csv', dataset);
        console.log('provincial dataset downloaded')
    }
    else {
        console.log(err)
    }
})
request('https://covid19.th-stat.com/api/open/timeline', (err, response, body) => {
    if (!err && response.statusCode == 200) {
        body = JSON.parse(body)
        body['Data'] = body['Data'].filter(s=>{
            return new Date(s['Date']) >= new Date('3/1/2020')
        })
        fs.writeFileSync('../components/gis/data/national-timeseries.json', JSON.stringify(body));
        console.log('national stats downloaded')
    }
    else {
        console.log(err)
    }
})