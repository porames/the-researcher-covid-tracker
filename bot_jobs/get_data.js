const request = require('request')
const csv = require('csv-parser')
const fs = require('fs')
request('https://data.go.th/dataset/8a956917-436d-4afd-a2d4-59e4dd8e906e/resource/329f684b-994d-476b-91a4-62b2ea00f29f/download/dataset.csv', (err, response, body) => {
    if (!err && response.statusCode == 200) {
        var part2 = body
        part2 = part2.split('\n')
        part2.splice(0, 1)
        fs.readFile('dataset-1-of-2.csv', 'utf-8', (err, data) => {
            var part1 = data.split('\n')
            var combine = part1.concat(part2)
            combine = combine.join('\n')
            combine = combine.replace(/ุุ/g, 'ุ')
            combine = combine.replace(/อ\./g, '')
            combine = combine.replace(/\/2020/g, '/20')
            combine = combine.replace(/\/2021/g, '/21')

            fs.writeFileSync('dataset.csv', combine);
            console.log('done')
        })

    }
    else {
        console.log(err)
    }
})
request('https://covid19.th-stat.com/api/open/timeline', (err, response, body) => {
    if (!err && response.statusCode == 200) {
        fs.writeFileSync('../components/gis/data/national-timeseries.json', body);
        console.log('done')
    }
    else {
        console.log(err)
    }
})