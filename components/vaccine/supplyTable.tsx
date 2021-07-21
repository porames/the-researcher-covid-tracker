import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import provincesData from '../gis/data/provincial-vaccination-data_2.json'
import moment from 'moment'
import { usePopperTooltip } from 'react-popper-tooltip';
import { sum, mean } from 'd3'

interface ProvinceProps {
    "name": string;
    "id": string;
    "population": number;
    "registered_population": number;
    "total_doses": number;
    "total-1st-dose"?: number;
    "total-2nd-dose"?: number;
    "total-supply"?: number;
}
export default function SupplyTable() {
    const [showAll, setShowAll] = useState<boolean>(false)
    var data: ProvinceProps[] = _.cloneDeep(provincesData)['data']
    const population = sum(data, (d) => d["registered_population"])
    const supplyCum = sum(data, (d) => d["total-supply"])
    const dosesCum = sum(data, (d) => d["total_doses"])
    data = _.sortBy(data, 'total-supply').reverse()
    data.unshift({
        "name": "ทั่วประเทศ",
        "id": "0",
        "population": population,
        "registered_population": population,
        "total-supply": supplyCum,
        "total_doses": dosesCum,

    })

    return (
        <div>
            <h5 className='text-center'>ตารางแสดงข้อมูลการจัดสรรวัคซีนในแต่ละจังหวัดและร้อยละวัคซีนที่ใช้ไป</h5>
            <div className='table-responsive mt-3'>
                <table className="table text-white w-100" style={{ minWidth: 400 }}>
                    <thead>
                        <tr>
                            <th scope="col">จังหวัด</th>
                            <th scope="col">จำนวนวัคซีนที่ได้รับ</th>
                            <th scope="col">จำนวนวัคซีนที่ฉีดแล้ว</th>
                            <th scope="col">ใช้ไปร้อยละ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((province, index) => {
                            if (index < (showAll ? data.length : 10)) {
                                return (
                                    <tr key={index} className={index == 0 ? 'text-white' : 'text-sec'} style={{ backgroundColor: index == 0 ? "#333" : "inherit" }}>
                                        <td>
                                            <b>{province.name}</b>
                                        </td>
                                        <td>
                                            {province['total-supply'].toLocaleString()}
                                        </td>
                                        <td>
                                            {province['total_doses'].toLocaleString()}
                                        </td>
                                        <td>
                                            {Math.floor(province['total_doses'] * 100 / province['total-supply'])}%
                                        </td>
                                    </tr>
                                )
                            }
                        })
                        }
                    </tbody>
                </table>
            </div>
            <button onClick={() => setShowAll(!showAll)} className='rounded table-toggle'>{showAll ? 'ย่อข้อมูล' : 'ดูทั้งหมด'}</button>
        </div>
    )
}