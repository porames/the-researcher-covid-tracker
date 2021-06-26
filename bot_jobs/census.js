const geo = require('../components/gis/geo/th-provinces-centroids.json')
const csv = require('csv-parser')
const fs = require('fs')
const { parse } = require('json2csv')
var census = []
fs.createReadStream('th-census-data.csv')
    .pipe(csv({ headers: ['province', 'population'] }))
    .on('data', (data) => {
        census.push(data)
    }).on('end', async () => {
        for (const i in census) {
            var province = census[i]
            const name = province['province']
            province['population'] = Number(province['population'].replace(/,/g, ''))
            for (const j in geo['features']) {
                const pSearch = geo['features'][j]['properties']['PROV_NAMT']
                if (pSearch === name) {
                    census[i]['PROV_CODE'] = geo['features'][j]['properties']['PROV_CODE']
                    census[i]['PROV_NAME'] = geo['features'][j]['properties']['PROV_NAME']
                    census[i]['clean-name'] = geo['features'][j]['properties']['PROV_NAME'].replace(/\s/g, '').toUpperCase()
                    break
                }
            }
        }
        const csv = await parse(census)
        fs.writeFileSync("th-census-data.json", JSON.stringify(census), 'utf-8')
        //fs.writeFileSync('th-census-data.csv',csv,'utf-8')
    })