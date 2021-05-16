import React from 'react'
import build from './build_job.json'
import _ from 'lodash'
const images = build['images']
export default function Province(props) {
    const sortedImages = _.sortBy(images, 'total-14days').reverse()
    return (
        <div className=''>
            <div class="table-responsive">
                <table class="table">
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
                                if (img['total-14days'] > 10) {
                                    return (
                                        <tr key={index}>
                                            <th scope="row">{img['province']}</th>
                                            <td><img height='30px' src={`/infection-graphs-build/${img.name}`} /> {img['change'] > 0 ? '+' : ''}{parseInt(img['change'])}%</td>
                                            <td>{img['total-14days'].toLocaleString()}</td>
                                            <td>{img['vax-coverage']}%</td>
                                        </tr>
                                    )
                                }
                                else {
                                    return (
                                        <tr key={index}>
                                            <th scope="row">{img['province']}</th>
                                            <td><img height='30px' src={`/infection-graphs-build/${img.name}`} /> คงที่</td>
                                            <td>{img['total-14days'].toLocaleString()}</td>
                                            <td>{img['vax-coverage']}%</td>
                                        </tr>
                                    )
                                }
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}