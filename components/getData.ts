import axios from 'axios'
import _ from 'lodash'
import { calculate_coverage } from './vaccine/util'
import provincesData from './gis/data/th-census-with-hidden-pop.json'
import Papa from 'papaparse'

const STORAGE_PATH = "https://raw.githubusercontent.com/wiki/porames/the-researcher-covid-data"
const STORAGE_PATH_2 = "https://raw.githubusercontent.com/wiki/noppakorn/ddc-dashboard-scraping"
const STORAGE_DJAY = "https://raw.githubusercontent.com/wiki/djay/covidthailand/"

export async function GetVacTimeline() {
    var req = await axios.get(`${STORAGE_DJAY}/vac_timeline.csv`)
    const dataset = Papa.parse(req.data, {
        header: true,
        skipEmptyLines: true
    }).data
    const latest_data = dataset[dataset.length - 1]
    return latest_data
}

export async function GetProvinceVacAllocation() {
    var req = await axios.get(`${STORAGE_DJAY}/vaccinations.csv`)
    const dataset = Papa.parse(req.data, {
        header: true,
        skipEmptyLines: true
    }).data
    const latest_date = dataset[dataset.length - 1]["Date"]
    const latest_data = _.filter(dataset, { "Date": latest_date })
    latest_data.map((province, index) => {
        const geoData = _.find(provincesData, { 'clean-name': province.Province.replace(/\s/g, '').toUpperCase() })
        latest_data[index]["province_name_th"] = geoData["province"]
        latest_data[index]["population"] = geoData["estimated_living_population"] ? geoData["estimated_living_population"] : geoData["population"]
    })

    return latest_data

}

export async function getNationalStats() {
    var req = await axios.get(`${STORAGE_PATH_2}/dataset/national-timeseries.json`)
    var dataset = req.data
    dataset = dataset.filter(data => {
        return new Date(data.date) >= new Date("01/01/2021")
    })
    return dataset
}

export async function getProvinceData() {
    var req = await axios.get(`${STORAGE_PATH}/cases/province-cases-data-14days.json`)
    return req.data
}

export async function getDistrictData() {
    var req = await axios.get(`${STORAGE_PATH}/cases/district-cases-data-14days.json`)
    return req.data
}

export async function getVaccineStats() {
    var req = await axios.get(`${STORAGE_PATH}/vaccination/national-vaccination-timeseries.json`)
    return req.data
}

export async function getProvinceVaccination() {
    var req = await axios.get(`${STORAGE_PATH}/vaccination/provincial-vaccination.json`)
    const data = calculate_coverage(req.data)

    return data
}

export async function getVaccineManufacturer() {
    var req = await axios.get(`${STORAGE_PATH}/vaccination/vaccine-manufacturer-timeseries.json`)
    return req.data
}

export async function getProvinceVaccinationByManufacturer() {
    var req = await axios.get(`${STORAGE_PATH}/vaccination/provincial-vaccination-by-manufacturer.json`)
    return req.data
}

export async function getProvinceGraphs() {
    var req = await axios.get(`${STORAGE_PATH}/cases/build_job.json`)
    return req.data
}

export async function getTestingData() {
    var req = await axios.get(`${STORAGE_PATH}/cases/testing-data.json`)
    return req.data
}

/*
export async function getVaccineSupply() {
    var req = await axios.get(`${STORAGE_PATH}/vaccination/provincial-vaccine-supply.json`)
    return req.data
}


*/
