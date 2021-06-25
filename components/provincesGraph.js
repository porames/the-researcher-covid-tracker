import React, { useState, useEffect } from 'react'
import build from './build_job.json'
import _ from 'lodash'
import chroma from 'chroma-js'
const images = build['images']
export default function Province(props) {
    const [showAll, setShowAll] = useState(false)
    const sortedImages = _.sortBy(images, 'total-14days').reverse()
    const scale = chroma.scale(['#bdd5cd', '#427165'])
    const maxCoverage = _.maxBy(sortedImages, 'vax-coverage')['vax-coverage']
    function parseChange(change) {
        if (change > 0) {
            return ('+' + parseInt(change) + '%')
        }
        else {
            return (parseInt(change) + '%')
        }

    }
    return (
        <div>
            <div className="table-responsive">
                <table className="table">
                    <thead className='text-white'>
                        <tr>
                            <th scope="col">จังหวัด</th>
                            <th scope="col">เส้นแนวโน้ม 14 วัน</th>
                            <th scope="col">ผู้ติดเชื้อในรอบ 14 วัน</th>
                            <th scope="col">ฉีดวัคซีนไปแล้ว</th>
                        </tr>
                    </thead>
                    <tbody className='text-sec'>
                        {
                            sortedImages.map((img, index) => {
                                if (index < (showAll ? sortedImages.length : 10)) {
                                    return (
                                        <tr key={index}>
                                            <th scope="row">{img['province']}</th>
                                            <td>
                                                <div className='d-flex justify-content-center align-items-center'>
                                                    <img height='30px' src={`/infection-graphs-build/${img.name}`} />
                                                    {img['total-14days'] > 10 ? parseChange(img['change']) : 'คงที่'}

                                                </div>
                                            </td>
                                            <td>{img['total-14days'].toLocaleString()}</td>
                                            <td>
                                                <div
                                                    style={{
                                                        backgroundColor: scale(img['vax-coverage'] / maxCoverage).hex(),
                                                        color: (img['vax-coverage'] / maxCoverage > 0.5 ? '#fff' : '#424242')
                                                    }}
                                                    className='badge badge-vaccination-scale'>
                                                    {img['vax-coverage']}%
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }

                            })
                        }
                    </tbody>
                </table>
                <button onClick={() => setShowAll(!showAll)} className='rounded table-toggle'>{showAll ? 'ย่อข้อมูล' : 'ดูทั้งหมด'}</button>
            </div>
        </div>
    )
}