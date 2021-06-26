const csv = require('csv-parser')
const fs = require('fs')
var toWrite = []
fs.createReadStream('dataset.csv')
    .pipe(csv())
    .on("data", (data) => {
        toWrite.push(data)
    })
    .on('end', () => {
        fs.writeFileSync('./cases.json', JSON.stringify(toWrite), 'utf-8')
    })