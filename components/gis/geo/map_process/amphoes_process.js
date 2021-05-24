const fs = require('fs')
const centroids = require('../th-map-amphoes.json')
const _ = require('lodash')
try {
    const data = fs.readFileSync('../th-map-amphoes-shape.geojson', 'utf8')
    var geo = JSON.parse(data)
    for(const i in geo['features']){
        const amphoe = geo['features'][i]
        const aName = amphoe['properties']['A_NAME_T']
        geo['features'][i]['properties']['fid'] = Number(centroids['features'][i]['properties']['fid'])
        geo['features'][i]['properties']['id'] = Number(centroids['features'][i]['properties']['fid'])
        geo['features'][i]['properties']['centroid'] = centroids['features'][i]['geometry']['coordinates']    
    }
    fs.writeFileSync('../th-map-amphoes-shape-with-centroids-id.json', JSON.stringify(geo), 'utf-8')
} catch (err) {
    console.error(err)
}