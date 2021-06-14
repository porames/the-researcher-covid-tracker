const fs = require('fs')
const csv = require('csv-parser')
const _ = require('lodash')
const { parse } = require('json2csv')
var pop = require('../th-census-data.json')
var census = []
fs.createReadStream('unregistered-population.csv')
    .pipe(csv())
    .on('data', (data) => {
        const query = _.findIndex(pop, { 'province': data.province })
        if (query >= 0) {
            if (data['estimated_hidden_population_daytime']) {
                pop[query]['estimated_living_population'] = Number(pop[query]['population']) + Number(data['estimated_hidden_population_overnight']) + Number(data['estimated_hidden_population_daytime'])
            }
            else {

            } pop[query]['estimated_living_population'] = Number(pop[query]['population']) + Number(data['estimated_hidden_population_overnight'])
        }
    }).on('end', async () => {
        fs.writeFileSync('../th-census-with-hidden-pop.json',JSON.stringify(pop),'utf-8')
    })