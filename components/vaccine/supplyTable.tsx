import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import chroma from 'chroma-js'
import { sum } from 'd3'

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

const vaccinatedScale = chroma.scale(['#e6f7f1', '#b0cec3', '#7ba797', '#47816e', '#005c46'])
const Badge = (props) => (
    <div
        style={{
            backgroundColor: vaccinatedScale(props.coverage).hex(),
            color: (props.coverage > 0.5 ? 'white' : 'black'),
            width: 50
        }}
        className='badge badge-vaccination-scale' >
        {(props.coverage * 100).toFixed(1)}%
    </div>
)

const TableHeader = (props) => (
    <th
        scope='col'
        className='provice-table-header sort-table-th'
        onClick={() => props.sortChange(props.colId)}>
        <span className={`${props.sortData.column === props.colId ? props.sortData.direction : ''}`}>
            {props.text}
        </span>
    </th>
)

export default function SupplyTable(props) {
    const [showAll, setShowAll] = useState<boolean>(false)
    const [isDescSort, setIsDescSort] = useState(true)
    const [sortData, setSortData] = useState({
        column: 'reported_supply',
        direction: 'down'
    })
    var vaccination_by_manufacturer = props.province_vaccine_manufacturer.data
    var province_vaccination = props.province_vaccination.data
    var allocation_data = props.province_allocation
    allocation_data.map((province, index) => {
        const mf_data = _.find(vaccination_by_manufacturer, { 'province': province['province_name_th'] })
        const vaccination_data = _.find(province_vaccination, { 'province': province['province_name_th'] })
        const reported_supply = Number(province['Vac Allocated AstraZeneca']) + Number(province['Vac Allocated Sinovac'])
        const reported_doses_used = mf_data["Sinovac"] + mf_data["AstraZeneca"]
        allocation_data[index]['reported_supply'] = reported_supply
        allocation_data[index]['reported_doses_used'] = reported_doses_used
        allocation_data[index]['reported_doses_used_percentage'] = reported_doses_used / reported_supply
        allocation_data[index]['total_1st_dose'] = vaccination_data['total_1st_dose']
        allocation_data[index]['total_2nd_dose'] = vaccination_data['total_2nd_dose']
        allocation_data[index]['1st_dose_coverage'] = vaccination_data['total_1st_dose'] / province['population']
        allocation_data[index]['2nd_dose_coverage'] = vaccination_data['total_2nd_dose'] / province['population']
    })
    var national_sum = {}
    national_sum['reported_supply'] = sum(allocation_data, d => d['reported_supply'])
    national_sum['reported_doses_used'] = sum(allocation_data, d => d['reported_doses_used'])
    national_sum['total_1st_dose'] = sum(allocation_data, d => d['total_1st_dose'])
    national_sum['total_2nd_dose'] = sum(allocation_data, d => d['total_2nd_dose'])
    national_sum['total_population'] = sum(allocation_data, d => d['population'])

    const [provincesData, setData] = useState(undefined)
    function sortChange(column) {
        if (column == sortData.column) {
            setIsDescSort(!isDescSort)
        }
        setSortData({
            column: column,
            direction: isDescSort ? 'down' : 'up'
        })
    }

    useEffect(() => {
        allocation_data = _.sortBy(allocation_data, sortData.column)
        if (sortData.direction == 'down') {
            allocation_data.reverse()
        }
        setData(allocation_data)
    }, [sortData])


    return (
        <div>
            <h5 className='text-center'>ตารางแสดงข้อมูลการจัดสรรวัคซีนในแต่ละจังหวัดและร้อยละวัคซีนที่ใช้ไป</h5>
            <p className='text-center text-sec'>ข้อมูลการจัดส่งวัคซีนและวัคซีนคงเหลือมีรายงานเฉพาะข้อมูลวัคซีนหลักของรัฐบาล (Sinovac และ AstraZeneca) ยังไม่รวมวัคซีนทางเลือกจากผู้ผลิตอื่น</p>
            <div className='mt-4 table-responsive-xl'>
                <table className="table text-white table-theme-light w-100" style={{ minWidth: 400, fontSize: '90%' }}>
                    <thead>
                        <tr>
                            <th className='text-left' style={{ minWidth: 150 }} scope="col">จังหวัด</th>
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='reported_supply'
                                text='จำนวนวัคซีนที่ได้รับ'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='reported_doses_used'
                                text='จำนวนวัคซีนที่ฉีดแล้ว'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='reported_doses_used_percentage'
                                text='ใช้ไปร้อยละ'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='1st_dose_coverage'
                                text='ได้วัคซีนอย่างน้อย 1 โดส'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='2nd_dose_coverage'
                                text='ได้วัคซีนครบ'
                            />

                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ backgroundColor: "#333" }}>
                            <td className='text-left'>
                                <b>ทั้งประเทศ</b>
                            </td>
                            <td>
                                {national_sum['reported_supply'].toLocaleString()}
                            </td>
                            <td>
                                {national_sum['reported_doses_used'].toLocaleString()}
                            </td>
                            <td>
                                {Math.floor(national_sum['reported_doses_used'] * 100 / national_sum['reported_supply'])}%
                            </td>
                            <td>
                                <Badge coverage={national_sum['total_1st_dose'] / national_sum['total_population']} />
                            </td>
                            <td>
                                <Badge coverage={national_sum['total_2nd_dose'] / national_sum['total_population']} />
                            </td>
                        </tr>
                        {provincesData && provincesData.map((province, index) => {
                            if (index < (showAll ? provincesData.length : 10) && province.id !== '0') {
                                return (
                                    <tr key={index} className='text-sec'>
                                        <td className='text-left'>
                                            <b>{province["province_name_th"]}</b>
                                        </td>
                                        <td>
                                            {province['reported_supply'].toLocaleString()}
                                        </td>
                                        <td>
                                            {province['reported_doses_used'].toLocaleString()}
                                        </td>
                                        <td>
                                            {Math.floor(province['reported_doses_used'] * 100 / province['reported_supply'])}%
                                        </td>
                                        <td>
                                            <Badge coverage={province['1st_dose_coverage']} />
                                        </td>
                                        <td>
                                            <Badge coverage={province['2nd_dose_coverage']} />
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