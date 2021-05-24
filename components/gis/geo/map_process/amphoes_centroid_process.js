const fs = require('fs')
const centroids = require('../th-map-amphoes.json')
const _ = require('lodash')
try {
    var geo = centroids
    for(const i in geo['features']){
        const amphoe = geo['features'][i]
        delete geo['features'][i]['properties']['COUNT']
        geo['features'][i]['properties']['centroid'] = amphoe['geometry']['coordinates']
        geo['features'][i]['properties']['id'] = amphoe['properties']['fid']
    }
    fs.writeFileSync('../th-map-amphoes-points-with-centroids-id.json', JSON.stringify(geo), 'utf-8')
} catch (err) {
    console.error(err)
}