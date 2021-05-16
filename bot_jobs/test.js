const fs = require('fs')
const csv = require('csv-parser')
var allDates=[]
fs.createReadStream('dataset.csv')
    .pipe(csv())
    .on('data',(data)=>{
        allDates.push(data['announce_date'])
    }).on('end',()=>{
        console.log(allDates[allDates.length-1])

    })
