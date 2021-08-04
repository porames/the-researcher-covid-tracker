import axios from 'axios'

const STORAGE_PATH = "https://raw.githubusercontent.com/wiki/porames/the-researcher-covid-data"
export async function getNationalStats() {
    var req = await axios.get(`${STORAGE_PATH}/cases/national-timeseries.json`)
    return req.data
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
    return req.data
}

/*
export async function getVaccineSupply() {
    var req = await axios.get(`${STORAGE_PATH}/vaccination/provincial-vaccine-supply.json`)
    return req.data
}

export async function getTestingData() {
    var req = await axios.get(`${STORAGE_PATH}/cases/testing-data.json`)
    return req.data
}
*/
