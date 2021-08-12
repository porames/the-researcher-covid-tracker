import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import populationData from '../gis/data/national-population-age-group.json'
import { number } from 'prop-types'

type AgeGroupVaccination = {
    "update_date": string,
    "total_1st_dose": {
        "<18": number,
        "18-40": number,
        "40-60": number,
        "60-80": number,
        ">80": number
    },
    "total_2nd_dose": {
        "<18": number,
        "18-40": number,
        "40-60": number,
        "60-80": number,
        ">80": number
    },
    "total_3rd_dose": {
        "<18": number,
        "18-40": number,
        "40-60": number,
        "60-80": number,
        ">80": number
    }
}

const ProgressBar = (props) => (
    <div className='d-flex align-items-center justify-content-between'>
        <div style={{ width: 50, textAlign: 'end', marginRight: 15 }}>
            <b>{Math.round(props.percentage)}%</b>
        </div>
        <div className='doses-progress'>
            <div className='doses-bar' style={{ width: `${props.percentage}%` }}></div>
        </div>
    </div>
)

export default function VaccinationByAge(props) {
    const vaccination_by_age: AgeGroupVaccination = props.vaccination_by_age
    var national_sum = props.vaccination_timeseries[props.vaccination_timeseries.length - 1]
    national_sum["population"] = populationData["<18"] + populationData["18-40"] + populationData["40-60"] + populationData["60-80"] + populationData[">80"]
    return (
        <div className='mx-auto text-center container' style={{ maxWidth: 700 }}>
            <h2>ความคืบหน้าการฉีดวัคซีนตามช่วงอายุ</h2>
            <div className='table-responsive'>
                <table className="table table-theme-light mt-2 text-white text-left">
                    <thead>
                        <tr>
                            <th scope="col"></th>
                            <th scope="col" style={{ width: '39%' }}>ได้รับวัคซีนอย่างน้อย 1 เข็ม</th>
                            <th scope="col" style={{ width: '39%' }}>ได้รับวัคซีนครบ 2 เข็ม</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className='text-sec' style={{ backgroundColor: '#333' }}>
                            <td className='text-left' style={{ minWidth: 100 }}>
                                ทุกช่วงอายุ
                            </td>
                            <td>
                                <ProgressBar percentage={national_sum["first_dose"] * 100 / national_sum["population"]} />
                            </td>
                            <td>
                                <ProgressBar percentage={national_sum["second_dose"] * 100 / national_sum["population"]} />
                            </td>
                        </tr>
                        <tr className='text-sec'>
                            <td className='text-left' style={{ minWidth: 100 }}>
                                อายุ 18-40 ปี
                            </td>
                            <td>
                                <ProgressBar percentage={(vaccination_by_age["total_1st_dose"]["18-20"] + vaccination_by_age["total_1st_dose"]["21-40"]) * 100 / populationData["18-40"]} />
                            </td>
                            <td>
                                <ProgressBar percentage={(vaccination_by_age["total_2nd_dose"]["18-20"] + vaccination_by_age["total_2nd_dose"]["21-40"]) * 100 / populationData["18-40"]} />
                            </td>
                        </tr>
                        <tr className='text-sec'>
                            <td className='text-left' style={{ minWidth: 100 }}>
                                อายุ 40-60 ปี
                            </td>
                            <td>
                                <ProgressBar percentage={(vaccination_by_age["total_1st_dose"]["41-60"]) * 100 / populationData["40-60"]} />
                            </td>
                            <td>
                                <ProgressBar percentage={(vaccination_by_age["total_2nd_dose"]["41-60"]) * 100 / populationData["40-60"]} />
                            </td>
                        </tr>
                        <tr className='text-sec'>
                            <td className='text-left' style={{ minWidth: 100 }}>
                                อายุ 60-80 ปี
                            </td>
                            <td>
                                <ProgressBar percentage={(vaccination_by_age["total_1st_dose"]["61-80"]) * 100 / populationData["60-80"]} />
                            </td>
                            <td>
                                <ProgressBar percentage={(vaccination_by_age["total_2nd_dose"]["61-80"]) * 100 / populationData["60-80"]} />
                            </td>
                        </tr>
                        <tr className='text-sec'>
                            <td className='text-left' style={{ minWidth: 100 }}>
                                อายุมากกว่า 80 ปี
                            </td>
                            <td>
                                <ProgressBar percentage={(vaccination_by_age["total_1st_dose"][">80"]) * 100 / populationData[">80"]} />
                            </td>
                            <td>
                                <ProgressBar percentage={(vaccination_by_age["total_2nd_dose"][">80"]) * 100 / populationData[">80"]} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}