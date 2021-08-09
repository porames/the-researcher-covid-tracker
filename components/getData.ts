import axios from 'axios'
import _ from 'lodash'
import { calculate_coverage } from './vaccine/util'
import provincesData from './gis/data/th-census-with-hidden-pop.json'
import Papa from 'papaparse'

const STORAGE_PATH = "https://raw.githubusercontent.com/wiki/porames/the-researcher-covid-data"
const STORAGE_PATH_2 = "https://raw.githubusercontent.com/wiki/noppakorn/ddc-dashboard-scraping"

export async function GetProvinceVacAllocation() {
    var req = await axios.get(`${STORAGE_PATH}/vaccination/vaccine-delivery.json`)
    return req.data.data
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
