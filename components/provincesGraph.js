import React, { useState, useEffect } from 'react'
import build from './build_job.json'
import _ from 'lodash'
import chroma from 'chroma-js'
const images = build['images']
export default function Province(props) {
    const [showAll, setShowAll] = useState(false)
    const [provincesData, setData] = useState(undefined)
    const hotspotScale = chroma.scale(['#fafafa', '#FFFA6C', '#FFB14D', '#FF682D', '#a2322c', '#460c39']).domain([0, 0.01, 0.03, 0.05, 0.1, 1])
    const scale = chroma.scale(['#e6f7f1', '#b0cec3', '#7ba797', '#47816e', '#005c46'])
    const maxCoverage = _.maxBy(images, 'vax-coverage')['vax-coverage']
    function parseChange(change) {
        if (change > 0) {
            return ('+' + parseInt(change).toLocaleString() + '%')
        }
        else {
            return (parseInt(change).toLocaleString() + '%')
        }

    }
    useEffect(() => {
        var data = []
        images.map((province, index) => {
            data.push({
                ...province,
                'cases-per-100k': Math.floor(province['total-14days'] * 100000 / province['population'])
            })
        })
        data = _.sortBy(data, 'cases-per-100k').reverse()
        setData(data)
    }, [])
    return (
        <div>
            <div className='table-responsive'>
                <table className='table'>
                    <thead className='text-white'>
                        <tr>
                            <th scope='col'>จังหวัด</th>
                            <th scope='col' className='text-end'>ผู้ติดเชื้อในรอบ 14 วัน</th>
                            <th scope='col' className='text-end'>ต่อประชากร 100,000 คน</th>
                            <th scope='col' className='text-end'>เส้นแนวโน้ม 14 วัน</th>
                            <th scope='col' className='text-end'>ฉีดวัคซีนไปแล้ว</th>
                        </tr>
                    </thead>
                    <tbody className='text-sec'>
                        {
                            provincesData && provincesData.map((province, index) => {
                                if (index < (showAll ? provincesData.length : 10)) {
                                    return (
                                        <tr key={index}>
                                            <th scope='row'>{province['province']}</th>
                                            <td className='text-end'>{province['total-14days'].toLocaleString()}</td>
                                            <td className='text-end'>
                                                <div
                                                    style={{
                                                        backgroundColor: hotspotScale(province['cases-per-100k'] / 1000).hex(),
                                                        color: (province['cases-per-100k'] > 40 ? 'white' : 'black'),
                                                        minWidth: 50
                                                    }}
                                                    className='badge badge-vaccination-scale' >
                                                    {province['cases-per-100k'].toLocaleString()}
                                                </div>
                                            </td>
                                            <td className='text-end'>
                                                <div className='d-flex justify-content-end align-items-end w-100'>
                                                    <div className='pr-2'>
                                                        {province['total-14days'] > 10 ? parseChange(province['change']) : 'คงที่'}
                                                    </div>
                                                    <img height='30px' src={`/infection-graphs-build/${province.name}`} />

                                                </div>
                                            </td>
                                            <td className='text-end'>
                                                <div
                                                    style={{
                                                        backgroundColor: scale(province['vax-coverage'] / maxCoverage).hex(),
                                                        color: (province['vax-coverage'] / maxCoverage > 0.5 ? '#fff' : '#424242')
                                                    }}
                                                    className='badge badge-vaccination-scale'>
                                                    {province['vax-coverage']}%
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