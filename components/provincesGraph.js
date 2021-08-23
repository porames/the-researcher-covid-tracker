import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import chroma from 'chroma-js'


const TableHeader = (props) => (
    <th
        scope='col'
        className={`provice-table-header sort-table-th ${props.spacing && 'col-spacing'}`}
        style={{ minWidth: 80 }}
        onClick={() => props.sortChange(props.colId)}
    >
        <span className={`${props.sortData.column === props.colId ? props.sortData.direction : ''}`}>
            {props.text}
        </span>
    </th>
)

export default function Province(props) {
    const [showAll, setShowAll] = useState(false)
    const [isDescSort, setIsDescSort] = useState(true)
    const provinceGraphs = props.province_graphs['dataset']
    provinceGraphs.map((province, index) => {
        provinceGraphs[index]['deaths_per_100k'] = province['deaths_total_14days'] * 100000 / province['population']
    })
    const [sortData, setSortData] = useState({
        column: 'cases_per_100k',
        direction: 'down'
    })

    const [provincesData, setData] = useState(undefined)
    const hotspotScale = chroma.scale(['#fafafa', '#FFFA6C', '#FFB14D', '#FF682D', '#a2322c', '#460c39']).domain([0, 0.01, 0.03, 0.05, 0.1, 1])
    const deathsScale = chroma.scale(['#fafafa', '#424242']).domain([0, 10])
    const scale = chroma.scale(['#e6f7f1', '#b0cec3', '#7ba797', '#47816e', '#005c46'])
    const maxCoverage = _.maxBy(provinceGraphs, 'vax_1st_dose_coverage')['vax_1st_dose_coverage']
    function parseChange(change) {
        if (change > 0) {
            return ('+' + parseInt(change).toLocaleString() + '%')
        }
        else {
            return (parseInt(change).toLocaleString() + '%')
        }

    }

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
        var data = []
        provinceGraphs.map((province, index) => {
            data.push({
                ...province,
                'cases_per_100k': Math.floor(province['total_14days'] * 100000 / province['population'])
            })
        })
        data = _.sortBy(data, sortData.column)
        if (sortData.direction == 'down') {
            data.reverse()
        }
        setData(data)
    }, [sortData])
    const STORAGE_PATH = "https://raw.githubusercontent.com/wiki/porames/the-researcher-covid-data/cases/infection-graphs-build"
    return (
        <div>
            <div className='table-responsive-md'>
                <table className='table table-theme-light' style={{ fontSize: '90%' }}>
                    <thead className='text-white'>
                        <tr>
                            <th scope='col' className='provice-table-header'>จังหวัด</th>
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='total_14days'
                                text='ผู้ติดเชื้อในรอบ 14 วัน'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='cases_per_100k'
                                text='ต่อประชากร 100,000 คน'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='change'
                                text='เส้นแนวโน้ม 14 วัน'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='deaths_total_14days'
                                text='ผู้เสียขีวิตในรอบ 14 วัน'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='deaths_per_100k'
                                text='ต่อประชากร 100,000 คน'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='vax_2nd_dose_coverage'
                                text='ฉีดวัคซีนครบแล้ว'
                            />
                        </tr>
                    </thead>
                    <tbody className='text-sec'>
                        {
                            provincesData && provincesData.map((province, index) => {
                                if (index < (showAll ? provincesData.length : 10)) {
                                    return (
                                        <tr key={index}>
                                            <td scope='row' className='text-left'>
                                                <b>{province['province']}</b>
                                            </td>
                                            <td>{province['total_14days'].toLocaleString()}</td>
                                            <td >
                                                <div
                                                    style={{
                                                        backgroundColor: hotspotScale(province['cases_per_100k'] / 1000).hex(),
                                                        color: (province['cases_per_100k'] > 40 ? 'white' : 'black')
                                                    }}
                                                    className='badge badge-vaccination-scale' >
                                                    {province['cases_per_100k'].toLocaleString()}
                                                </div>
                                            </td>
                                            <td className='col-spacing'>
                                                <div className='d-flex justify-content-end align-items-end w-100'>
                                                    <div className='pr-2'>
                                                        {parseChange(province['change'])}
                                                    </div>
                                                    <img height='30px' src={`${STORAGE_PATH}/${province.graph_path}`} />
                                                </div>
                                            </td>
                                            <td className='text-end'>
                                                {province['deaths_total_14days'].toLocaleString()}
                                            </td>
                                            <td className='text-end col-spacing'>
                                                <div
                                                    style={{
                                                        backgroundColor: deathsScale(province['deaths_total_14days'] * 100000 / province['population']).hex(),
                                                        color: ((province['deaths_total_14days'] * 100000 / province['population']) >= 5 ? '#fff' : '#424242'),
                                                    }}
                                                    className='badge badge-vaccination-scale'>
                                                    {(province['deaths_total_14days'] * 100000 / province['population']).toFixed(1)}
                                                </div>

                                            </td>
                                            <td className='text-end'>
                                                <div
                                                    style={{
                                                        backgroundColor: scale(province['vax_2nd_dose_coverage'] / maxCoverage).hex(),
                                                        color: (province['vax_2nd_dose_coverage'] / maxCoverage > 0.5 ? '#fff' : '#424242')
                                                    }}

                                                    className='badge badge-vaccination-scale'>
                                                    {Number(province['vax_2nd_dose_coverage']).toFixed(1)}%
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }

                            })
                        }
                    </tbody>
                </table>
            </div>
            <div className='w-100'>
                <button onClick={() => setShowAll(!showAll)} className='rounded table-toggle'>{showAll ? 'ย่อข้อมูล' : 'ดูทั้งหมด'}</button>
            </div>
        </div>
    )
}