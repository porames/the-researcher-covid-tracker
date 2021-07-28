import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import chroma from 'chroma-js'
import dataset from '../gis/data/provincial-vaccination-data_2.json'

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

const Badge = (props) => (
    <div
        style={{
            backgroundColor: props.vaccinatedScale(props.coverage).hex(),
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
        style={{ whiteSpace: 'nowrap' }}
        onClick={() => props.sortChange(props.colId)}>
        <span className={`${props.sortData.column === props.colId ? props.sortData.direction : ''}`}>
            {props.text}
        </span>
    </th>
)

export default function SupplyTable() {
    const [showAll, setShowAll] = useState<boolean>(false)
    const [isDescSort, setIsDescSort] = useState(true)
    const [sortData, setSortData] = useState({
        column: 'total-supply',
        direction: 'down'
    })
    var data: ProvinceProps[] = _.cloneDeep(dataset)['data']
    data.map((province, index) => {
        data[index]['1st-dose-coverage'] = province['total-1st-dose'] / province.population
        data[index]['2nd-dose-coverage'] = province['total-2nd-dose'] / province.population
        data[index]['doses-used'] = province['total_doses'] * 100 / province['total-supply']
    })
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
        data = _.sortBy(data, sortData.column)
        if (sortData.direction == 'down') {
            data.reverse()
        }
        setData(data)
    }, [sortData])
    const vaccinatedScale = chroma.scale(['#e6f7f1', '#b0cec3', '#7ba797', '#47816e', '#005c46'])
    const nationalAvg = _.find(data, { id: '0' })
    return (
        <div>
            <h5 className='text-center'>ตารางแสดงข้อมูลการจัดสรรวัคซีนในแต่ละจังหวัดและร้อยละวัคซีนที่ใช้ไป</h5>
            <div className='mt-3 table-responsive-xl'>
                <table className="table text-white table-theme-light w-100" style={{ minWidth: 400, fontSize: '90%' }}>
                    <thead>
                        <tr>
                            <th className='text-left' style={{ minWidth: 150 }} scope="col">จังหวัด</th>
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='total-supply'
                                text='จำนวนวัคซีนที่ได้รับ'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='total_doses'
                                text='จำนวนวัคซีนที่ฉีดแล้ว'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='doses-used'
                                text='ใช้ไปร้อยละ'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='1st-dose-coverage'
                                text='ได้วัคซีนอย่างน้อย 1 โดส'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='2nd-dose-coverage'
                                text='ได้วัคซีนครบ'
                            />

                        </tr>
                    </thead>
                    <tbody>
                        <tr className='text-white' style={{ backgroundColor: "#333" }}>
                            <td className='text-left'>
                                <b>{nationalAvg.name}</b>
                            </td>
                            <td>
                                {nationalAvg['total-supply'].toLocaleString()}
                            </td>
                            <td>
                                {nationalAvg['total_doses'].toLocaleString()}
                            </td>
                            <td>
                                {Math.round(nationalAvg['total_doses'] * 100 / nationalAvg['total-supply'])}%
                            </td>
                            <td>
                                <Badge vaccinatedScale={vaccinatedScale} coverage={nationalAvg['1st-dose-coverage']}></Badge>
                            </td>
                            <td>
                                <Badge vaccinatedScale={vaccinatedScale} coverage={nationalAvg['2nd-dose-coverage']}></Badge>
                            </td>
                        </tr>
                        {provincesData && provincesData.map((province, index) => {

                            if (index < (showAll ? provincesData.length : 10) && province.id !== '0') {
                                return (
                                    <tr key={index} className='text-sec'>
                                        <td className='text-left'>
                                            <b>{province.name}</b>
                                        </td>
                                        <td>
                                            {province['total-supply'].toLocaleString()}
                                        </td>
                                        <td>
                                            {province['total_doses'].toLocaleString()}
                                        </td>

                                        <td>
                                            {Math.round(province['total_doses'] * 100 / province['total-supply'])}%
                                        </td>
                                        <td>
                                            <Badge vaccinatedScale={vaccinatedScale} coverage={province['1st-dose-coverage']}></Badge>
                                        </td>
                                        <td>
                                            <Badge vaccinatedScale={vaccinatedScale} coverage={province['2nd-dose-coverage']}></Badge>
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