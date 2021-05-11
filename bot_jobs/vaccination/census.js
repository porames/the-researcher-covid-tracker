const geo = require('../../components/gis/geo/th-provinces-centroids.json')
const csv = require('csv-parser')
const fs = require('fs')
const { parse } = require('json2csv')
var census = []
fs.createReadStream('th-census-data.csv')
    .pipe(csv({headers: ['province','population','PROV_CODE']}))
    .on('data', (data) => {
        census.push(data)
    }).on('end',async()=>{
        for(const i in census){
            const province = census[i]
            const name = province['province']
            province['population'] = Number(province['population'].replace(/,/g,''))
            for(const j in geo['features']){
                const pSearch = geo['features'][j]['properties']['PROV_NAMT']
                if(pSearch === name){
                    census[i]['PROV_CODE'] = geo['features'][j]['properties']['PROV_CODE']
                    break
                } 
            }
        }
        const csv = await parse(census)
        fs.writeFileSync('th-census-data.json',JSON.stringify(census),'utf-8')
        fs.writeFileSync('th-census-data.csv',csv,'utf-8')
    })