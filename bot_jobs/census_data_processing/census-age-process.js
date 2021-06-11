const fs = require('fs')
const csv = require('csv-parser')
const geo = require('../components/gis/geo/th-provinces-centroids.json')
const _ = require('lodash')
const { parse } = require('json2csv')
var census = []
fs.createReadStream('census-age-group-raw.csv')
    .pipe(csv())
    .on('data',(data)=>{
        if(data['province']){
            census.push(data)   
        }    
    }).on('end',async()=>{
        for (const i in census) {
            var province = census[i]
            const name = province['province']
            province['total'] = Number(province['total'].replace(/,/g, ''))
            province['<20'] = Number(province['<20'].replace(/,/g, ''))
            province['20-60'] = Number(province['20-60'].replace(/,/g, ''))
            province['>60'] = Number(province['>60'].replace(/,/g, ''))
            for (const j in geo['features']) {
                const pSearch = geo['features'][j]['properties']['PROV_NAMT']
                if (pSearch === name) {
                    census[i]['PROV_CODE'] = geo['features'][j]['properties']['PROV_CODE']
                    census[i]['PROV_NAME'] = geo['features'][j]['properties']['PROV_NAME']
                    census[i]['clean-name'] = geo['features'][j]['properties']['PROV_NAME'].replace(/\s/g, '').toUpperCase()
                    census[i]['fid']= geo['features'][j]['properties']['fid']
                    break
                }
            }
        }
        const csv = await parse(census)
        fs.writeFileSync('th-census-age-group.json', JSON.stringify(census), 'utf-8')
        fs.writeFileSync('th-census-age-group.csv',csv,'utf-8')
    })